"use client";

import React, { useState, useEffect } from 'react';
import { requestNotificationPermission, setupForegroundListener } from '../lib/notificationHandler';

export default function FirebaseNotifications() {
  const [token, setToken] = useState<string | null>(null);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [messages, setMessages] = useState<{ notification: { title: string; body: string } }[]>([]);

  useEffect(() => {
    setPermission(Notification.permission);

    // Setup listener cho foreground notifications
    setupForegroundListener((payload) => {
      if (payload && payload.notification && payload.notification.title && payload.notification.body) {
        setMessages(prev => [...prev, { notification: { title: payload.notification!.title as string, body: payload.notification!.body as string } }]);
      }
    });
  }, []);

  const handleEnableNotifications = async () => {
    const fcmToken = await requestNotificationPermission();
    if (fcmToken) {
      setToken(fcmToken);
      alert('Notifications enabled!');
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Firebase Push Notifications</h2>

      <div className="mb-4">
        <p>Permission: <span className="font-semibold">{permission}</span></p>
        {token && (
          <p className="text-sm text-gray-600 break-all">
            Token: {token.substring(0, 50)}...
          </p>
        )}
      </div>

      <button
        onClick={handleEnableNotifications}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        disabled={permission === 'granted'}
      >
        {permission === 'granted' ? 'Notifications Enabled' : 'Enable Notifications'}
      </button>

      <div className="mt-4">
        <h3 className="font-semibold mb-2">Foreground Messages:</h3>
        <div className="space-y-2">
          {messages.map((msg, index) => (
            <div key={index} className="border p-2 rounded">
              <h4 className="font-medium">{msg.notification.title}</h4>
              <p className="text-sm">{msg.notification.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}