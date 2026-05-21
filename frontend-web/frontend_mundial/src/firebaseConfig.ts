import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyBStoBHt4PJLLTG7xTg8gD4DD7eMiKqJW4",
  authDomain: "mundial-2026-hub.firebaseapp.com",
  projectId: "mundial-2026-hub",
  storageBucket: "mundial-2026-hub.firebasestorage.app",
  messagingSenderId: "1067848808",
  appId: "1:1067848808:web:b591a53aae96e8cd5757dd",
};

const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);
export const VAPID_KEY = "BOAmTzigKOz5JgqWE9IuePmfD7ld5B7hmY-BdA8TRb6KX7nu1nTAHwx9ivhkyVVctEJEshXay6yMlpo6EBLaheI";