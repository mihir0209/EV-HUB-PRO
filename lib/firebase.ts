import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyBa0OnlcYmPuQtmDC_tjtToNf06xBOiMTU",
  authDomain: "ev-hub-pro.firebaseapp.com",
  projectId: "ev-hub-pro",
  storageBucket: "ev-hub-pro.firebasestorage.app",
  messagingSenderId: "965205083349",
  appId: "1:965205083349:web:79e0cd9ff5ebbaec270e5c"
};

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
