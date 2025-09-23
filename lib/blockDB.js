// Import Firebase SDK
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB7I-J4DfQCimk_JlmEWrpvuSygHaxweg8",
  authDomain: "vcfweb-9bd1f.firebaseapp.com",
  databaseURL: "https://vcfweb-9bd1f-default-rtdb.firebaseio.com",
  projectId: "vcfweb-9bd1f",
  storageBucket: "vcfweb-9bd1f.firebasestorage.app",
  messagingSenderId: "204316192596",
  appId: "1:204316192596:web:61999e27f62da3a170a2c1",
  measurementId: "G-ZESG4CTQLZ" // ✅ Analytics এর জন্য দরকারি
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics (optional)
const analytics = getAnalytics(app);
