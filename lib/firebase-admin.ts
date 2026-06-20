import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

function getAdminApp(): App {
  if (getApps().length) return getApps()[0];

  // If a service account JSON is provided via env, use it. Otherwise fall
  // back to default credentials (e.g., GOOGLE_APPLICATION_CREDENTIALS or
  // metadata service on GCP). This avoids failing the build when the
  // env var is not present during build-time.
  const raw = process.env.FIREBASE_ADMIN_SDK_KEY;
  if (raw) {
    try {
      const serviceAccount = JSON.parse(raw);
      // Ensure the parsed object looks like a service account with project_id
      if (serviceAccount && typeof serviceAccount.project_id === "string") {
        return initializeApp({
          credential: cert(serviceAccount),
          projectId: process.env.FIREBASE_PROJECT_ID || serviceAccount.project_id,
        });
      }
      // If parsed object is not valid, fall through to default init.
    } catch (e) {
      // Invalid JSON in env var — fall back to default initialization.
      // Logging at build time isn't necessary here; the runtime environment
      // should provide valid credentials.
    }
  }

  // Default initialization: uses application default credentials.
  return initializeApp();
}

export const adminDb = getFirestore(getAdminApp());