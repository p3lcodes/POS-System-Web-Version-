import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product, initialProducts } from '@/data/products';
import { User, initialUsers } from '@/data/users';

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Sale {
  id: string;
  items: CartItem[];
  total: number;
  paymentMethod: 'mpesa' | 'cash';
  mpesaRef?: string;
  cashierId: string;
  cashierName: string;
  timestamp: Date;
  synced: boolean;
}

export interface Notification {
  id: string;
  type: 'low-stock' | 'payment' | 'sync' | 'info';
  title: string;
  message: string;
  read: boolean;
  timestamp: Date;
}

interface AppState {
  // Auth
  currentUser: User | null;
  users: User[];
  isAuthenticated: boolean;
  
  // Products & Cart
  products: Product[];
  cart: CartItem[];
  
  // Sales & Reports
  sales: Sale[];
  
  // Notifications
  notifications: Notification[];
  
  // App State
  isOnline: boolean;
  isDarkMode: boolean;
  pendingSyncs: number;
  
  // Auth Actions
  login: (pin: string) => boolean;
  logout: () => void;
  addUser: (user: Omit<User, 'id'>) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;
  
  // Product Actions
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: number, updates: Partial<Product>) => void;
  deleteProduct: (id: number) => void;
  updateStock: (id: number, quantity: number) => void;
  
  // Cart Actions
  addToCart: (product: Product, quantity: number) => void;
  updateCartItem: (productId: number, quantity: number) => void;
  removeFromCart: (productId: number) => void;
  clearCart: () => void;
  
  // Sales Actions
  completeSale: (paymentMethod: 'mpesa' | 'cash', mpesaRef?: string) => Sale | null;
  
  // Notification Actions
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
  
  // App Actions
  setOnlineStatus: (status: boolean) => void;
  toggleDarkMode: () => void;
  syncPendingSales: () => void;
  
  // Computed
  getCartTotal: () => number;
  getLowStockProducts: () => Product[];
  getTodaySales: () => Sale[];
  getSalesTotal: (sales: Sale[]) => number;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial State
      currentUser: null,
      users: initialUsers,
      isAuthenticated: false,
      products: initialProducts,
      cart: [],
      sales: [],
      notifications: [],
      isOnline: navigator.onLine,
      isDarkMode: false,
      pendingSyncs: 0,

      // Auth Actions
      login: (pin: string) => {
        const user = get().users.find(u => u.pin === pin && u.active);
        if (user) {
          set({ currentUser: user, isAuthenticated: true });
          return true;
        }
        return false;
      },

      logout: () => {
        set({ currentUser: null, isAuthenticated: false, cart: [] });
      },

      addUser: (userData) => {
        const newUser: User = {
          ...userData,
          id: `user-${Date.now()}`,
        };
        set(state => ({ users: [...state.users, newUser] }));
      },

      updateUser: (id, updates) => {
        set(state => ({
          users: state.users.map(u => u.id === id ? { ...u, ...updates } : u),
        }));
      },

      deleteUser: (id) => {
        set(state => ({
          users: state.users.filter(u => u.id !== id),
        }));
      },

      // Product Actions
      addProduct: (productData) => {
        const maxId = Math.max(...get().products.map(p => p.id), 0);
        const newProduct: Product = {
          ...productData,
          id: maxId + 1,
        };
        set(state => ({ products: [...state.products, newProduct] }));
      },

      updateProduct: (id, updates) => {
        set(state => ({
          products: state.products.map(p => p.id === id ? { ...p, ...updates } : p),
        }));
      },

      deleteProduct: (id) => {
        set(state => ({
          products: state.products.filter(p => p.id !== id),
        }));
      },

      updateStock: (id, quantity) => {
        const product = get().products.find(p => p.id === id);
        if (product) {
          const newStock = product.stock + quantity;
          set(state => ({
            products: state.products.map(p => 
              p.id === id ? { ...p, stock: Math.max(0, newStock) } : p
            ),
          }));
          
          // Check for low stock
          if (newStock <= product.lowStockThreshold && newStock > 0) {
            get().addNotification({
              type: 'low-stock',
              title: 'Low Stock Alert',
              message: `${product.name} is running low (${newStock} left)`,
            });
          }
        }
      },

      // Cart Actions
      addToCart: (product, quantity) => {
        const cart = get().cart;
        const existingItem = cart.find(item => item.product.id === product.id);
        
        if (existingItem) {
          set({
            cart: cart.map(item =>
              item.product.id === product.id
                ? { ...item, quantity: item.quantity + quantity }
                : item
            ),
          });
        } else {
          set({ cart: [...cart, { product, quantity }] });
        }
      },

      updateCartItem: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(productId);
        } else {
          set(state => ({
            cart: state.cart.map(item =>
              item.product.id === productId ? { ...item, quantity } : item
            ),
          }));
        }
      },

      removeFromCart: (productId) => {
        set(state => ({
          cart: state.cart.filter(item => item.product.id !== productId),
        }));
      },

      clearCart: () => {
        set({ cart: [] });
      },

      // Sales Actions
      completeSale: (paymentMethod, mpesaRef) => {
        const { cart, currentUser, isOnline } = get();
        if (cart.length === 0 || !currentUser) return null;

        const total = get().getCartTotal();
        const sale: Sale = {
          id: `sale-${Date.now()}`,
          items: [...cart],
          total,
          paymentMethod,
          mpesaRef,
          cashierId: currentUser.id,
          cashierName: currentUser.name,
          timestamp: new Date(),
          synced: isOnline,
        };

        // Update stock for each item
        cart.forEach(item => {
          get().updateStock(item.product.id, -item.quantity);
        });

        set(state => ({
          sales: [sale, ...state.sales],
          cart: [],
          pendingSyncs: isOnline ? state.pendingSyncs : state.pendingSyncs + 1,
        }));

        // Add payment notification
        get().addNotification({
          type: 'payment',
          title: 'Sale Complete',
          message: `KES ${total.toLocaleString()} via ${paymentMethod === 'mpesa' ? 'M-Pesa' : 'Cash'}`,
        });

        return sale;
      },

      // Notification Actions
      addNotification: (notificationData) => {
        const notification: Notification = {
          ...notificationData,
          id: `notif-${Date.now()}`,
          timestamp: new Date(),
          read: false,
        };
        set(state => ({
          notifications: [notification, ...state.notifications].slice(0, 50),
        }));
      },

      markNotificationRead: (id) => {
        set(state => ({
          notifications: state.notifications.map(n =>
            n.id === id ? { ...n, read: true } : n
          ),
        }));
      },

      clearNotifications: () => {
        set({ notifications: [] });
      },

      // App Actions
      setOnlineStatus: (status) => {
        set({ isOnline: status });
        if (status && get().pendingSyncs > 0) {
          get().syncPendingSales();
        }
      },

      toggleDarkMode: () => {
        set(state => {
          const newMode = !state.isDarkMode;
          if (newMode) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
          return { isDarkMode: newMode };
        });
      },

      syncPendingSales: () => {
        const unsyncedSales = get().sales.filter(s => !s.synced);
        set(state => ({
          sales: state.sales.map(s => ({ ...s, synced: true })),
          pendingSyncs: 0,
        }));
        
        if (unsyncedSales.length > 0) {
          get().addNotification({
            type: 'sync',
            title: 'Sync Complete',
            message: `${unsyncedSales.length} sales synced successfully`,
          });
        }
      },

      // Computed
      getCartTotal: () => {
        return get().cart.reduce(
          (total, item) => total + item.product.price * item.quantity,
          0
        );
      },

      getLowStockProducts: () => {
        return get().products.filter(p => p.stock <= p.lowStockThreshold);
      },

      getTodaySales: () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return get().sales.filter(s => new Date(s.timestamp) >= today);
      },

      getSalesTotal: (sales) => {
        return sales.reduce((total, sale) => total + sale.total, 0);
      },
    }),
    {
      name: 'freshfity-store',
      partialize: (state) => ({
        products: state.products,
        users: state.users,
        sales: state.sales,
        notifications: state.notifications,
        isDarkMode: state.isDarkMode,
        pendingSyncs: state.pendingSyncs,
      }),
    }
  )
);
