import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '@/services/api';

export type Seller = {
  id: number;
  name?: string;
  tradeName?: string;
};

export type CartItem = {
  id: number;
  name: string;
  title?: string;
  price: number;
  image: string;
  imageURL?: string[];
  quantity: number;
  shipping?: number;
  seller?: Seller;
};

type CartContextData = {
  cartItems: CartItem[];
  addToCart: (item: any) => Promise<void>;
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, amount: number) => void;
  clearCart: () => void;
  totalValue: number;
};

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  useEffect(() => {
    async function loadCart() {
      try {
        const storedCart = await AsyncStorage.getItem('@MLCart');
        if (storedCart) {
          setCartItems(JSON.parse(storedCart));
        }
      } catch (error) {
        console.log('Erro ao carregar carrinho:', error);
      }
    }
    loadCart();
  }, []);

  useEffect(() => {
    async function saveCart() {
      try {
        await AsyncStorage.setItem('@MLCart', JSON.stringify(cartItems));
      } catch (error) {
        console.log('Erro ao salvar carrinho:', error);
      }
    }
    saveCart();
  }, [cartItems]);

  async function fetchSellerData(sellerId: number): Promise<Seller | null> {
    if (!sellerId) return null;
    try {
      const response = await api.get(`/api/users/${sellerId}`); 
      return {
        id: response.data.id,
        name: response.data.name,
        tradeName: response.data.tradeName || response.data.name
      };
    } catch (error) {
      console.log(`Erro ao buscar vendedor ${sellerId}:`, error);
      return null;
    }
  }

  async function addToCart(newItem: any) {
    const newItemId = Number(newItem.id);
    const quantityToAdd = newItem.quantity && newItem.quantity > 0 ? newItem.quantity : 1;
    
    const sellerId = newItem.sellerId || (newItem.seller && newItem.seller.id) || newItem.userId;

    let itemAlreadyExists = false;

    setCartItems((prevItems) => {
      const itemExists = prevItems.find((item) => item.id === newItemId);
      
      if (itemExists) {
        itemAlreadyExists = true;
        return prevItems.map((item) =>
          item.id === newItemId
            ? { ...item, quantity: (item.quantity || 1) + quantityToAdd }
            : item
        );
      }

      const normalizedItem: CartItem = {
        id: newItemId,
        name: newItem.title || newItem.name || 'Produto sem nome',
        price: Number(newItem.price) || 0,
        image: (newItem.imageURL && newItem.imageURL.length > 0) ? newItem.imageURL[0] : (newItem.image || ''),
        quantity: quantityToAdd,
        shipping: Number(newItem.shipping) || 0,
        seller: newItem.seller || { id: sellerId || 0, name: 'Carregando vendedor...' } 
      };

      return [...prevItems, normalizedItem];
    });

    if (itemAlreadyExists) return;

    if (sellerId) {
      const sellerData = await fetchSellerData(sellerId);
      
      if (sellerData) {
        setCartItems((prevItems) => 
          prevItems.map((item) => 
            item.id === newItemId 
              ? { ...item, seller: sellerData } 
              : item
          )
        );
      }
    }
  }

  function removeFromCart(id: number) {
    setCartItems((prevItems) => 
      prevItems.filter((item) => item.id !== Number(id))
    );
  }

  function updateQuantity(id: number, amount: number) {
    setCartItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === Number(id)) {
          const newQuantity = Math.max(1, (item.quantity || 1) + amount);
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  }

  function clearCart() {
    setCartItems([]);
    AsyncStorage.removeItem('@MLCart');
  }

  const totalValue = cartItems.reduce((acc, item) => {
    return acc + (item.price * item.quantity);
  }, 0);

  return (
    <CartContext.Provider
      value={{ 
        cartItems, 
        addToCart, 
        removeFromCart, 
        updateQuantity, 
        clearCart,
        totalValue 
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart deve ser usado dentro de um CartProvider');
  }
  return context;
}