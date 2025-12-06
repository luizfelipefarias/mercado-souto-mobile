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
  isGuest?: boolean;
};

interface AuthContextData {
  signed: boolean;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (clientData: any) => Promise<void>;
  loginAsGuest: () => Promise<void>;
  signOut: () => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const signOut = useCallback(async () => {
    try {
      await AsyncStorage.multiRemove(['@MLToken', '@MLUser']);
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
        const storageToken = await AsyncStorage.getItem('@MLToken');
        const storageUser = await AsyncStorage.getItem('@MLUser');

        if (storageUser) {
          const parsedUser = JSON.parse(storageUser);
          setUser(parsedUser);

          if (storageToken && !parsedUser.isGuest) {
            api.defaults.headers.Authorization = `Bearer ${storageToken}`;
          }
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
        if (user?.isGuest) {
          return Promise.reject(error);
        }

        const errorMessage = error.response?.data;
        const isTokenExpired = 
          (typeof errorMessage === 'string' && errorMessage.includes('JWT expired')) ||
          error.response?.status === 401 ||
          error.response?.status === 403;

        if (isTokenExpired) {
          console.log("Sessão expirada. Deslogando usuário...");
          
          if (user) { 
            Alert.alert("Sessão Expirada", "Por favor, faça login novamente.");
            await signOut();
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
        username: email, 
        password: password
      });

      const token = response.data.token || response.data;
      
      if (!token || typeof token !== 'string') {
        throw new Error("Token inválido recebido da API");
      }

      api.defaults.headers.Authorization = `Bearer ${token}`;
      
      const userData: User = { 
        email, 
        token,
        id: 1,
        name: 'Usuário',
        isGuest: false
      };

      await AsyncStorage.setItem('@MLToken', token);
      await AsyncStorage.setItem('@MLUser', JSON.stringify(userData));

      setUser(userData);
      router.replace('/(tabs)/home');

    } catch (error: any) {
      console.log('Erro no login:', error);
      Alert.alert('Erro', 'Usuário ou senha inválidos.');
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (clientData: any) => {
    setLoading(true);
    try {
      await api.post('/api/client', clientData);
      Alert.alert('Sucesso', 'Conta criada! Faça login.');
      router.back(); 
    } catch (error) {
      console.log('Erro no cadastro:', error);
      Alert.alert('Erro', 'Não foi possível criar a conta.');
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
        email: 'guest@mercado.souto',
        token: 'guest-token',
        isGuest: true,
      };

      await AsyncStorage.setItem('@MLUser', JSON.stringify(guestUser));
      
      setUser(guestUser);
      api.defaults.headers.Authorization = null;

      router.replace('/(tabs)/home');
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
