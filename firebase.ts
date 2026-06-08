import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyCOneEoRXTVScpfdWOW2lfjxYttb0Gk3rQ",
    authDomain: "zecolisapp.firebaseapp.com",
    projectId: "zecolisapp",
    storageBucket: "zecolisapp.firebasestorage.app",
    messagingSenderId: "831120416813",
    appId: "1:831120416813:web:d77c3c2c7da843348118a4"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
