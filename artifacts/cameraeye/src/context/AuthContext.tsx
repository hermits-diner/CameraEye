import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Order } from '@/types/commerce';

interface UserProfile {
  name: string;
  email: string;
}

interface AuthContextType {
  user: UserProfile | null;
  orders: Order[];
  login: (email: string, name?: string) => void;
  logout: () => void;
  addOrder: (order: Order) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SAMPLE_INITIAL_ORDERS: Order[] = [
  {
    id: 'ORD-2026-8801',
    createdAt: '2026-07-20 14:30',
    customerEmail: 'collector@cameraeye.art',
    status: 'production',
    paymentMethod: 'Simulated Card',
    shippingFeeUsd: 25,
    shippingFeeKrw: 33750,
    totalUsd: 475,
    totalKrw: 641250,
    items: [
      {
        id: 'item-1',
        projectId: '1',
        projectTitle: 'Shadows & Light',
        coverImageUrl: '/images/editorial-1.jpg',
        type: 'print',
        selectedSize: 'A2 (420 x 594 mm) - Limited Edition Fine Art Print',
        priceUsd: 450,
        priceKrw: 607500,
      },
    ],
    shippingDetails: {
      recipientName: 'Junghoon Oh',
      phone: '+82 10-1234-5678',
      address: 'Gangnam-daero 100-gil 12',
      city: 'Seoul',
      postalCode: '06123',
      country: 'KR',
    },
    trackingNumber: 'LX-9012384-KR',
  },
  {
    id: 'ORD-2026-8802',
    createdAt: '2026-07-21 09:15',
    customerEmail: 'collector@cameraeye.art',
    status: 'completed',
    paymentMethod: 'Simulated Card',
    shippingFeeUsd: 0,
    shippingFeeKrw: 0,
    totalUsd: 95,
    totalKrw: 128250,
    items: [
      {
        id: 'item-2',
        projectId: '2',
        projectTitle: 'Urban Desolation',
        coverImageUrl: '/images/urban-1.jpg',
        type: 'digital',
        priceUsd: 95,
        priceKrw: 128250,
        digitalDownloadUrl: '/downloads/urban-desolation-master-fullres.zip',
      },
    ],
  },
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('cameraeye_user');
      return saved ? JSON.parse(saved) : { name: 'Junghoon Oh', email: 'collector@cameraeye.art' };
    } catch {
      return { name: 'Junghoon Oh', email: 'collector@cameraeye.art' };
    }
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('cameraeye_orders');
      return saved ? JSON.parse(saved) : SAMPLE_INITIAL_ORDERS;
    } catch {
      return SAMPLE_INITIAL_ORDERS;
    }
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('cameraeye_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('cameraeye_user');
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('cameraeye_orders', JSON.stringify(orders));
  }, [orders]);

  const login = (email: string, name?: string) => {
    setUser({ email, name: name || email.split('@')[0] });
  };

  const logout = () => {
    setUser(null);
  };

  const addOrder = (order: Order) => {
    setOrders((prev) => [order, ...prev]);
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders((prev) =>
      prev.map((ord) => (ord.id === orderId ? { ...ord, status } : ord))
    );
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        orders,
        login,
        logout,
        addOrder,
        updateOrderStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
