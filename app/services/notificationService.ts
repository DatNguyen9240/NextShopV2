import { HubConnectionBuilder, HubConnection } from '@microsoft/signalr';
import axiosClient, { getCookie } from '../lib/axiosClient';

export type Notification = {
  id: string;
  title: string;
  body?: string;
  url?: string;
  read: boolean;
  createdAt: string;
};

let connection: HubConnection | null = null;
let isConnecting = false;
let isConnected = false;

export async function connectToNotificationHub(): Promise<void> {
  // Prevent multiple simultaneous connection attempts
  if (isConnecting || isConnected) {
    console.log('🔄 Connection already in progress or established');
    return;
  }

  const token = getCookie('accessToken');
  console.log('🔐 Connecting to Notification Hub with token:', token ? `present (${token.substring(0, 20)}...)` : 'missing');

  if (!token) {
    console.warn('⚠️ No accessToken found in cookies. User might not be logged in.');
    return;
  }

  isConnecting = true;

  try {
    connection = new HubConnectionBuilder()
      .withUrl(`${process.env.NEXT_PUBLIC_API_URL}/hubs/notifications`, {
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect()
      .build();

    connection.on('ReceiveNotification', (notification: Notification) => {
      console.log('📨 Received notification:', notification);
      window.dispatchEvent(new CustomEvent('notification:received', { detail: notification }));
    });

    connection.onclose(() => {
      console.log('🔌 Connection closed');
      isConnected = false;
      isConnecting = false;
    });

    connection.onreconnecting(() => {
      console.log('🔄 Reconnecting...');
    });

    connection.onreconnected(() => {
      console.log('✅ Reconnected');
      isConnected = true;
    });

    await connection.start();
    console.log('✅ Connected to Notification Hub');
    isConnected = true;
  } catch (err) {
    console.error('❌ Error connecting to Notification Hub:', err);
    isConnected = false;
  } finally {
    isConnecting = false;
  }
}

export async function disconnectFromNotificationHub(): Promise<void> {
  if (connection) {
    await connection.stop();
    connection = null;
    isConnected = false;
    isConnecting = false;
    console.log('🔌 Disconnected from Notification Hub');
  }
}

export async function getNotificationsFromServer(): Promise<Notification[]> {
  const res = await axiosClient.get('/api/SocketNotification', { withCredentials: true });
  return res.data.items as Notification[];
}

export async function getNotifications(): Promise<Notification[]> {
  try {
    return await getNotificationsFromServer();
  } catch (e) {
    console.error('Error fetching notifications', e);
    return [];
  }
}

export async function markNotificationAsRead(id: string): Promise<void> {
  try {
    await axiosClient.post(`/api/SocketNotification/${id}/read`, null, { withCredentials: true });
    window.dispatchEvent(new Event('notifications:updated'));
  } catch {
    console.debug('[notificationService] markNotificationAsRead skipped: not authenticated');
  }
}

export async function markAllNotificationsAsRead(): Promise<void> {
  try {
    await axiosClient.post('/api/SocketNotification/mark-all-read', null, { withCredentials: true });
    window.dispatchEvent(new Event('notifications:updated'));
  } catch {
    console.debug('[notificationService] markAllNotificationsAsRead skipped: not authenticated');
  }
}

export async function startNotificationConnection(): Promise<void> {
  await connectToNotificationHub();
}

export async function stopNotificationConnection(): Promise<void> {
  await disconnectFromNotificationHub();
}