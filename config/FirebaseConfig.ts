// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyACWEE3l9RMjzL0H6JXFbmNguJxhT5fSgc",
  authDomain: "bazar-e1219.firebaseapp.com",
  projectId: "bazar-e1219",
  storageBucket: "bazar-e1219.firebasestorage.app",
  messagingSenderId: "636423422130",
  appId: "1:636423422130:web:c03e86dc5696b4b431c9ab",
};

// Initialize Firebase
const FIREBASE_APP = initializeApp(firebaseConfig);
export const FIREBASE_DB = getFirestore(FIREBASE_APP);
