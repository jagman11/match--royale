import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCTcDV7gP22r4Lx58vrAfeYnG5co7gkbSc",
  authDomain: "collegedatingapp-5676e.firebaseapp.com",
  projectId: "collegedatingapp-5676e",
  storageBucket: "collegedatingapp-5676e.firebasestorage.app",
  messagingSenderId: "346730482098",
  appId: "1:346730482098:web:f4f88c1b37e3002d5b3cab",
  measurementId: "G-XC71RRFF6Y"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const realtimeDb = getDatabase(app);

// Monitor authentication state (user signed in or out)
onAuthStateChanged(auth, (user) => {
  if (user) {
    const uid = user.uid;
    console.log("User is signed in with UID:", uid);
  } else {
    console.log("No user is signed in.");
  }
});

// Function to create a new user with email and password
const createNewUser = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log("User signed up:", user);
  } catch (error) {
    const errorCode = error.code;
    const errorMessage = error.message;
    console.error("Error signing up:", errorCode, errorMessage);
  }
};

// Function to sign in a user with email and password
const signInUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log("User signed in:", user);
  } catch (error) {
    const errorCode = error.code;
    const errorMessage = error.message;
    console.error("Error signing in:", errorCode, errorMessage);
  }
};

// Function to sign out the user
const signOutUser = async () => {
  try {
    await signOut(auth);
    console.log("User signed out successfully.");
  } catch (error) {
    console.error("Error signing out:", error);
  }
};

// Default export for the Firebase config and services
const firebaseServices = { app, auth, db, realtimeDb, createNewUser, signInUser, signOutUser };

// Export both default and named exports if needed
export default firebaseServices;
export { app, auth, db, realtimeDb, createNewUser, signInUser, signOutUser };
