//Rename this file to firebase.ts

import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "Haha",
  authDomain: "HIHI",
  projectId: "HEHE",
  storageBucket: "HUHU",
  messagingSenderId: "HOHO",
  appId: "HMHM"
};

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
