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
    if (serviceAccount.private_key && !serviceAccount.private_key.includes("\n")) {
      serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");
    }
    initializeApp({ credential: cert(serviceAccount) });
  }

  _db = getFirestore();
  return _db;
}
