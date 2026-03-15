
import { create } from 'zustand';
import { Product, Customer } from '@/lib/data';

interface CartItem extends Product {
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  selectedCustomer: Customer | null;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, delta: number) => void;
  setCustomer: (customer: Customer) => void;
  clearCart: () => void;
  calculateTotal: () => void;
  total: number;
  receiptTemplate: 'standard' | 'thermal' | 'modern';
  setReceiptTemplate: (template: 'standard' | 'thermal' | 'modern') => void;
}

const DEFAULT_CUSTOMER: Customer = {
  id: "walk-in-customer-uuid",
  name: "Walk In"
};

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  selectedCustomer: DEFAULT_CUSTOMER,
  total: 0,
  addItem: (product, quantity = 1) => {
    const items = get().items;
    const existingItem = items.find((item) => item.id === product.id);

    let newItems;
    if (existingItem) {
      newItems = items.map((item) =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + quantity }
          : item
      );
    } else {
      newItems = [...items, { ...product, quantity }];
    }
    
    set({ items: newItems });
    get().calculateTotal();
  },
  removeItem: (productId) => {
    set({
      items: get().items.filter((item) => item.id !== productId),
    });
    get().calculateTotal();
  },
  updateQuantity: (productId, delta) => {
    const items = get().items;
    set({
      items: items.map((item) =>
        item.id === productId
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      ),
    });
    get().calculateTotal();
  },
  setCustomer: (customer) => set({ selectedCustomer: customer }),
  clearCart: () => set({ items: [], total: 0, selectedCustomer: DEFAULT_CUSTOMER }),
  receiptTemplate: 'standard',
  setReceiptTemplate: (template) => set({ receiptTemplate: template }),
  calculateTotal: () => {
    const items = get().items;
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    set({ total });
  },
}));
