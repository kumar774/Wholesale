
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, Product, StoreSettings, CONSTANTS } from './types';

interface CartState {
  items: CartItem[];
  addItem: (product: Product, qty: number) => void;
  removeItem: (productId: string) => void;
  updateQty: (productId: string, qty: number) => void;
  clearCart: () => void;
  total: () => number;
  itemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product, qty) => {
        const currentItems = get().items || [];
        const existingItem = currentItems.find((i) => i.id === product.id);

        if (existingItem) {
          set({
            items: currentItems.map((i) =>
              i.id === product.id ? { ...i, qty: i.qty + qty } : i
            ),
          });
        } else {
          set({ items: [...currentItems, { ...product, qty }] });
        }
      },
      removeItem: (productId) => {
        const currentItems = get().items || [];
        set({ items: currentItems.filter((i) => i.id !== productId) });
      },
      updateQty: (productId, qty) => {
        if (qty <= 0) {
          get().removeItem(productId);
        } else {
          const currentItems = get().items || [];
          set({
            items: currentItems.map((i) =>
              i.id === productId ? { ...i, qty } : i
            ),
          });
        }
      },
      clearCart: () => set({ items: [] }),
      total: () => (get().items || []).reduce((acc, item) => acc + item.pricePerKg * item.qty, 0),
      itemCount: () => (get().items || []).reduce((acc, item) => acc + item.qty, 0),
    }),
    {
      name: 'veg-wholesale-cart',
    }
  )
);

interface AuthState {
  isAuthenticated: boolean;
  userEmail: string | null;
  login: (email: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  userEmail: null,
  login: (email) => set({ isAuthenticated: true, userEmail: email }),
  logout: () => set({ isAuthenticated: false, userEmail: null }),
}));

interface SettingsState {
  settings: StoreSettings;
  setSettings: (settings: Partial<StoreSettings>) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: {
    storeName: CONSTANTS.STORE_NAME,
    logoUrl: '',
    whatsappNumber: CONSTANTS.WHATSAPP_NUMBER,
    currencySymbol: CONSTANTS.CURRENCY,
    taxRate: 0,
    address: '123 Market Yard, Main Road, Vegetable City, India 400001',
    footer: {
      aboutText: 'Providing fresh, organic, and locally sourced vegetables directly to wholesalers and restaurants.',
      copyrightText: `© ${new Date().getFullYear()} ${CONSTANTS.STORE_NAME}. All rights reserved.`,
      bgColor: '#111827',
      textColor: '#ffffff',
      quickLinks: [
        { name: 'Home', path: '/' },
        { name: 'About Us', path: '/about' },
        { name: 'Terms & Conditions', path: '/terms' },
        { name: 'Privacy Policy', path: '/privacy' },
        { name: 'Admin Login', path: '/admin/login' }
      ]
    }
  },
  setSettings: (newSettings) => set((state) => ({
    settings: { ...state.settings, ...newSettings }
  })),
}));