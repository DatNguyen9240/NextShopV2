import { initializeApp, FirebaseApp } from 'firebase/app';
import { getMessaging, Messaging } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

let app: FirebaseApp | null = null;
let messaging: Messaging | null = null;

const getFirebaseApp = () => {
  if (!app && typeof window !== 'undefined') {
    app = initializeApp(firebaseConfig);
  }
  return app;
};

const getFirebaseMessaging = () => {
  if (!messaging && typeof window !== 'undefined') {
    const firebaseApp = getFirebaseApp();
    if (firebaseApp) {
      messaging = getMessaging(firebaseApp);
    }
  }
  return messaging;
};

export { getFirebaseMessaging as messaging };