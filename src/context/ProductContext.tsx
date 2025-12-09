import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import api from '../services/api';
import Toast from 'react-native-toast-message';

export type Product = {
  id: number;
  title: string;
  price: number;
  imageURL: string[];
  stock: number;
  description?: string;
  specification?: string;
};

interface ProductContextData {
  products: Product[];
  loading: boolean;
  loadProducts: () => Promise<void>;
}

const ProductContext = createContext<ProductContextData>({} as ProductContextData);

export function ProductProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/product');
      
      if (Array.isArray(response.data)) {
        setProducts(response.data);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.log('Erro ao carregar produtos:', error);
      
      Toast.show({
        type: 'error',
        text1: 'Erro de conexão',
        text2: 'Não foi possível carregar os produtos.'
      });
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <ProductContext.Provider value={{ products, loading, loadProducts }}>
      {children}
    </ProductContext.Provider>
  );
}

export const useProduct = () => useContext(ProductContext);