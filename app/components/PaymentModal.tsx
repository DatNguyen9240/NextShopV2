"use client";

import React, { useEffect, useState } from "react";
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
  const [orderCode, setOrderCode] = useState<string | null>(null); // PayOS orderCode used for polling
  const [imgError, setImgError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [polling, setPolling] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(120);
  const [imgRetryCount, setImgRetryCount] = useState<number>(0);
  const MAX_IMG_RETRIES = 3;
  const IMG_RETRY_DELAY_MS = 2000;
  const INITIAL_POLL_DELAY_MS = 2500; // initial delay to avoid webhook race
  const POLL_INTERVAL_MS = 2000;
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
        setPolling(true);
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
      } catch (err: any) {
        // ignore 404
      }

      await createPayment();
    };

    init();
    return () => { isMountedRef.current = false; };
  }, [show, orderId, onClose, router]);


  useEffect(() => {
    if (!polling || !orderCode) return;

    let pollInterval: any = null;
    let initialTimer: any = null;

    const poll = async () => {
      try {
        const res = await axiosClient.get(`/api/Payments/status?orderCode=${encodeURIComponent(orderCode)}`, { headers: { "Cache-Control": "no-store" } });
        console.debug('Payment status poll response:', res.data);
        const status = res.data?.status ?? res.data?.Status ?? res.data?.data?.status ?? null;
        if (status && (status === "Paid" || status.toLowerCase() === "paid")) {
          console.info('Payment detected as paid via orderCode', orderCode, res.data);
          setPolling(false);
          onClose();
          router.push(`/payment/success?orderId=${orderId}`);
        }
      } catch (err) {
        console.error("Polling failed", err);
      }
    };

    // Initial delay to avoid race with webhook updates
    initialTimer = setTimeout(() => {
      poll();
      pollInterval = setInterval(poll, POLL_INTERVAL_MS);
    }, INITIAL_POLL_DELAY_MS);

    // Countdown timer
    const countdownInterval = setInterval(() => {
      setRemainingSeconds(prev => {
        if (prev <= 1) {
          // Time's up: stop polling and close modal
          try { setPolling(false); } catch {}
          try { onClose(); } catch {}
          return 0;
        }
        return prev - Math.round(COUNTDOWN_TICK_MS / 1000);
      });
    }, COUNTDOWN_TICK_MS);

    return () => {
      if (initialTimer) clearTimeout(initialTimer);
      if (pollInterval) clearInterval(pollInterval);
      clearInterval(countdownInterval);
    };
  }, [polling, orderCode, onClose, router]);

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
                            setPolling(true);
                          } catch (err) {
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
                  <div className="text-sm text-gray-600 mb-2">Không thể hiển thị QR.</div>
                )}
                {imgError && imgRetryCount < MAX_IMG_RETRIES && (
                  <div className="text-sm text-gray-600 mb-2">Đang thử lại hiển thị mã QR ({imgRetryCount}/{MAX_IMG_RETRIES})...</div>
                )}
                {imgError && imgRetryCount >= MAX_IMG_RETRIES && (
                  <div className="text-sm text-gray-600 mb-2">Không thể hiển thị QR. Bạn có thể mở trang thanh toán hoặc thử lại.</div>
                )}
                {imgError && (
                  <div className="flex gap-2 justify-center mt-2">
                    <Button onClick={async () => {
                      // manual retry
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
                        setPolling(true);
                      } catch (err) {
                        console.error('Manual retry create payment failed', err);
                      } finally {
                        if (isMountedRef.current) setLoading(false);
                      }
                    }} className="px-3 py-1">Thử lại</Button>
                    {checkoutUrl && <Button onClick={() => window.open(checkoutUrl, '_blank')} className="px-3 py-1">Mở trang thanh toán</Button>}
                  </div>
                )}

                <div className="text-sm text-gray-600 mb-2">Quét mã để thanh toán</div>
                <div className="text-sm text-blue-600">
                  {remainingSeconds > 0 ? (
                    <>Đang kiểm tra trạng thái thanh toán — {Math.floor(remainingSeconds / 60).toString().padStart(2,'0')}:{(remainingSeconds % 60).toString().padStart(2,'0')}</>
                  ) : (
                    <>Thời gian chờ kết thúc — đóng cửa sổ</>
                  )}
                </div>
                <div className="mt-4">
                  <Button
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
