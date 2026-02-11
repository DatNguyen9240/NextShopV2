"use client";
import React, { useEffect, useState } from "react";
import { requestNotificationPermission, setupForegroundListener, unregisterNotification } from "../../lib/notificationHandler";

export default function NotificationToggle({ userId }: { userId?: string }) {
  const [enabled, setEnabled] = useState<boolean>(false);
  const [supported, setSupported] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setSupported("Notification" in window && "serviceWorker" in navigator);
    setEnabled(Notification.permission === "granted");

    // attach foreground handler
    setupForegroundListener((payload) => {
      // you can show in-app toast here
      console.log("Foreground notification:", payload);
    });
  }, []);

  async function handleEnable() {
    setLoading(true);
    try {
      const token = await requestNotificationPermission(userId);
      if (token) setEnabled(true);
    } finally {
      setLoading(false);
    }
  }

  async function handleDisable() {
    setLoading(true);
    try {
      await unregisterNotification();
      setEnabled(false);
    } finally {
      setLoading(false);
    }
  }

  if (!supported) {
    return <div>Trình duyệt này không hỗ trợ thông báo.</div>;
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <label style={{ fontWeight: 600 }}>Thông báo trình duyệt</label>
      <div>
        {enabled ? (
          <button onClick={handleDisable} disabled={loading} style={{ background: "#eee", padding: "6px 10px" }}>
            Tắt thông báo
          </button>
        ) : (
          <button onClick={handleEnable} disabled={loading} style={{ background: "#0070f3", color: "white", padding: "6px 10px" }}>
            Bật thông báo
          </button>
        )}
      </div>
    </div>
  );
}
