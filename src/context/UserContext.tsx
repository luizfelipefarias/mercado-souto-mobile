import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

export type Address = {
  id: number;
  street: string;
  number: string;
  complement?: string;
  additionalInfo?: string;
  city: string;
  state: string;
  cep: string;
  contactName?: string;
  contactPhone?: string;
  home?: boolean;
};

interface UserContextData {
  addresses: Address[];
  loadingAddress: boolean;
  refreshAddresses: () => Promise<void>;
}

const UserContext = createContext<UserContextData>({} as UserContextData);

export function UserProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loadingAddress, setLoadingAddress] = useState(false);

  const refreshAddresses = useCallback(async () => {
    const userId = (user as any)?.id;
    
    if (!userId || (user as any)?.isGuest) {
      setAddresses([]);
      return;
    }

    setLoadingAddress(true);
    try {
      const response = await api.get(`/api/address/by-client/${userId}`);
      
      if (Array.isArray(response.data)) {
        setAddresses(response.data);
      } else {
        setAddresses([]);
      }
    } catch (error) {
      console.log('Erro ao carregar endereços no contexto:', error);
    } finally {
      setLoadingAddress(false);
    }
  }, [user]);

  useEffect(() => {
    refreshAddresses();
  }, [refreshAddresses]);

  return (
    <UserContext.Provider value={{ addresses, loadingAddress, refreshAddresses }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);