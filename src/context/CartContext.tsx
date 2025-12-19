import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type CartItem = {
  id: number;
  name: string;
  title?: string;
  price: number;
  image: string;
  imageURL?: string[];
  quantity: number;
  shipping?: number;
};

type CartContextData = {
  cartItems: CartItem[];
  addToCart: (item: any) => void;
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

  function addToCart(newItem: any) {
    setCartItems((prevItems) => {
      const newItemId = Number(newItem.id);
      const itemExists = prevItems.find((item) => item.id === newItemId);
      
      const quantityToAdd = newItem.quantity && newItem.quantity > 0 ? newItem.quantity : 1;

      if (itemExists) {
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
        shipping: Number(newItem.shipping) || 0
      };

      return [...prevItems, normalizedItem];
    });
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