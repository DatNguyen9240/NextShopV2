importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyA1pzHTkpyV0KXZdQ7Oznkw5PG_OmN3uWI",
  authDomain: "nextshop-a8181.firebaseapp.com",
  projectId: "nextshop-a8181",
  storageBucket: "nextshop-a8181.firebasestorage.app",
  messagingSenderId: "1033205185010",
  appId: "1:1033205185010:web:54c886d440cf965583936b",
  measurementId: "G-G6WFCLZJRJ"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('Background Message:', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.icon || '/icon.png',
    badge: '/badge.png',
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});