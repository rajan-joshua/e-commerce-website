import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDELakS9ab1chzTGVpBGXSdYt5aHucqtIM",
  authDomain: "compit-c90fe.firebaseapp.com",
  projectId: "compit-c90fe",
  storageBucket: "compit-c90fe.appspot.com", // Corrected
  messagingSenderId: "15377144493",
  appId: "1:15377144493:web:e806e2a2dd88fdeb0a8424",
  measurementId: "G-QM8XXG2KBW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export services
export const auth = getAuth(app);
export const db = getFirestore(app);
export { app }; // Exporting app if needed
