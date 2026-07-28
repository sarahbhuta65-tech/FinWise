import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCHwaxRHnQ13ftwn_X3NKxkXBK7aKyNZ34",
  authDomain: "finwise-ce5ea.firebaseapp.com",
  projectId: "finwise-ce5ea",
  storageBucket: "finwise-ce5ea.firebasestorage.app",
  messagingSenderId: "839031321854",
  appId: "1:839031321854:web:ca8eb0bc5fae9b6729e1af",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();