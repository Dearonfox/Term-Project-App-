// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyD2FvYv9SlR-_Wuh3idYgGZBIGGzCST_dg",
    authDomain: "pb-project-fc33f.firebaseapp.com",
    projectId: "pb-project-fc33f",
    storageBucket: "pb-project-fc33f.firebasestorage.app",
    messagingSenderId: "578894128278",
    appId: "1:578894128278:web:76bc7cedd333c696b0ceb7",
    measurementId: "G-300T6ZSV4D",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
