import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBg5SH5aBFSJH6BLuRHoNepgQVYQIlT6Pg",
  authDomain: "finvest-auth-ba5ee.firebaseapp.com",
  projectId: "finvest-auth-ba5ee",
  storageBucket: "finvest-auth-ba5ee.firebaseapp.com",
  messagingSenderId: "606712045540",
  appId: "1:606712045540:web:3abbf84c010dd709fd71f1",
  measurementId: "G-KN3QSPCB4N",
};

const app = initializeApp(firebaseConfig);

import AsyncStorage from "@react-native-async-storage/async-storage";

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});
export const firestore = getFirestore(app);
export const storage = getStorage(app);
