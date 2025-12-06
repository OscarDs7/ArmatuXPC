// Import Firebase SDK
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyArEVoYIds1Ae-0jvO0TEqTu9WxfBIg4v8",
  authDomain: "armatuxpc.firebaseapp.com",
  projectId: "armatuxpc",
  storageBucket: "armatuxpc.firebasestorage.app",
  messagingSenderId: "464173166625",
  appId: "1:464173166625:web:62b197b76854f51ed0b360",
  measurementId: "G-8LL633GXM1"
};


// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Exportar Authentication y Firestore
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
