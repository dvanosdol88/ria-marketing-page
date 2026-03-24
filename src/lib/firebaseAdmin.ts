import { initializeApp, getApps, cert, type ServiceAccount } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

let _db: Firestore | null = null;

// Lazy initialization — only connects when first API call hits, not at build time
export function getAdminDb(): Firestore {
  if (_db) return _db;

  if (getApps().length === 0) {
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (!serviceAccountJson) {
      throw new Error(
        "FIREBASE_SERVICE_ACCOUNT_KEY env var is missing. " +
        "Generate a service account key from Firebase Console > Project Settings > Service Accounts."
      );
    }

    // Try parsing as-is first (works locally with properly escaped JSON).
    // If that fails (Vercel expands \n to real newlines), fall back to
    // replacing real newlines then restoring them in the private key.
    let serviceAccount: ServiceAccount & { private_key?: string };
    try {
      serviceAccount = JSON.parse(serviceAccountJson);
    } catch {
      const sanitized = serviceAccountJson.replace(/\n/g, "\\n");
      serviceAccount = JSON.parse(sanitized);
    }
    // Vercel's UI may wrap long lines, inserting extra whitespace into the
    // PEM headers/body (e.g. "PRIVATE   \n  KEY"). Strip everything that
    // isn't base64 and rebuild a clean PEM.
    let privateKey = serviceAccount.private_key || (serviceAccount as any).privateKey;
    if (privateKey) {
      // Remove literal '\n' strings and all actual whitespace
      const flat = privateKey.replace(/\\n/g, "").replace(/\s/g, "");
      // Extract everything between the BEGIN and END markers
      const match = flat.match(/-+BEGIN[^-]+-+([^-]+)-+END[^-]+-+/i);
      if (match && match[1]) {
        const base64 = match[1];
        privateKey =
          "-----BEGIN PRIVATE KEY-----\n" +
          (base64.match(/.{1,64}/g)?.join("\n") ?? base64) +
          "\n-----END PRIVATE KEY-----\n";
      }
    }

    initializeApp({
      credential: cert({
        projectId: serviceAccount.project_id || (serviceAccount as any).projectId,
        clientEmail: serviceAccount.client_email || (serviceAccount as any).clientEmail,
        privateKey: privateKey,
      }),
    });
  }

  _db = getFirestore();
  return _db;
}
