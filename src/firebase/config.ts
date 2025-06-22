import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC6lR9z8ReB9uKlwCiWeY1GqtoTS1uqVjA",
  authDomain: "suppsportweb.firebaseapp.com",
  projectId: "suppsportweb",
  storageBucket: "suppsportweb.firebasestorage.app",
  messagingSenderId: "560957893313",
  appId: "1:560957893313:web:91eadfa02067cde42dc240",
  measurementId: "G-CJ0PBGQMH9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
export default app;