import { getToken, onMessage, deleteToken, MessagePayload } from 'firebase/messaging';
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
        icon: payload.notification.icon,
        badge: '',
        data: payload.data
      });
    }

    // Callback để xử lý thêm
    if (callback && payload) {
      callback(payload);
    }
  });
}

// Hủy đăng ký token cục bộ và cố gắng thông báo server (nếu endpoint hỗ trợ)
export async function unregisterNotification(): Promise<boolean> {
  try {
    const currentMessaging = messaging();
    if (!currentMessaging) return false;

    // try to read current token
    const currentToken = await getToken(currentMessaging, { vapidKey: VAPID_KEY }).catch(() => null);

    // delete local token
    const deleted = await deleteToken(currentMessaging).catch((e) => {
      console.warn('deleteToken failed', e);
      return false;
    });

    // try to inform server to remove this token (best-effort - endpoint may not exist)
    if (currentToken) {
      try {
        await axiosClient.post('/api/firebase-notifications/remove-token', { token: currentToken });
      } catch (e) {
        // ignore - endpoint may be absent
      }
    }

    return !!deleted;
  } catch (error) {
    console.error('Error unregistering token:', error);
    return false;
  }
}