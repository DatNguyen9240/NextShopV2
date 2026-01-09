importScripts('https://www.gstatic.com/firebasejs/9.22.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.2/firebase-messaging-compat.js');

// Replace config values with your project's web config (these are safe to expose)
firebase.initializeApp({
  apiKey: "AIzaSyA1pzHTkpyV0KXZdQ7Oznkw5PG_OmN3uWI",
  authDomain: "nextshop-a8181.firebaseapp.com",
  projectId: "nextshop-a8181",
  storageBucket: "nextshop-a8181.firebasestorage.app",
  messagingSenderId: "1033205185010",
  appId: "1:1033205185010:web:bb82065b94ad219383936b",
  measurementId: "G-XKGTXPNVGP"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notification = payload.notification || {}; 
  const title = notification.title || 'Notification';
  const options = {
    body: notification.body || '',
    data: payload.data || {}
  };
  self.registration.showNotification(title, options);
});
