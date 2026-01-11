"use client";

import { useSearchParams, useRouter } from 'next/navigation';
import axios from 'axios';
import axiosClient from '../lib/axiosClient';
import { useEffect, useState } from 'react';

const PaymentPage: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('orderId');
  const [qrSrc, setQrSrc] = useState<string | null>(null);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [imgError, setImgError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_QR_RETRIES = 3;
  const QR_RETRY_DELAY_MS = 2000; // 2s
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('orderId from URL:', orderId);
    if (!orderId) return;

    const init = async () => {
      // Check existing payment status first
      try {
        const st = await axiosClient.get(`/api/Payments/status/${orderId}`);
        const status = st.data?.status ?? st.data?.Status ?? st.data?.data?.status ?? null;
        if (status && (status === 'Paid' || status.toLowerCase() === 'paid')) {
          router.push(`/payment/success?orderId=${orderId}`);
          return;
        }
      } catch (err: unknown) {
        // If 404 (no payment yet) or other, continue to create payment
        if (axios.isAxiosError(err) && err.response?.status && err.response.status !== 404) {
          console.error('Failed to check payment status', err);
        }
      }

      // Create payment link if not already paid
      try {
        const res = await axiosClient.post('/api/Payments/create-order-payment', { OrderId: orderId });
        const gotQr = res.data?.qrCodeUrl ?? null;
        const gotCheckout = res.data?.checkoutUrl ?? res.data?.CheckoutUrl ?? null;
        setCheckoutUrl(gotCheckout);
        const src = gotQr ?? (gotCheckout ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(gotCheckout)}` : null);
        setQrSrc(src);
        setRetryCount(0);
        setImgError(false);
      } catch (err) {
        console.error('Failed to create payment', err);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [orderId, router]);

  useEffect(() => {
    if (!orderId) return;

    const handler = (e: Event) => {
      const custom = e as CustomEvent<{ orderId: string }>;
      if (custom?.detail?.orderId === orderId) {
        console.log('Received payment:completed for this order via socket, redirecting...');
        router.push(`/payment/success?orderId=${orderId}`);
      }
    };

    window.addEventListener('payment:completed', handler as EventListener);
    return () => window.removeEventListener('payment:completed', handler as EventListener);
  }, [orderId, router]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Đang tạo mã QR...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-8">
      <div className="bg-white rounded-lg shadow p-8 max-w-md w-full text-center">
        <h1 className="text-2xl font-bold mb-4">Thanh toán</h1>
        <p className="mb-4">Quét mã QR để thanh toán</p>
        {qrSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={qrSrc}
            alt="QR Code"
            className="mx-auto mb-4 w-48 h-48"
            onError={() => {
              console.error('QR image failed to load');
              if (retryCount < MAX_QR_RETRIES && qrSrc) {
                const next = retryCount + 1;
                setRetryCount(next);
                setTimeout(() => {
                  const newSrc = qrSrc.includes('?') ? `${qrSrc}&r=${Date.now()}` : `${qrSrc}?r=${Date.now()}`;
                  setQrSrc(newSrc);
                }, QR_RETRY_DELAY_MS);
              } else {
                setImgError(true);
                // Auto-open checkoutUrl as fallback if available
                if (checkoutUrl) {
                  console.log('Opening checkoutUrl as fallback', checkoutUrl);
                  window.open(checkoutUrl, '_blank');
                }
              }
            }}
          />
        ) : null}

        {imgError && (
          <div className="mt-2 text-sm text-gray-600">
            Không thể hiển thị QR. {checkoutUrl ? (
              <>
                <button className="text-blue-600 underline" onClick={() => window.open(checkoutUrl, '_blank')}>Mở trang thanh toán</button>
                <div className="text-xs text-gray-500 break-words mt-1">{checkoutUrl}</div>
              </>
            ) : 'Vui lòng thử lại sau.'}
          </div>
        )}

        {!imgError && retryCount > 0 && (
          <div className="mt-2 text-sm text-gray-600">Đang thử tải lại mã QR ({retryCount}/{MAX_QR_RETRIES})...</div>
        )}
        <p className="text-sm text-gray-600">Đơn hàng: {orderId}</p>

      </div>
    </div>
  );
};

export default PaymentPage;