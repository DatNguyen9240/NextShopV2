"use client";

import React, { useEffect, useState } from "react";
import axios from 'axios';
import axiosClient from "@/app/lib/axiosClient";
import Button from "@/app/components/Button";
import { useRouter } from "next/navigation";

interface Props {
  show: boolean;
  orderId: string | null;
  onClose: () => void;
}

const PaymentModal: React.FC<Props> = ({ show, orderId, onClose }) => {
  const router = useRouter();
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [, setOrderCode] = useState<string | null>(null); // PayOS orderCode (no client polling)
  const [imgError, setImgError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(120);
  const [imgRetryCount, setImgRetryCount] = useState<number>(0);
  const MAX_IMG_RETRIES = 3;
  const IMG_RETRY_DELAY_MS = 2000;
  const COUNTDOWN_TICK_MS = 1000;
  const isMountedRef = React.useRef(false);

  useEffect(() => {
    isMountedRef.current = true;
    if (!show || !orderId) {
      isMountedRef.current = false;
      return;
    }

    const createPayment = async () => {
      setLoading(true);
      try {
        const res = await axiosClient.post("/api/Payments/create-order-payment", { OrderId: orderId });
        if (!isMountedRef.current) return;
        console.log('Create payment response:', res.data);
        setQrCode(res.data?.qrCodeUrl || null);
        setCheckoutUrl(res.data?.checkoutUrl || res.data?.CheckoutUrl || res.data?.data?.checkoutUrl || null);
        setOrderCode(res.data?.orderCode || res.data?.OrderCode || res.data?.data?.orderCode || null);
        setRemainingSeconds(120); // start 2-minute countdown
        setImgError(false);
        setImgRetryCount(0);
      } catch (err) {
        console.error("Failed to create payment in modal", err);
      } finally {
        if (isMountedRef.current) setLoading(false);
      }
    };

    const init = async () => {
      try {
        // Check status first (use no-store to avoid proxy/browser cache)
        const st = await axiosClient.get(`/api/Payments/status/${orderId}`, { headers: { "Cache-Control": "no-store" } });
        const status = st.data?.status ?? st.data?.Status ?? st.data?.data?.status ?? null;
        if (status && (status === "Paid" || status.toLowerCase() === "paid")) {
          // already paid -> go to success
          onClose();
          router.push(`/payment/success?orderId=${orderId}`);
          return;
        }
      } catch (err: unknown) {
        // ignore 404
        if (!axios.isAxiosError(err)) {
          console.warn('Unexpected error when checking status', err);
        }
      }

      await createPayment();
    };

    init();
    return () => { isMountedRef.current = false; };
  }, [show, orderId, onClose, router]);


  useEffect(() => {
    // Start countdown when a QR or checkout URL is available
    if (!qrCode && !checkoutUrl) return;

    const countdownInterval = setInterval(() => {
      setRemainingSeconds(prev => {
        if (prev <= 1) {
          // Time's up: close modal
          try { onClose(); } catch {}
          return 0;
        }
        return prev - Math.round(COUNTDOWN_TICK_MS / 1000);
      });
    }, COUNTDOWN_TICK_MS);

    return () => {
      clearInterval(countdownInterval);
    };
  }, [qrCode, checkoutUrl, onClose]);

  // Listen for server-sent payment completion events and redirect this client if it matches the order
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handler = (e: Event) => {
      const custom = e as CustomEvent<{ orderId: string }>;
      const completedOrderId = custom?.detail?.orderId;
      if (!completedOrderId) return;
      if (completedOrderId === orderId) {
        console.debug('[PaymentModal] payment:completed received for this order', completedOrderId);
        try { onClose(); } catch {}
        try { router.push(`/payment/success?orderId=${completedOrderId}`); } catch {}
      }
    };

    window.addEventListener('payment:completed', handler as EventListener);
    return () => window.removeEventListener('payment:completed', handler as EventListener);
  }, [orderId, onClose, router]);

  const manualRetry = async () => {
    setImgError(false);
    setImgRetryCount(prev => prev + 1);
    setLoading(true);
    try {
      const res = await axiosClient.post("/api/Payments/create-order-payment", { OrderId: orderId });
      if (!isMountedRef.current) return;
      setQrCode(res.data?.qrCodeUrl || null);
      setCheckoutUrl(res.data?.checkoutUrl || res.data?.CheckoutUrl || res.data?.data?.checkoutUrl || null);
      setOrderCode(res.data?.orderCode || res.data?.OrderCode || res.data?.data?.orderCode || null);
      setRemainingSeconds(120);
    } catch (err) {
      console.error('Manual retry create payment failed', err);
    } finally {
      if (isMountedRef.current) setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000]">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Thanh toán</h3>
          <button onClick={onClose} className="text-gray-600">Đóng</button>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-pink-600 mx-auto mb-3" />
            <div className="text-sm text-gray-600">Đang tạo liên kết thanh toán...</div>
          </div>
        ) : (
          <div>
            { (qrCode || checkoutUrl) ? (
              <div className="text-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qrCode ?? (checkoutUrl ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(checkoutUrl)}` : '')}
                  alt="QR"
                  className="w-40 h-40 mx-auto mb-4"
                  onError={async () => {
                    console.error('QR image failed to load');
                    setImgError(true);
                    setImgRetryCount(prev => {
                      const next = prev + 1;
                      // automatic retry if we haven't exhausted retries
                      if (next <= MAX_IMG_RETRIES) {
                        setTimeout(async () => {
                          if (!isMountedRef.current) return;
                          console.log(`Retrying QR creation (attempt ${next})`);
                          // refresh modal by re-creating payment link
                          try {
                            setImgError(false);
                            setLoading(true);
                            const res = await axiosClient.post("/api/Payments/create-order-payment", { OrderId: orderId });
                            if (!isMountedRef.current) return;
                            setQrCode(res.data?.qrCodeUrl || null);
                            setCheckoutUrl(res.data?.checkoutUrl || res.data?.CheckoutUrl || res.data?.data?.checkoutUrl || null);
                            setOrderCode(res.data?.orderCode || res.data?.OrderCode || res.data?.data?.orderCode || null);
                            setRemainingSeconds(120);
                          } catch (err: unknown) {
                            console.error('Retry create payment failed', err);
                            // if this was last attempt, fallback to opening checkoutUrl
                            if (next >= MAX_IMG_RETRIES && checkoutUrl) window.open(checkoutUrl, '_blank');
                          } finally {
                            if (isMountedRef.current) setLoading(false);
                          }
                        }, IMG_RETRY_DELAY_MS);
                      } else {
                        // exhausted retries -> open checkout if available
                        if (checkoutUrl) {
                          console.log('Exhausted QR retries, opening checkout URL');
                          window.open(checkoutUrl, '_blank');
                        }
                      }
                      return next;
                    });
                  }}
                />



                {imgError && (
                  <div className="mt-4 p-4 border border-red-100 bg-red-50 rounded text-center">
                    <div className="text-red-700 font-medium mb-2">Không thể hiển thị mã QR</div>
                    <div className="text-sm text-gray-600 mb-3">
                      {imgRetryCount < MAX_IMG_RETRIES ? `Đang thử lại hiển thị mã QR (${imgRetryCount}/${MAX_IMG_RETRIES})...` : 'Đã thử nhiều lần. Bạn có thể mở trang thanh toán hoặc thử lại.'}
                    </div>
                    <div className="flex gap-2 justify-center">
                      <Button shape="rounded" onClick={manualRetry} className="px-4 py-2">Thử lại</Button>
                      {checkoutUrl && <Button shape="rounded" onClick={() => window.open(checkoutUrl, '_blank')} className="px-4 py-2 border border-gray-300">Mở trang thanh toán</Button>}
                    </div>
                  </div>
                )}

                <div className="text-sm text-gray-600 mb-2">Quét mã để thanh toán</div>
                <div className="text-sm text-blue-600">
                  {remainingSeconds > 0 ? (
                    <>Thời gian chờ — {Math.floor(remainingSeconds / 60).toString().padStart(2,'0')}:{(remainingSeconds % 60).toString().padStart(2,'0')}</>
                  ) : (
                    <>Thời gian chờ kết thúc — đóng cửa sổ</>
                  )}
                </div>
                <div className="mt-4">
                  <Button
                    shape="rounded"
                    onClick={() => { if (checkoutUrl) window.open(checkoutUrl, '_blank'); }}
                    className="w-full"
                    disabled={!checkoutUrl}
                  >
                    Mở trang thanh toán
                  </Button>
                  {checkoutUrl && <p className="text-xs text-gray-500 mt-2 break-words">{checkoutUrl}</p>}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-sm text-gray-600">Không thể tạo liên kết thanh toán. Vui lòng thử lại sau.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentModal;
