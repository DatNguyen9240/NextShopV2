import axiosClient from '../lib/axiosClient';
import type { CartDto, AddCartItemDto, UpdateCartItemDto } from '@/app/types/cart';

import { isAxiosError } from 'axios';

export async function getCart(): Promise<CartDto | null> {
  try {
    const res = await axiosClient.get('/api/Cart');
    return res.data?.data ?? null;
  } catch (err: unknown) {
    if (isAxiosError(err) && (err.response?.status === 401 || err.response?.status === 403)) {
      // Unauthenticated — treat as empty cart without noisy error logs
      console.debug('[getCart] unauthenticated (401/403), returning null');
      return null;
    }
    console.error('[getCart] error', err);
    return null;
  }
}

export async function addToCart(data: AddCartItemDto) {
  try {
    const res = await axiosClient.post('/api/Cart/add', data);
    const result = res.data?.data ?? null;
    if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('cart:updated'));
    return result;
  } catch (err: unknown) {
    console.error('[addToCart] error', err);
    throw err;
  }
}

export async function updateCartItem(cartItemId: string, data: UpdateCartItemDto) {
  try {
    const res = await axiosClient.put(`/api/Cart/items/${cartItemId}`, data);
    const result = res.data?.data ?? null;
    if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('cart:updated'));
    return result;
  } catch (err: unknown) {
    console.error('[updateCartItem] error', err);
    throw err;
  }
}

export async function removeCartItem(cartItemId: string) {
  try {
    const res = await axiosClient.delete(`/api/Cart/items/${cartItemId}`);
    if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('cart:updated'));
    return res.data;
  } catch (err: unknown) {
    console.error('[removeCartItem] error', err);
    throw err;
  }
}

export async function clearCart() {
  try {
    const res = await axiosClient.delete('/api/Cart/clear');
    // notify other UI components that the cart changed
    if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('cart:updated'));
    return res.data;
  } catch (err: unknown) {
    console.error('[clearCart] error', err);
    throw err;
  }
}

export async function getCartCount() {
  try {
    const res = await axiosClient.get('/api/Cart/count');
    return res.data?.data?.count ?? 0;
  } catch (err: unknown) {
    if (isAxiosError(err) && (err.response?.status === 401 || err.response?.status === 403)) {
      // Unauthenticated — return zero silently
      console.debug('[getCartCount] unauthenticated (401/403), returning 0');
      return 0;
    }
    console.error('[getCartCount] error', err);
    return 0;
  }
}