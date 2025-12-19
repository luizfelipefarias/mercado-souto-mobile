import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';
import { Address } from '../interfaces';
import AsyncStorage from '@react-native-async-storage/async-storage'; 

interface UserContextData {
    addresses: Address[];
    loadingAddress: boolean;
    refreshAddresses: () => Promise<void>;
}

const UserContext = createContext<UserContextData>({} as UserContextData);

const GUEST_ADDRESS_KEY = '@guest_addresses'; 

export function UserProvider({ children }: { children: ReactNode }) {
    const { user, isGuest } = useAuth();
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [loadingAddress, setLoadingAddress] = useState(false);

    const refreshAddresses = useCallback(async () => {
        setLoadingAddress(true);

        if (isGuest) {
            try {
                const storedAddresses = await AsyncStorage.getItem(GUEST_ADDRESS_KEY);
                const localAddresses: Address[] = storedAddresses ? JSON.parse(storedAddresses) : [];
                setAddresses(localAddresses);
            } catch (error) {
                console.log('Erro ao carregar endereços localmente:', error);
                setAddresses([]);
            } finally {
                setLoadingAddress(false);
            }
            return;
        }

        if (!user?.id) {
             setAddresses([]);
             setLoadingAddress(false);
             return;
        }

        try {
            const response = await api.get<Address[]>(`/api/address/by-client/${user.id}`); 
            setAddresses(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.log('Erro ao buscar endereços API:', error);
            setAddresses([]);
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