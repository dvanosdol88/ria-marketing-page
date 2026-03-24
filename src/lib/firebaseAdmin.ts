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

    // Vercel's env var UI converts \n escape sequences into actual newlines.
    // Parse the JSON with those real newlines replaced, then restore the
    // private key's newlines which PEM format requires.
    const sanitized = serviceAccountJson.replace(/\n/g, "\\n");
    const serviceAccount = JSON.parse(sanitized) as ServiceAccount & { private_key?: string };
    if (serviceAccount.private_key) {
      serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");
    }
    initializeApp({ credential: cert(serviceAccount) });
  }

  _db = getFirestore();
  return _db;
}
