import { getToken, onMessage, MessagePayload } from 'firebase/messaging';
import { messaging } from '../lib/firebaseConfig';
import axiosClient from '../lib/axiosClient';

const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

// Đăng ký Service Worker
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  navigator.serviceWorker.register('/firebase-messaging-sw.js')
    .then((registration) => {
      console.log('Service Worker registered:', registration);
    })
    .catch((error) => {
      console.error('Service Worker registration failed:', error);
    });
}

// Yêu cầu quyền và lấy token
export async function requestNotificationPermission(userId?: string): Promise<string | null> {
  try {
    const permission = await Notification.requestPermission();

    if (permission === 'granted') {
      const currentMessaging = messaging();
      if (currentMessaging) {
        const token = await getToken(currentMessaging, { vapidKey: VAPID_KEY });
        if (token) {
          console.log('FCM Token:', token);
          await saveTokenToServer(token, userId);
          return token;
        }
      }
    } else {
      console.log('Notification permission denied');
    }
  } catch (error) {
    console.error('Error getting permission:', error);
  }
  return null;
}

// Gửi token lên server C#
async function saveTokenToServer(token: string, userId?: string): Promise<void> {
  try {
    const response = await axiosClient.post('/api/firebase-notifications/save-token', {
      token: token,
      userId: userId
    });

    if (response.status === 200) {
      console.log('Token saved successfully', userId ? `for user ${userId}` : 'without user ID');
    }
  } catch (error) {
    console.error('Error saving token:', error);
  }
}

// Lắng nghe notification khi app đang mở
export function setupForegroundListener(callback?: (payload: MessagePayload) => void): void {
  const currentMessaging = messaging();
  if (!currentMessaging) return;

  onMessage(currentMessaging, (payload) => {
    console.log('Foreground message:', payload);

    // Hiển thị notification
    if (payload && Notification.permission === 'granted' && payload.notification && payload.notification.title) {
      new Notification(payload.notification.title, {
        body: payload.notification.body || '',
        icon: payload.notification.icon || '/icon.png',
        data: payload.data
      });
    }

    // Callback để xử lý thêm
    if (callback && payload) {
      callback(payload);
    }
  });
}