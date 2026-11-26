import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env["VITE_FIREBASE_API_KEY"] || "AIzaSyBawcZprUN4UUtii7Uy28aSwKeojZmPY9Q",
  authDomain: import.meta.env["VITE_FIREBASE_AUTH_DOMAIN"] || "sunshine-moon.firebaseapp.com",
  projectId: import.meta.env["VITE_FIREBASE_PROJECT_ID"] || "sunshine-moon",
  storageBucket: import.meta.env["VITE_FIREBASE_STORAGE_BUCKET"] || "sunshine-moon.firebasestorage.app",
  messagingSenderId: import.meta.env["VITE_FIREBASE_MESSAGING_SENDER_ID"] || "331443029192",
  appId: import.meta.env["VITE_FIREBASE_APP_ID"] || "1:331443029192:web:025ed5980e2d2bd59211fd",
};

export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Avoid initializing browser Auth persistence during SSR prerendering
export const auth: Auth | null = typeof window !== "undefined" ? getAuth(app) : null;
