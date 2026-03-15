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
  productName: string;
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
  status: 'completed' | 'void';
}
