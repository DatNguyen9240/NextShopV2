import { initializeApp } from "firebase/app";
import type { FirebaseApp, FirebaseOptions } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import type { Messaging } from "firebase/messaging";

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

let app: FirebaseApp | null = null;
let messaging: Messaging | null = null;

export function initFirebaseClient() {
  if (typeof window === "undefined") return;
  if (!app) {
    app = initializeApp(firebaseConfig);
  }
  if (!messaging) {
    try {
      messaging = getMessaging(app as FirebaseApp);
    } catch (err) {
      console.warn("Firebase messaging is not available:", err);
    }
  }
}

export async function requestFcmToken(vapidKey?: string): Promise<string | null> {
  if (typeof window === "undefined") return null;
  initFirebaseClient();
  if (!messaging) return null;

  try {
      // Ensure service worker is registered for handling background messages
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
          // Wait until the service worker is active and controlling the page
          await navigator.serviceWorker.ready;
          if (!registration.active && !registration.waiting && !registration.installing) {
            console.warn('Service worker registered but not active yet');
          }
        } catch (swErr) {
          console.warn('Service worker registration failed:', swErr);
        }
      }

      // Ensure a service worker is active before subscribing
      if ('serviceWorker' in navigator && !navigator.serviceWorker.controller) {
        console.warn('No active service worker controlling the page. Make sure /firebase-messaging-sw.js is served and you have reloaded the page.');
      }

      const currentToken = await getToken(messaging as Messaging, { vapidKey: vapidKey ?? process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY });
      return currentToken ?? null;
    } catch (err: unknown) {
      // Improve error message for common SW issue
      if (err instanceof Error && err.name === 'AbortError' && (err.message || '').includes('no active Service Worker')) {
        console.error('Error getting FCM token: no active Service Worker. Ensure the service worker is registered at /firebase-messaging-sw.js and the page is loaded over HTTPS or localhost.');
      } else {
        console.error('Error getting FCM token:', err);
      }
      return null;
    }
}

export function onMessageReceived(callback: (payload: unknown) => void) {
  try {
    if (!messaging) initFirebaseClient();
    if (!messaging) return;
    onMessage(messaging as Messaging, (payload) => {
      callback(payload);
    });
  } catch (err) {
    console.warn("onMessage not available:", err);
  }
}

export async function sendTokenToServer(token: string, options?: { platform?: string; deviceId?: string }): Promise<boolean> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:7264";
    const res = await fetch(`${apiUrl}/api/push/register-guest`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, platform: options?.platform ?? "web", deviceId: options?.deviceId ?? null })
    });
    return res.ok;
  } catch (err) {
    console.error("Failed to send token to server:", err);
    return false;
  }
}
