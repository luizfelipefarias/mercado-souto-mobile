import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import api from '../../services/api';

type User = {
  id?: number;
  name?: string;
  email: string;
  token: string;
};

interface AuthContextData {
  signed: boolean;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (clientData: any) => Promise<void>;
  signOut: () => Promise<void>;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStorageData() {
      try {
        const storageToken = await AsyncStorage.getItem('@MLToken');
        const storageUser = await AsyncStorage.getItem('@MLUser');

        if (storageToken && storageUser) {
          api.defaults.headers.Authorization = `Bearer ${storageToken}`;
          setUser(JSON.parse(storageUser));
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
      console.log("Tentando logar com:", { username: email, password: password });

      const response = await api.post('/api/login', {
        username: email, 
        password: password
      }, {
        headers: {
          'Content-Type': 'application/json' 
        }
      });

      console.log("Resposta do servidor:", response.data);

      const token = response.data.token || response.data;
      
      if (!token) throw new Error("Token não recebido");

      api.defaults.headers.Authorization = `Bearer ${token}`;
      
      
      const userData: User = { 
        email, 
        token,
        id: 1, 
        name: 'Usuário Teste'
      };

      await AsyncStorage.setItem('@MLToken', token);
      await AsyncStorage.setItem('@MLUser', JSON.stringify(userData));

      setUser(userData);
      router.replace('/'); 

    } catch (error: any) {
      console.log('Erro detalhado:', error.response?.data || error.message);
      
      if (error.response?.status === 500) {
        Alert.alert('Erro 500', 'Erro interno do servidor. Verifique se o usuário existe.');
      } else {
        Alert.alert('Falha na autenticação', 'Verifique seu e-mail e senha.');
      }
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (clientData: any) => {
    setLoading(true);
    try {
      await api.post('/api/client', clientData);
      Alert.alert('Sucesso', 'Conta criada com sucesso! Faça login.');
      router.back();
    } catch (error) {
      console.log('Erro no Cadastro:', error);
      Alert.alert('Erro', 'Verifique os dados e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    await AsyncStorage.removeItem('@MLToken');
    await AsyncStorage.removeItem('@MLUser');
    setUser(null);
    api.defaults.headers.Authorization = null;
    router.replace('/login');
  };

  return (
    <AuthContext.Provider value={{ signed: !!user, user, signIn, signUp, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);