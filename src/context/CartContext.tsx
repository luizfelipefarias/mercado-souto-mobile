import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type CartItem = {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
  shipping?: number;
};

type CartContextData = {
  cartItems: CartItem[];
  addToCart: (item: Partial<CartItem>) => void;
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, amount: number) => void;
  clearCart: () => void;
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

  function addToCart(newItem: Partial<CartItem>) {
    setCartItems((prevItems) => {
      const itemExists = prevItems.find((item) => String(item.id) === String(newItem.id));
      
      const quantityToAdd = newItem.quantity && newItem.quantity > 0 ? newItem.quantity : 1;

      if (itemExists) {
        return prevItems.map((item) =>
          String(item.id) === String(newItem.id)
            ? { ...item, quantity: (item.quantity || 1) + quantityToAdd }
            : item
        );
      }

      const itemToSave: CartItem = {
        id: Number(newItem.id), 
        name: newItem.name || 'Produto sem nome',
        price: Number(newItem.price) || 0,
        image: newItem.image || '',
        quantity: quantityToAdd,
        shipping: Number(newItem.shipping) || 0
      };

      return [...prevItems, itemToSave];
    });
  }

  function removeFromCart(id: number) {
    setCartItems((prevItems) => 
      prevItems.filter((item) => String(item.id) !== String(id))
    );
  }

  function updateQuantity(id: number, amount: number) {
    setCartItems((prevItems) =>
      prevItems.map((item) => {
        if (String(item.id) === String(id)) {
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

  return (
    <CartContext.Provider
      value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart }}
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