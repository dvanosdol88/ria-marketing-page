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

    // Vercel's UI often "pretty-prints" long JSON env vars, inserting real
    // newlines and indentation spaces into the middle of field values.
    // We strip all real newlines and their subsequent indentation.
    const sanitizedJson = serviceAccountJson.replace(/\n\s*/g, "");
    
    let serviceAccount: any;
    try {
      serviceAccount = JSON.parse(sanitizedJson);
    } catch (e) {
      // Fallback: try re-escaping if it was a different mangling
      const reEscaped = serviceAccountJson.replace(/\n/g, "\\n");
      serviceAccount = JSON.parse(reEscaped);
    }

    // Vercel's UI may wrap long lines or expand \n, inserting extra whitespace
    // into the PEM. We extract only the base64 characters and rebuild a clean PEM.
    const sa = serviceAccount;
    let rawPk = sa.private_key || sa.privateKey;
    if (rawPk) {
      // 1. Remove literal '\n' strings and headers/footers
      const noHeaders = rawPk
        .replace(/\\n/g, "")
        .replace(/-+BEGIN[\s\S]*?KEY-+/i, "")
        .replace(/-+END[\s\S]*?KEY-+/i, "");
      
      // 2. Strip EVERY character that isn't a valid Base64 character
      const base64 = noHeaders.replace(/[^A-Za-z0-9+/=]/g, "");
      
      // 3. Rebuild with proper 64-char line breaks
      rawPk = "-----BEGIN PRIVATE KEY-----\n" +
              (base64.match(/.{1,64}/g)?.join("\n") ?? base64) +
              "\n-----END PRIVATE KEY-----\n";
    }

    const certConfig = {
      projectId: sa.project_id || sa.projectId,
      clientEmail: sa.client_email || sa.clientEmail,
      privateKey: rawPk,
    };

    initializeApp({
      credential: cert(certConfig),
      projectId: certConfig.projectId,
    });
  }

  _db = getFirestore();
  return _db;
}
