"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getCart, updateCartItem, removeCartItem, clearCart, addToCart, getCartCount } from '@/app/services/cartService';
import type { CartDto, AddCartItemDto, UpdateCartItemDto } from '@/app/types/cart';

interface CartContextType {
  cart: CartDto | null;
  loading: boolean;
  loadCart: () => Promise<void>;
  updateItem: (cartItemId: string, data: UpdateCartItemDto) => Promise<void>;
  removeItem: (cartItemId: string) => Promise<void>;
  clear: () => Promise<void>;
  addItem: (data: AddCartItemDto) => Promise<void>;
  getCount: () => Promise<number>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cart, setCart] = useState<CartDto | null>(null);
  const [loading, setLoading] = useState(true);

  const loadCart = async () => {
    try {
      setLoading(true);
      const c = await getCart();
      setCart(c);
    } catch (e) {
      console.error('Failed to load cart', e);
    } finally {
      setLoading(false);
    }
  };

  const updateItem = async (cartItemId: string, data: UpdateCartItemDto) => {
    await updateCartItem(cartItemId, data);
    await loadCart();
  };

  const removeItem = async (cartItemId: string) => {
    await removeCartItem(cartItemId);
    await loadCart();
  };

  const clear = async () => {
    await clearCart();
    await loadCart();
  };

  const addItem = async (data: AddCartItemDto) => {
    await addToCart(data);
    await loadCart();
  };

  const getCount = async () => {
    return await getCartCount();
  };

  useEffect(() => {
    loadCart();
  }, []);

  return (
    <CartContext.Provider value={{
      cart,
      loading,
      loadCart,
      updateItem,
      removeItem,
      clear,
      addItem,
      getCount
    }}>
      {children}
    </CartContext.Provider>
  );
};