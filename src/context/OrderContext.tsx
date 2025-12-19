import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';
import Toast from 'react-native-toast-message';

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
  createdAt: string;
  status: string;
  orderItems: OrderItem[];
  total: number;
};

interface OrderContextData {
  orders: Order[];
  loadingOrder: boolean;
  fetchMyOrders: () => Promise<void>;
  createOrder: (orderData: any) => Promise<void>;
}

const OrderContext = createContext<OrderContextData>({} as OrderContextData);

export function OrderProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrder, setLoadingOrder] = useState(false);
  
  const { user, isGuest, token } = useAuth();

  const fetchMyOrders = useCallback(async () => {
    if (!user || isGuest || !(user as any).id || !token) return;

    setLoadingOrder(true);
    try {
      console.log(`[OrderContext] Buscando pedidos em: /api/client/${(user as any).id}/orders`);

      const response = await api.get(`/api/client/${(user as any).id}/orders`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (Array.isArray(response.data)) {
        const sortedOrders = response.data.sort((a: Order, b: Order) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setOrders(sortedOrders);
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.log("Erro ao buscar pedidos no contexto:", error);
    } finally {
      setLoadingOrder(false);
    }
  }, [user, isGuest, token]);

  const createOrder = async (orderData: any) => {
    if (!token) {
        console.log("Tentativa de criar pedido sem token");
        return;
    }

    setLoadingOrder(true);
    try {
      await api.post('/api/orders', orderData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      await fetchMyOrders();
      
    } catch (error) {
      console.log("Erro ao criar pedido:", error);
      throw error;
    } finally {
      setLoadingOrder(false);
    }
  };

  return (
    <OrderContext.Provider value={{ orders, loadingOrder, fetchMyOrders, createOrder }}>
      {children}
    </OrderContext.Provider>
  );
}

export const useOrder = () => useContext(OrderContext);