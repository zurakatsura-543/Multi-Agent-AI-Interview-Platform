import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { initializeApp, cert, getApps } from "firebase-admin/app";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const getServiceAccount = () => {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
    return JSON.parse(
      Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, "base64").toString("utf8")
    );
  }

  if (
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY
  ) {
    return {
      project_id: process.env.FIREBASE_PROJECT_ID,
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    };
  }

  const localKeyPath = path.join(__dirname, "../serviceAccountKey.json");

  if (fs.existsSync(localKeyPath)) {
    return JSON.parse(fs.readFileSync(localKeyPath, "utf8"));
  }

  throw new Error(
    "Firebase credentials are missing. Set FIREBASE_SERVICE_ACCOUNT_BASE64 or FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY."
  );
};

export const app = getApps().length
  ? getApps()[0]
  : initializeApp({
      credential: cert(getServiceAccount()),
    });
