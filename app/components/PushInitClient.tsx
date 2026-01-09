"use client";
import React from 'react';
import PushSubscribeButton from './PushSubscribeButton';

export default function PushInitClient() {
  return (
    <div style={{ position: 'fixed', bottom: 16, right: 16, zIndex: 9999 }}>
      <PushSubscribeButton />
    </div>
  );
}
