import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import "firebase/compat/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCi59X2eP72vKBXyrqxDusSeqqa03_uZEI",
  authDomain: "web-app-e79bf.firebaseapp.com",
  projectId: "web-app-e79bf",
  storageBucket: "web-app-e79bf.firebasestorage.app",
  messagingSenderId: "841457317340",
  appId: "1:841457317340:web:37af3e4501f91ec67a0b19",
  measurementId: "G-6P4T3C1XZJ"
};

// Handle potential default export issues with Compat SDK
const firebaseNamespace = (firebase as any).default || firebase;

// Initialize Firebase (check if already initialized for hot-reloading)
// Ensure firebaseNamespace.apps exists before checking length
const app = (firebaseNamespace.apps && firebaseNamespace.apps.length > 0) 
  ? firebaseNamespace.app() 
  : firebaseNamespace.initializeApp(firebaseConfig);

export const auth = app.auth();
export const db = app.firestore();
export const storage = app.storage();
export const googleProvider = new firebaseNamespace.auth.GoogleAuthProvider();

export default firebaseNamespace;