import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import api from '../services/api';
import Toast from 'react-native-toast-message';

// Definição do Tipo Categoria
export type Category = {
  id: number;
  name: string;
  image?: string; // Caso no futuro tenha imagem
};

interface CategoryContextData {
  categories: Category[];
  loadingCategories: boolean;
  loadCategories: () => Promise<void>;
  getCategoryNameById: (id: number) => string;
}

const CategoryContext = createContext<CategoryContextData>({} as CategoryContextData);

export function CategoryProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoading] = useState(false);

  const loadCategories = useCallback(async () => {
    setLoading(true);
    try {
      // Ajuste a rota conforme seu backend (ex: /api/category)
      const response = await api.get('/api/category');
      
      if (Array.isArray(response.data)) {
        setCategories(response.data);
      } else {
        setCategories([]);
      }
    } catch (error) {
      console.log('Erro ao carregar categorias:', error);
      // Não vamos travar o app com Toast aqui para não atrapalhar o fluxo inicial, 
      // mas logamos o erro.
    } finally {
      setLoading(false);
    }
  }, []);

  // Helper para pegar nome pelo ID (útil em várias telas)
  const getCategoryNameById = useCallback((id: number) => {
    const cat = categories.find(c => c.id === id);
    return cat ? cat.name : 'Outros';
  }, [categories]);

  // Carrega automaticamente ao montar o Provider (início do app)
  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  return (
    <CategoryContext.Provider value={{ categories, loadingCategories, loadCategories, getCategoryNameById }}>
      {children}
    </CategoryContext.Provider>
  );
}

export const useCategory = () => useContext(CategoryContext);