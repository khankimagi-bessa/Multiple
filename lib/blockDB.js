// firebase.js
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyB7I-J4DfQCimk_JlmEWrpvuSygHaxweg8",
  authDomain: "vcfweb-9bd1f.firebaseapp.com",
  databaseURL: "https://vcfweb-9bd1f-default-rtdb.firebaseio.com",
  projectId: "vcfweb-9bd1f",
  storageBucket: "vcfweb-9bd1f.firebasestorage.app",
  messagingSenderId: "204316192596",
  appId: "1:204316192596:web:61999e27f62da3a170a2c1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export needed services
const db = getDatabase(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { app, db, auth, storage };
