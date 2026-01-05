"use client";

import React from "react";
import { Toaster } from "react-hot-toast";

const ToastProvider: React.FC = () => {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        style: { fontSize: 14 },
      }}
    />
  );
};

export default ToastProvider;
