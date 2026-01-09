"use client";
import { useEffect, useState } from "react";
import { initFirebaseClient, requestFcmToken, sendTokenToServer, onMessageReceived } from "../lib/firebaseClient";

export function usePushNotifications() {
  const [token, setToken] = useState<string | null>(null);
  const [available, setAvailable] = useState<boolean>(false);
  const [permission, setPermission] = useState<NotificationPermission>("default");

  useEffect(() => {
    if (typeof window === "undefined") return;
    initFirebaseClient();
    setAvailable(true);
    setPermission(Notification.permission);

    // handle foreground messages
    onMessageReceived((payload) => {
      console.log("FCM foreground message:", payload);
    });
  }, []);

  async function requestPermissionAndRegister() {
    if (!available) return false;
    try {
      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm !== "granted") return false;
      const t = await requestFcmToken();
      if (t) {
        const ok = await sendTokenToServer(t);
        if (ok) setToken(t);
        return ok;
      }
      return false;
    } catch (err) {
      console.error(err);
      return false;
    }
  }

  return {
    token,
    available,
    permission,
    requestPermissionAndRegister
  };
}
