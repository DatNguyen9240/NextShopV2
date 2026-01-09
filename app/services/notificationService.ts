import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import axiosClient from '../lib/axiosClient';

type Notification = {
  id: string;
  title: string;
  body?: string;
  url?: string;
  read?: boolean;
  createdAt: string;
};

let connection: HubConnection | null = null;
let connected = false;

function getAccessTokenFromCookie() {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(?:^|; )accessToken=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export async function getNotificationsFromServer(): Promise<Notification[]> {
  try {
    const res = await axiosClient.get('/api/notifications', { withCredentials: true });
    return res.data.items as Notification[];
  } catch (e) {
    console.error('Error fetching notifications', e);
    return [];
  }
} 

export async function getNotifications(): Promise<Notification[]> {
  if (typeof window === 'undefined') return [];
  const token = getAccessTokenFromCookie();
  if (token) {
    return getNotificationsFromServer();
  }
  // Not authenticated: no local mock data, return empty list
  return [];
} 

export async function markNotificationAsRead(id: string): Promise<void> {
  const token = getAccessTokenFromCookie();
  if (token) {
    await axiosClient.post(`/api/notifications/${id}/read`, null, { withCredentials: true });
    window.dispatchEvent(new Event('notifications:updated'));
    return;
  }
  console.debug('[notificationService] markNotificationAsRead skipped: not authenticated');
  return;
} 

export async function markAllNotificationsAsRead(): Promise<void> {
  const token = getAccessTokenFromCookie();
  if (token) {
    await axiosClient.post(`/api/notifications/mark-all-read`, null, { withCredentials: true });
    window.dispatchEvent(new Event('notifications:updated'));
    return;
  }
  console.debug('[notificationService] markAllNotificationsAsRead skipped: not authenticated');
  return;
}

export async function startNotificationConnection(): Promise<void> {
  if (typeof window === 'undefined') return;
  if (connected && connection) return;

  const accessToken = getAccessTokenFromCookie();
  const base = process.env.NEXT_PUBLIC_API_BASE || process.env.NEXT_PUBLIC_API_URL || axiosClient.defaults.baseURL || '';
  const hubUrl = base ? `${base.replace(/\/$/, '')}/hubs/notifications` : '/hubs/notifications';

  console.debug('[notificationService] resolved hub base', { base, hubUrl, hasAccessToken: !!accessToken });

  // If no access token, don't start real-time connection (use local fallback)
  if (!accessToken) {
    console.debug('[notificationService] no access token, skipping SignalR connection');
    return;
  }

  connection = new HubConnectionBuilder()
    .withUrl(hubUrl, {
      accessTokenFactory: () => accessToken,
      transport: 1 // WebSockets preferred
    })
    .configureLogging(LogLevel.Information)
    .build();

  console.debug('[notificationService] HubConnection configured', { hubUrl });

  connection.on('ReceiveNotification', async (payload: Notification) => {
    try {
      console.debug('[notificationService] ReceiveNotification payload:', payload);
      // If the notification points to payment success, extract orderId and emit a payment event
      if (payload?.url && typeof payload.url === 'string' && payload.url.includes('/payment/success')) {
        try {
          const u = new URL(payload.url, window.location.origin);
          const orderId = u.searchParams.get('orderId');
          console.debug('[notificationService] Extracted orderId from notification url:', orderId);
          if (orderId) {
            window.dispatchEvent(new CustomEvent('payment:completed', { detail: { orderId } }));
          }
        } catch (e) {
          console.warn('[notificationService] malformed notification url', e);
        }
      }
    } catch (e) {
      console.warn('[notificationService] handler error', e);
    }

    // refresh list from server to keep state consistent
    await getNotificationsFromServer();
    window.dispatchEvent(new Event('notifications:updated'));
  });

  connection.onclose(err => {
    console.warn('[notificationService] connection closed', err);
    connected = false;
  });

  try {
    await connection.start();
    connected = true;
    console.debug('[notificationService] SignalR connected');
    // initial refresh
    window.dispatchEvent(new Event('notifications:updated'));
  } catch (e) {
    console.error('[notificationService] failed to start SignalR', e);
  }
}

export async function stopNotificationConnection(): Promise<void> {
  if (!connection) return;
  try {
    await connection.stop();
  } catch (e) {
    console.warn('[notificationService] failed to stop connection', e);
  }
  connection = null;
  connected = false;
}

