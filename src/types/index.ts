export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  subcategory?: string;
  brand?: string;
  weight?: string;
  flavors?: string[];
  flavor?: string;
  image: string;
  images?: string[];
  stock: number;
  isOnSale?: boolean;
  salePrice?: number;
  isCombo?: boolean;
  isFeatured?: boolean;
  tags?: string[];
  createdAt?: any;
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentCategory?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: any;
}

export interface ProductSection {
  id: string;
  name: string;
  slug: string;
  description?: string;
  type: 'category' | 'brand' | 'sale' | 'combo' | 'featured';
  products: string[];
  isActive: boolean;
  sortOrder: number;
  createdAt: any;
}

export interface ProductFilter {
  id: string;
  name: string;
  type: 'brand' | 'category' | 'subcategory' | 'weight' | 'flavor' | 'price_range';
  values: string[];
  isActive: boolean;
  sortOrder: number;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  selectedFlavor?: string;
}

export interface FavoriteItem {
  id: string;
  productId: string;
  userId: string;
  addedAt: any;
  product?: Product;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  createdAt: any;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  paymentMethod: string;
  createdAt: any;
  updatedAt: any;
}

export interface Section {
  id: string;
  name: string;
  description?: string;
  type: 'brand' | 'category' | 'featured' | 'sale' | 'combo' | 'custom';
  products: string[];
  isActive: boolean;
  order: number;
  createdAt: any;
}

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}