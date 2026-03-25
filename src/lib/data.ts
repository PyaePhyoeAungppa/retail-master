export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image?: string;
  stock: number;
}

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  is_default?: boolean;
}

export interface Category {
  id: string;
  name: string;
}

export interface User {
  id: number | string;
  username: string;
  password?: string;
  role: string;
}

export interface TransactionItem {
  id: string;
  transactionId: string;
  productId: string;
  name: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface Transaction {
  id: string;
  date: string; // ISO 8601 format
  customerId: string;
  customerName: string;
  cashierId: string | number;
  cashierName: string;
  terminalId: string;
  itemsCount: number;
  subtotal: number;
  tax: number;
  total: number;
  method: 'card' | 'cash' | 'qr' | 'nfc';
  status: 'completed' | 'void' | 'pending';
}

export interface Store {
  id: string;
  name: string;
  brand?: string;
  currency: string;
  tax_rate: number;
  address?: string;
}
export interface Order {
  id: string
  store_id: string
  date: string
  total: number
  customerId: string | null
  customerName: string
  cashierId: string | null
  cashierName: string
  terminalId: string
  itemsCount: number
  created_at?: string
  subtotal: number
  tax: number
  status: 'pending' | 'completed' | 'void'
}

export interface OrderItem {
  id?: number
  orderId: string
  productId: string
  name: string
  price: number
  quantity: number
  subtotal: number
  created_at?: string
}
