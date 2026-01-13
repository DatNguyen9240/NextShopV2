"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getCart, updateCartItem, removeCartItem, clearCart, addToCart, getCartCount } from '@/app/services/cartService';
import { useAuth } from '@/app/providers/AuthProvider';
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
  const { isAuthenticated } = useAuth();

  const loadCart = React.useCallback(async () => {
    setLoading(true);
    try {
      // Do not call API when not authenticated to avoid unnecessary 401s
      if (!isAuthenticated) {
        setCart(null);
        return;
      }

      const c = await getCart();
      setCart(c);
    } catch (e: unknown) {
      console.error('Failed to load cart', e);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

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
    if (!isAuthenticated) return 0;
    return await getCartCount();
  };

  useEffect(() => {
    // Reload cart when authentication changes (login/logout)
    void loadCart();
  }, [loadCart]);

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