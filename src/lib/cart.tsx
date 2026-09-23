"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from './supabase/client';
import { mockSettings } from './mock-data';

export type CartItem = {
  id: string;
  title: string;
  price: number;
  quantity: number;
  image?: string;
  selectedColor?: string;
};

export type StoreSettings = {
  free_gift_threshold: number;
  free_gift_title: string;
  free_gift_value_label: string;
  is_free_gift_active: boolean;
};

type CartContextType = {
  items: CartItem[];
  count: number;
  subtotal: number;
  giftUnlocked: boolean;
  remainingForGift: number;
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  addItem: (item: CartItem) => void;
  setQuantity: (id: string, qty: number, selectedColor?: string) => void;
  removeItem: (id: string, selectedColor?: string) => void;
  clearCart: () => void;
  settings: StoreSettings;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [settings, setSettings] = useState<StoreSettings>(mockSettings);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('cc-cart');
      if (saved) {
        try { setItems(JSON.parse(saved)); } catch (e) {}
      }
    } catch (e) {}
    setMounted(true);

    // Fetch settings
    const fetchSettings = async () => {
      const { data, error } = await supabase.from('store_settings').select('*').limit(1).maybeSingle();
      if (!error && data) {
        setSettings({
          free_gift_threshold: Number(data.free_gift_threshold),
          free_gift_title: data.free_gift_title,
          free_gift_value_label: data.free_gift_value_label,
          is_free_gift_active: data.is_free_gift_active
        });
      } else {
        try {
          const savedMock = localStorage.getItem('cc-mock-settings');
          if (savedMock) {
            try {
              const parsed = JSON.parse(savedMock);
              setSettings({
                free_gift_threshold: Number(parsed.free_gift_threshold),
                free_gift_title: parsed.free_gift_title,
                free_gift_value_label: parsed.free_gift_value_label,
                is_free_gift_active: parsed.is_free_gift_active
              });
            } catch(e) {}
          }
        } catch(e) {}
      }
    };
    
    fetchSettings();

    const handleSettingsChange = () => fetchSettings();
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'cc-mock-settings') fetchSettings();
    };
    window.addEventListener('store_settings_changed', handleSettingsChange);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('store_settings_changed', handleSettingsChange);
      window.removeEventListener('storage', handleStorageChange as EventListener);
    };
  }, []);

  useEffect(() => {
    if (mounted) {
      try { localStorage.setItem('cc-cart', JSON.stringify(items)); } catch (e) {}
    }
  }, [items, mounted]);

  const count = items.reduce((acc, i) => acc + i.quantity, 0);
  const subtotal = items.reduce((acc, i) => acc + i.price * i.quantity, 0);
  const giftUnlocked = settings.is_free_gift_active && subtotal >= settings.free_gift_threshold;
  const remainingForGift = Math.max(0, settings.free_gift_threshold - subtotal);

  const addItem = (item: CartItem) => {
    setItems(prev => {
      const existing = prev.find(i => i.id === item.id && i.selectedColor === item.selectedColor);
      if (existing) {
        return prev.map(i => i === existing ? { ...i, quantity: i.quantity + item.quantity } : i);
      }
      return [...prev, item];
    });
  };

  const setQuantity = (id: string, quantity: number, selectedColor?: string) => {
    if (quantity < 1) return removeItem(id, selectedColor);
    setItems(prev => prev.map(i => 
      (i.id === id && i.selectedColor === selectedColor) ? { ...i, quantity } : i
    ));
  };

  const removeItem = (id: string, selectedColor?: string) => {
    setItems(prev => prev.filter(i => !(i.id === id && i.selectedColor === selectedColor)));
  };

  const clearCart = () => {
    setItems([]);
  };

  return (
    <CartContext.Provider value={{ items, count, subtotal, giftUnlocked, remainingForGift, isOpen, setOpen, addItem, setQuantity, removeItem, clearCart, settings }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};

