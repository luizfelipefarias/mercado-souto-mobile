import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';
import { useAuth } from './AuthContext';
import Toast from 'react-native-toast-message';

const LOCAL_STORAGE_KEY = '@MercadoSouto:Favorites';

export type FavoriteProduct = {
  id: number;
  title: string;
  price: number;
  imageURL: string[];
};

interface FavoritesContextData {
  favorites: FavoriteProduct[];
  loadingFavorites: boolean;
  addFavorite: (product: FavoriteProduct) => Promise<void>;
  removeFavorite: (productId: number) => Promise<void>;
  isFavorite: (productId: number) => boolean;
  refreshFavorites: () => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextData>({} as FavoritesContextData);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { user, isGuest } = useAuth();
  const [favorites, setFavorites] = useState<FavoriteProduct[]>([]);
  const [loadingFavorites, setLoadingFavorites] = useState(true);

  const refreshFavorites = useCallback(async () => {
    setLoadingFavorites(true);
    try {
      if (user && !isGuest) {
        const response = await api.get(`/api/client/${user.id}/favorite-products`);
        setFavorites(response.data || []);
      } else {
        const stored = await AsyncStorage.getItem(LOCAL_STORAGE_KEY);
        if (stored) {
          setFavorites(JSON.parse(stored));
        } else {
          setFavorites([]);
        }
      }
    } catch (error) {
      console.log('Erro ao carregar favoritos (pode ser normal se a lista estiver vazia na API):', error);
      setFavorites([]); 
    } finally {
      setLoadingFavorites(false);
    }
  }, [user, isGuest]);

  useEffect(() => {
    refreshFavorites();
  }, [refreshFavorites]);

  const addFavorite = async (product: FavoriteProduct) => {
    const newFavorites = [...favorites, product];
    setFavorites(newFavorites);
    Toast.show({ type: 'success', text1: 'Adicionado aos favoritos' });

    try {
      if (user && !isGuest) {
        await api.post(`/api/client/${user.id}/favorite-product/${product.id}`);
      } else {
        await AsyncStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newFavorites));
      }
    } catch (error) {
      console.error('Erro ao adicionar favorito:', error);
      refreshFavorites();
    }
  };

  const removeFavorite = async (productId: number) => {
    const newFavorites = favorites.filter(p => p.id !== productId);
    setFavorites(newFavorites);
    Toast.show({ type: 'success', text1: 'Removido dos favoritos' });

    try {
      if (user && !isGuest) {
        await api.delete(`/api/client/${user.id}/favorite-product/${productId}`);
      } else {
        await AsyncStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newFavorites));
      }
    } catch (error) {
      console.error('Erro ao remover favorito:', error);
      refreshFavorites();
    }
  };

  const isFavorite = (productId: number) => {
    return favorites.some(p => p.id === productId);
  };

  return (
    <FavoritesContext.Provider value={{ favorites, loadingFavorites, addFavorite, removeFavorite, isFavorite, refreshFavorites }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  return useContext(FavoritesContext);
}