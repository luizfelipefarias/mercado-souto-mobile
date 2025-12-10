import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type HistoryItem = {
  id: number;
  title: string;
  price: number;
  image: string;
  viewedAt: string;
};

interface HistoryContextData {
  history: HistoryItem[];
  addToHistory: (item: Omit<HistoryItem, 'viewedAt'>) => Promise<void>;
  clearHistory: () => Promise<void>;
}

const HistoryContext = createContext<HistoryContextData>({} as HistoryContextData);

export function HistoryProvider({ children }: { children: ReactNode }) {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    async function loadHistory() {
      const stored = await AsyncStorage.getItem('@ML_History');
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    }
    loadHistory();
  }, []);

  const addToHistory = async (newItem: Omit<HistoryItem, 'viewedAt'>) => {
    try {
      setHistory(currentHistory => {
        
        const filtered = currentHistory.filter(item => item.id !== newItem.id);
        const itemWithDate: HistoryItem = { ...newItem, viewedAt: new Date().toISOString() };
        const newHistory = [itemWithDate, ...filtered];
        const limitedHistory = newHistory.slice(0, 20);
        AsyncStorage.setItem('@ML_History', JSON.stringify(limitedHistory));

        return limitedHistory;
      });
    } catch (error) {
      console.log('Erro ao salvar histórico:', error);
    }
  };

  const clearHistory = async () => {
    setHistory([]);
    await AsyncStorage.removeItem('@ML_History');
  };

  return (
    <HistoryContext.Provider value={{ history, addToHistory, clearHistory }}>
      {children}
    </HistoryContext.Provider>
  );
}

export const useHistory = () => useContext(HistoryContext);