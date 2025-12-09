import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

export type OrderItem = {
  id: number;
  product: {
    id: number;
    title: string;
    imageURL: string[];
  };
  quantity: number;
  price: number;
};

export type Order = {
  id: number;
  date: string;
  status: string;
  items: OrderItem[];
  total: number;
};

interface OrderContextData {
  orders: Order[];
  loading: boolean;
  fetchOrders: () => Promise<void>;
  createOrder: (orderData: any) => Promise<void>;
}

const OrderContext = createContext<OrderContextData>({} as OrderContextData);

export function OrderProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  
  const { user } = useAuth();

  const fetchOrders = useCallback(async () => {
    const userId = (user as any)?.id;
    if (!userId || (user as any)?.isGuest) return;

    setLoading(true);
    try {
      const response = await api.get(`/api/purchase/by-client/${userId}`);
      
      if (Array.isArray(response.data)) {
        setOrders(response.data);
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.log("Erro ao buscar pedidos no contexto:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const createOrder = async (orderData: any) => {
    setLoading(true);
    try {
      await api.post('/api/orders', orderData);
      
      await fetchOrders();
      
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <OrderContext.Provider value={{ orders, loading, fetchOrders, createOrder }}>
      {children}
    </OrderContext.Provider>
  );
}

export const useOrder = () => useContext(OrderContext);