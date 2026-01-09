"use client";
import React from 'react';
import { usePushNotifications } from '../hooks/usePushNotifications';

export default function PushSubscribeButton() {
  const { permission, requestPermissionAndRegister } = usePushNotifications();

  const handleClick = async () => {
    const ok = await requestPermissionAndRegister();
    if (ok) alert('Subscribed to notifications');
    else alert('Subscription failed or permission denied');
  }

  return (
    <button onClick={handleClick} className="btn">
      {permission === 'granted' ? 'Subscribed' : 'Subscribe to notifications'}
    </button>
  );
}
