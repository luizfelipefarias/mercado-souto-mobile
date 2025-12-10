import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';
import { useAuth } from './AuthContext';
import { CartItem, Product, Client } from '../interfaces';
import Toast from 'react-native-toast-message';


interface CartContextData {
  cartItems: CartItem[];
  cartTotal: number;
  loadingCart: boolean;
  addToCart: (product: Product) => Promise<void>; 
  removeFromCart: (productId: number) => Promise<void>;
  updateQuantity: (productId: number, newQuantity: number) => Promise<void>;
  clearCart: () => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user, isGuest, refreshUserProfile } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [loadingCart, setLoadingCart] = useState(false);

  const getUserCartId = () => {
    return user && !isGuest && 'cart' in user && user.cart ? user.cart.id : null;
  };

  const calculateTotal = (items: CartItem[]) => {
      return items.reduce((sum, item) => sum + (item.quantity * item.product.price), 0);
  };
  
  const loadGuestCart = useCallback(() => {
    AsyncStorage.getItem('@guest_cart').then(res => {
        if (res) {
            const parsedCart: CartItem[] = JSON.parse(res);
            setCartItems(parsedCart);
            setCartTotal(calculateTotal(parsedCart));
        } else {
            setCartItems([]);
            setCartTotal(0);
        }
    }).catch(err => console.log('Erro ao carregar carrinho local:', err));
  }, []);

  useEffect(() => {
    if (!isGuest && user && 'cart' in user && user.cart) {
      setCartItems(user.cart.items || []);
      setCartTotal(user.cart.totalPrice || 0);
    } 
    else if (isGuest) {
      loadGuestCart();
    } else {
      setCartItems([]);
      setCartTotal(0);
    }
  }, [user, isGuest, loadGuestCart]);


  const addToCart = async (product: Product) => {
    const cartId = getUserCartId();

    if (!cartId) {
      const updatedCart = [...cartItems];
      const existingItem = updatedCart.find(i => i.product.id === product.id);
      
      if (existingItem) {
        existingItem.quantity += 1;
        existingItem.subtotal = existingItem.quantity * existingItem.product.price;
      } else {
        const newItem: CartItem = {
          id: product.id, 
          isSelected: true,
          quantity: 1,
          subtotal: product.price * 1,
          product: product
        };
        updatedCart.push(newItem);
      }
      
      const newTotal = calculateTotal(updatedCart);

      setCartItems(updatedCart);
      setCartTotal(newTotal);
      AsyncStorage.setItem('@guest_cart', JSON.stringify(updatedCart));
      Toast.show({ type: 'success', text1: 'Adicionado ao carrinho' });
      return;
    }

    setLoadingCart(true);
    try {
      await api.post(`/api/cart/${cartId}/product/${product.id}`, { quantity: 1 });
      
      await refreshUserProfile(); 
      Toast.show({ type: 'success', text1: 'Produto adicionado!' });
    } catch (error) {
      console.log('Erro ao adicionar ao carrinho:', error);
      Toast.show({ type: 'error', text1: 'Erro ao adicionar produto' });
    } finally {
      setLoadingCart(false);
    }
  };

  const removeFromCart = async (productId: number) => {
    const cartId = getUserCartId();

    if (!cartId) {
      const updated = cartItems.filter(i => i.product.id !== productId);
      const newTotal = calculateTotal(updated);

      setCartItems(updated);
      setCartTotal(newTotal);
      AsyncStorage.setItem('@guest_cart', JSON.stringify(updated));
      return;
    }

    setLoadingCart(true);
    try {
      await api.delete(`/api/cart/${cartId}/product/${productId}`);
      await refreshUserProfile();
      Toast.show({ type: 'info', text1: 'Produto removido.' });
    } catch (error) {
      console.log('Erro ao remover:', error);
      Toast.show({ type: 'error', text1: 'Erro ao remover produto' });
    } finally {
      setLoadingCart(false);
    }
  };
  
  const updateQuantity = async (productId: number, newQuantity: number) => {
    if (newQuantity < 1) return;

    const cartId = getUserCartId();

    if (!cartId) {
        const updatedCart = cartItems.map(item => {
            if (item.product.id === productId) {
                const updatedItem = { ...item, quantity: newQuantity };
                updatedItem.subtotal = updatedItem.quantity * updatedItem.product.price;
                return updatedItem;
            }
            return item;
        });
        
        const newTotal = calculateTotal(updatedCart);
        
        setCartItems(updatedCart);
        setCartTotal(newTotal);
        AsyncStorage.setItem('@guest_cart', JSON.stringify(updatedCart));
        return;
    }

    setLoadingCart(true);
    try {
      await api.put(`/api/cart/${cartId}/product/${productId}`, { quantity: newQuantity });
      
      await refreshUserProfile();
      Toast.show({ type: 'info', text1: 'Quantidade atualizada.' });
      
    } catch (error) {
        console.log('Erro ao atualizar quantidade:', error);
        Toast.show({ type: 'error', text1: 'Erro ao atualizar quantidade' });
    } finally {
        setLoadingCart(false);
    }
  };

  const clearCart = () => {
    setCartItems([]);
    setCartTotal(0);
    if (isGuest) AsyncStorage.removeItem('@guest_cart');
  };

  return (
    <CartContext.Provider value={{ 
      cartItems, 
      cartTotal, 
      loadingCart, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      clearCart 
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);