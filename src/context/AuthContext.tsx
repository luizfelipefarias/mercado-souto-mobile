import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { createContext, ReactNode, useContext, useEffect, useState, useCallback } from 'react';
import { Alert } from 'react-native';
import api from '../services/api';
import { Client } from '../interfaces'; 

const STORAGE_TOKEN = '@auth_token';
const STORAGE_USER = '@user_data';
const STORAGE_GUEST = '@is_guest';

interface AuthContextData {
  signed: boolean;
  user: Client | null;
  token: string | null;
  loading: boolean;
  isGuest: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (clientData: any) => Promise<boolean>; 
  loginAsGuest: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

function decodeJwtManual(token: string) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
  } catch (e) {
    console.log("Erro ao decodificar JWT manualmente:", e);
    return null;
  }
}

if (!global.atob) {
  global.atob = (input: string) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    let str = input.replace(/=+$/, '');
    let output = '';

    if (str.length % 4 == 1) {
      throw new Error("'atob' failed: The string to be decoded is not correctly encoded.");
    }
    for (let bc = 0, bs = 0, buffer, i = 0;
      buffer = str.charAt(i++);

      ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer,
        bc++ % 4) ? output += String.fromCharCode(255 & bs >> (-2 * bc & 6)) : 0
    ) {
      buffer = chars.indexOf(buffer);
    }
    return output;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Client | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchClientById = async (id: number): Promise<Client | null> => {
    try {
      console.log(`--- Buscando cliente direto pelo ID: ${id} ---`);
      const response = await api.get<Client>(`/api/client/${id}`);
      console.log("Dados do cliente recebidos:", response.data.name);
      return response.data;
    } catch (error: any) {
      console.error(`Erro ao buscar cliente ID ${id}:`, error.response?.status);
      return null;
    }
  };

  const refreshUserProfile = async () => {
    if (!user?.id || isGuest) return;
    const updatedClient = await fetchClientById(user.id);
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
      setToken(null);
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
          setUser({ name: 'Visitante', id: null } as unknown as Client); 
        } else if (storedToken[1] && storedUser[1]) {
          const tkn = storedToken[1];
          api.defaults.headers.Authorization = tkn.startsWith('Bearer ') ? tkn : `Bearer ${tkn}`;
          setToken(tkn);
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
      console.log(`Tentando logar com: ${email}`);
      const authResponse = await api.post('/api/login', { email, password });
      
      console.log('Login Status:', authResponse.status);
      console.log('Login Body:', authResponse.data);

      const rawToken = authResponse.data.token || authResponse.data.accessToken || (typeof authResponse.data === 'string' ? authResponse.data : null);

      if (!rawToken) {
        throw new Error("Token não encontrado na resposta da API");
      }

      const bearerToken = rawToken.startsWith('Bearer ') ? rawToken : `Bearer ${rawToken}`;
      const cleanToken = rawToken.replace('Bearer ', '').trim();

      api.defaults.headers.Authorization = bearerToken;
      await AsyncStorage.setItem(STORAGE_TOKEN, bearerToken);
      setToken(cleanToken);

      let clientData: Client | null = null;
      let userId: number | null = null;

      if (authResponse.data.id) userId = authResponse.data.id;
      if (authResponse.data.userId) userId = authResponse.data.userId;
      if (authResponse.data.client?.id) userId = authResponse.data.client.id;

      if (!userId) {
        console.log("Tentando extrair ID do Token...");
        const decoded = decodeJwtManual(cleanToken);
        console.log("Token Decodificado:", decoded);
        
        if (decoded) {
            userId = decoded.id || decoded.userId || decoded.sub_id || decoded.clientId;
        }
      }

      if (userId) {
          console.log("ID encontrado:", userId, ". Buscando detalhes...");
          clientData = await fetchClientById(userId);
      } else {
          console.warn("NÃO FOI POSSÍVEL ACHAR O ID DO USUÁRIO. USANDO FALLBACK.");
      }

      if (!clientData) {
        clientData = { 
          id: userId || 0,
          name: email.split('@')[0], 
          email: email 
        } as unknown as Client;
      }

      await AsyncStorage.setItem(STORAGE_USER, JSON.stringify(clientData));
      await AsyncStorage.removeItem(STORAGE_GUEST);
      
      setUser(clientData);
      setIsGuest(false);
      
      console.log('Login efetuado com sucesso! User ID:', clientData.id);

    } catch (error: any) {
      console.error('ERRO NO SIGNIN:', error);
      api.defaults.headers.Authorization = null;
      throw error; 
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (clientData: any): Promise<boolean> => {
    setLoading(true);
    try {
      console.log('Enviando cadastro:', clientData);
      const res = await api.post('/api/client', clientData);
      return true;
    } catch (error: any) {
      console.error('ERRO NO SIGNUP:', error.response?.data || error.message);
      throw error; 
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
      setToken(null);
      setUser({ name: 'Visitante', id: null, email: '' } as unknown as Client);
      
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
      token,
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