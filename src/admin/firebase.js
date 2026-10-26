import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// These are the public web-app settings from the Firebase console. They are not secrets:
// what protects the data is firestore.rules (only listed admins can write).
const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
export const configured = Boolean(apiKey && projectId);
const app = configured ? initializeApp({
  apiKey,
  projectId,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || `${projectId}.firebaseapp.com`,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}) : null;
export const auth = app && getAuth(app);
export const db = app && getFirestore(app);
// Set to "extension" once the "Trigger Email from Firestore" extension is installed (see ADMIN-SETUP.md).
export const canSendEmail = import.meta.env.VITE_NEWSLETTER_SENDER === 'extension';
