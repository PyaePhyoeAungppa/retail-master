
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
  setCustomer: (customer: Customer | null) => void;
  clearCart: () => void;
  calculateTotal: () => void;
  total: number;
  orderId: string | null;
  setOrderId: (id: string | null) => void;
  clearOrder: () => void;
  receiptTemplate: 'standard' | 'thermal' | 'modern';
  setReceiptTemplate: (template: 'standard' | 'thermal' | 'modern') => void;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  selectedCustomer: null,
  total: 0,
  addItem: (product, quantity = 1) => {
    const items = get().items;
    const existingItem = items.find((item) => item.id === product.id);

    let newItems;
    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      if (product.trackStock !== false && newQuantity > product.stock) {
        // Limit to available stock only if tracking is enabled
        newItems = items.map((item) =>
          item.id === product.id
            ? { ...item, quantity: product.stock }
            : item
        );
      } else {
        newItems = items.map((item) =>
          item.id === product.id
            ? { ...item, quantity: newQuantity }
            : item
        );
      }
    } else {
      const securedQuantity = product.trackStock !== false ? Math.min(quantity, product.stock) : quantity;
      newItems = [...items, { ...product, quantity: securedQuantity }];
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
          ? { 
              ...item, 
              quantity: item.trackStock !== false 
                ? Math.min(item.stock, Math.max(1, item.quantity + delta))
                : Math.max(1, item.quantity + delta)
            }
          : item
      ),
    });
    get().calculateTotal();
  },
  setCustomer: (customer) => set({ selectedCustomer: customer }),
  clearCart: () => set({ items: [], total: 0, orderId: null }),
  orderId: null,
  setOrderId: (id) => set({ orderId: id }),
  clearOrder: () => set({ orderId: null }),
  receiptTemplate: 'standard',
  setReceiptTemplate: (template) => set({ receiptTemplate: template }),
  calculateTotal: () => {
    const items = get().items;
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    set({ total });
  },
}));
