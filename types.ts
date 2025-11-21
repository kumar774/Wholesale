
export interface Product {
  id: string;
  name: string;
  slug: string;
  pricePerKg: number;
  unit: string;
  description: string;
  category: string;
  images: string[];
  featured: boolean;
  inStock: boolean;
  stockQuantity?: number; // Inventory count
  lowStockThreshold?: number; // Alert trigger level
  createdAt?: any; // Firestore Timestamp
}

export interface CartItem extends Product {
  qty: number;
}

export interface Banner {
  id: string;
  imageUrl: string;
  title: string;
  subtitle: string;
  ctaUrl: string;
  order: number;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  isAdmin: boolean;
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: CartItem[];
  totalAmount: number;
  whatsappMessage: string;
  createdAt: any;
  status: string;
  platform?: string;
}

export interface OrderDetails {
  customerName: string;
  phone: string;
  address: string;
  items: CartItem[];
  total: number;
}

export interface FooterLink {
  name: string;
  path: string;
}

export interface FooterSettings {
  aboutText: string;
  copyrightText: string;
  bgColor: string;
  textColor: string;
  quickLinks: FooterLink[];
}

export interface StoreSettings {
  storeName: string;
  logoUrl: string;
  whatsappNumber: string;
  currencySymbol: string;
  taxRate: number;
  address: string;
  footer: FooterSettings;
}

export const CONSTANTS = {
  CURRENCY: '₹',
  WHATSAPP_NUMBER: '917505067414',
  STORE_NAME: 'akWholesale',
};