import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { createContext, ReactNode, useContext, useEffect, useState, useCallback } from 'react';
import { Alert } from 'react-native';
import api from '../services/api';

type User = {
  id?: number;
  name?: string;
  email: string;
  token: string;
  phone?: string;
  cpf?: string;
  isGuest?: boolean;
};

interface AuthContextData {
  signed: boolean;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (clientData: any) => Promise<any>;
  loginAsGuest: () => Promise<void>;
  signOut: () => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const STORAGE_TOKEN = '@auth_token';
  const STORAGE_USER = '@user_data';

  const signOut = useCallback(async () => {
    try {
      await AsyncStorage.multiRemove([STORAGE_TOKEN, STORAGE_USER, '@user_email']);
      api.defaults.headers.Authorization = null;
      setUser(null);
      router.replace('/');
    } catch (error) {
      console.log("Erro ao sair:", error);
    }
  }, [router]); 

  useEffect(() => {
    async function loadStorageData() {
      try {
        const storageToken = await AsyncStorage.getItem(STORAGE_TOKEN);
        const storageUser = await AsyncStorage.getItem(STORAGE_USER);

        if (storageToken && storageUser) {
          const parsedUser = JSON.parse(storageUser);
          
          api.defaults.headers.Authorization = `Bearer ${storageToken}`;
          setUser(parsedUser);
        } else if (storageUser) {
            const parsedUser = JSON.parse(storageUser);
            if(parsedUser.isGuest) setUser(parsedUser);
        }
      } catch (error) {
        console.log("Erro ao carregar sessão:", error);
      } finally {
        setLoading(false);
      }
    }

    loadStorageData();
  }, []); 

  useEffect(() => {
    const interceptorId = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (user?.isGuest) return Promise.reject(error);

        if (error.response?.status === 401 || error.response?.status === 403) {
          if (user) { 
            console.log("Sessão expirada. Saindo...");
            await signOut();
            Alert.alert("Sessão Expirada", "Faça login novamente.");
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.response.eject(interceptorId);
    };
  }, [user, signOut]);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await api.post('/api/login', {
        email: email, 
        password: password
      });

      const token = response.data.token || response.data; 
      
      const userData: User = { 
        id: response.data.id || 1,
        name: response.data.name || 'Usuário',
        email, 
        token,
        isGuest: false
      };

      api.defaults.headers.Authorization = `Bearer ${token}`;
      
      await AsyncStorage.setItem(STORAGE_TOKEN, token);
      await AsyncStorage.setItem(STORAGE_USER, JSON.stringify(userData));
      
      await AsyncStorage.setItem('@user_email', email); 

      setUser(userData);
      
      return response.data; 

    } catch (error: any) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (clientData: any) => {
    setLoading(true);
    try {
      const response = await api.post('/api/client', clientData);
      
      return response.data;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loginAsGuest = async () => {
    setLoading(true);
    try {
      const guestUser: User = {
        id: 0,
        name: 'Visitante',
        email: 'visitante@app.com',
        token: 'guest-token',
        isGuest: true,
      };

      await AsyncStorage.setItem(STORAGE_USER, JSON.stringify(guestUser));
      await AsyncStorage.setItem('@user_email', guestUser.email);
      
      setUser(guestUser);
      api.defaults.headers.Authorization = null;

      router.replace('/(tabs)');
    } catch (error) {
      console.log('Erro ao entrar como visitante', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      signed: !!user, 
      user, 
      signIn, 
      signUp, 
      loginAsGuest, 
      signOut, 
      loading,
      setUser 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);