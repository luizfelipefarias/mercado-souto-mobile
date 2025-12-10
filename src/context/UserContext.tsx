import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';
import { Address } from '../interfaces';

interface UserContextData {
  addresses: Address[];
  loadingAddress: boolean;
  refreshAddresses: () => Promise<void>;
}

const UserContext = createContext<UserContextData>({} as UserContextData);

export function UserProvider({ children }: { children: ReactNode }) {
  const { user, isGuest } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loadingAddress, setLoadingAddress] = useState(false);

  const refreshAddresses = useCallback(async () => {
    if (isGuest || !user?.id) {
      setAddresses([]);
      return;
    }

    setLoadingAddress(true);
    try {
      const response = await api.get<Address[]>(`/api/address/by-client/${user.id}`);
      setAddresses(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.log('Erro ao buscar endereços:', error);
    } finally {
      setLoadingAddress(false);
    }
  }, [user, isGuest]);

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