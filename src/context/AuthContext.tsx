import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { createContext, ReactNode, useContext, useEffect, useState, useCallback } from 'react';
import { Alert } from 'react-native';
import api from '../services/api';
import { Client, LoginResponse, Cart } from '../interfaces'; 

const STORAGE_TOKEN = '@auth_token';
const STORAGE_USER = '@user_data';
const STORAGE_GUEST = '@is_guest';

interface AuthContextData {
  signed: boolean;
  user: Client | null;
  token: string | null; // <--- 1. Adicionado na interface
  loading: boolean;
  isGuest: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (clientData: any) => Promise<void>;
  loginAsGuest: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Client | null>(null);
  const [token, setToken] = useState<string | null>(null); // <--- 2. Adicionado estado para o token
  const [isGuest, setIsGuest] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchClientData = async (email: string): Promise<Client | null> => {
    try {
      const response = await api.get<Client[]>('/api/client');
      const foundClient = response.data.find(c => c.email === email);
      return foundClient || null;
    } catch (error) {
      console.log('Erro ao buscar dados do cliente:', error);
      return null;
    }
  };

  const refreshUserProfile = async () => {
    if (!user?.email || isGuest) return;
    const updatedClient = await fetchClientData(user.email);
    if (updatedClient) {
      setUser(updatedClient);
      await AsyncStorage.setItem(STORAGE_USER, JSON.stringify(updatedClient));
    }
  };

  const signOut = useCallback(async () => {
    try {
      await AsyncStorage.multiRemove([STORAGE_TOKEN, STORAGE_USER, STORAGE_GUEST]);
      api.defaults.headers.Authorization = null;
      setUser(null);
      setToken(null); // <--- Limpa o token ao sair
      setIsGuest(false);
      router.replace('/');
    } catch (error) {
      console.log("Erro ao sair:", error);
    }
  }, [router]);

  useEffect(() => {
    async function loadStorageData() {
      try {
        const [storedToken, storedUser, guestFlag] = await AsyncStorage.multiGet([
          STORAGE_TOKEN, 
          STORAGE_USER,
          STORAGE_GUEST
        ]);

        if (guestFlag[1] === 'true') {
          setIsGuest(true);
          setUser({ name: 'Visitante', id: null, cart: null } as unknown as Client); 
        } else if (storedToken[1] && storedUser[1]) {
          api.defaults.headers.Authorization = `Bearer ${storedToken[1]}`;
          setToken(storedToken[1]); // <--- Restaura o token no estado
          setUser(JSON.parse(storedUser[1]));
          setIsGuest(false);
        }
      } catch (error) {
        console.log("Erro ao carregar sessão:", error);
      } finally {
        setLoading(false);
      }
    }
    loadStorageData();
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const authResponse = await api.post('/api/login', { email, password });
      const responseToken = authResponse.data.token || authResponse.data;

      if (!responseToken) throw new Error("Token não fornecido pela API");

      api.defaults.headers.Authorization = `Bearer ${responseToken}`;
      await AsyncStorage.setItem(STORAGE_TOKEN, responseToken);
      setToken(responseToken); // <--- Salva o token no estado

      const clientData = await fetchClientData(email);
      
      if (!clientData) {
        throw new Error("Cliente não encontrado na base de dados.");
      }

      await AsyncStorage.setItem(STORAGE_USER, JSON.stringify(clientData));
      await AsyncStorage.removeItem(STORAGE_GUEST);
      
      setUser(clientData);
      setIsGuest(false);
      router.replace('/(tabs)');

    } catch (error: any) {
      console.log('Erro Login:', error);
      Alert.alert('Erro', 'Verifique suas credenciais.');
      api.defaults.headers.Authorization = null;
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
      console.log('Erro Cadastro:', error);
      Alert.alert('Erro', 'Falha ao criar conta.');
    } finally {
      setLoading(false);
    }
  };

  const loginAsGuest = async () => {
    setLoading(true);
    try {
      await AsyncStorage.setItem(STORAGE_GUEST, 'true');
      await AsyncStorage.multiRemove([STORAGE_TOKEN, STORAGE_USER]);
      
      api.defaults.headers.Authorization = null;
      setIsGuest(true);
      setToken(null); // <--- Garante que o token é nulo
      setUser({ name: 'Visitante', id: null, cart: null } as unknown as Client);
      
      router.replace('/(tabs)');
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      signed: !!user && !isGuest, 
      user,
      token, // <--- 3. Exposto no value para ser consumido
      isGuest,
      loading,
      signIn, 
      signUp, 
      loginAsGuest, 
      signOut,
      refreshUserProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);