import firebaseAdmin from "firebase-admin";
import fs from "fs";

let firebaseApp;

function setupFirebaseApp() {
  let serviceAccountJSON = null;
  const GAPP_CRED_FILE =
    process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.GAPP_CRED_FILE;
  if (GAPP_CRED_FILE) {
    serviceAccountJSON = JSON.parse(fs.readFileSync(GAPP_CRED_FILE, "utf8"));
  } else if (process.env.GAPP_CRED_JSON) {
    serviceAccountJSON = JSON.parse(process.env.GAPP_CRED_JSON);
  }

  if (!serviceAccountJSON) {
    process.exit(1);
  }

  firebaseApp = firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert(serviceAccountJSON),
  });
}

function getFirebaseApp() {
  return firebaseApp;
}

export { setupFirebaseApp, getFirebaseApp };
