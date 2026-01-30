importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyBSmXSIp4dbb9J6hwMqbw54LL_Uoysqq8I",
  authDomain: "nextshop-6a2f8.firebaseapp.com",
  projectId: "nextshop-6a2f8",
  storageBucket: "nextshop-6a2f8.firebasestorage.app",
  messagingSenderId: "514948869285",
  appId: "1:514948869285:web:59c691fc08d94d9a5bb14c",
  measurementId: "G-LCFKWYB1CK"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('Background Message:', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.icon || '/icon.png',
    badge: payload.notification.badge || '/badge/01.png',
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});