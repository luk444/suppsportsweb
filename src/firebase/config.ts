import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAohShqIRa-QjUlnu9RL6gLNjvXmNf1A4o",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "automaniacos-36e9b.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "automaniacos-36e9b",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "automaniacos-36e9b.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1005417606042",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1005417606042:web:941d82a327890c4e066823",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
export default app;