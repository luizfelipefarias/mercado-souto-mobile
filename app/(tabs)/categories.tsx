import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
  Platform,
  StatusBar,
} from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import api from '../../src/services/api';
import { theme } from '../../src/constants/theme';
import { Category } from '../../src/interfaces';

const { width } = Dimensions.get('window');

const SIDEBAR_ITEMS = [
  'Destaques', 'Moda', 'Esportes', 'Beleza',
  'Celulares', 'Decoração', 'Computação', 'Veículos', 'Outros'
];

export default function CategoriesScreen() {
  const router = useRouter();
  const [allApiCategories, setAllApiCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedSidebar, setSelectedSidebar] = useState('Destaques');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/api/category');
      setAllApiCategories(response.data);
    } catch (error) {
      console.log('Erro ao buscar categorias:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryPress = (categoryName: string) => {
    router.push({
      pathname: '/(aux)/misc/search-results/index',
      params: { q: categoryName }
    } as any);
  };

  const filteredCategories = useMemo(() => {
    if (selectedSidebar === 'Destaques') {
        return allApiCategories.slice(0, 9); 
    }
    
    const filterTerm = selectedSidebar.toLowerCase();
    
    return allApiCategories.filter(apiCat =>
        apiCat.name.toLowerCase().includes(filterTerm)
    );
    
  }, [selectedSidebar, allApiCategories]);


  const renderCategoryGridItem = ({ item }: { item: Category }) => (
    <TouchableOpacity 
        style={styles.gridItem}
        onPress={() => handleCategoryPress(item.name)}
    >
        <View style={styles.gridIconCircle}>
            {/* Usamos a primeira letra da categoria como um ícone simples */}
            <Text style={styles.gridIconText}>{item.name[0]}</Text>
        </View>
        <Text style={styles.gridLabel} numberOfLines={2}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={theme.colors.secondary} barStyle="dark-content" />
      
      {/* Header Amarelo */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 5 }}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Categorias</Text>
        <View style={{ width: 24 }} /> 
      </View>

      <View style={styles.contentRow}>
        {/* SIDEBAR (Esquerda) */}
        <View style={styles.sidebar}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {SIDEBAR_ITEMS.map((item, index) => {
                const isActive = item === selectedSidebar;
                return (
                    <TouchableOpacity
                        key={index}
                        style={[styles.sidebarItem, isActive && styles.sidebarItemActive]}
                        onPress={() => setSelectedSidebar(item)}
                    >
                        {isActive && <View style={styles.activeIndicator} />}
                        <Text style={[styles.sidebarText, isActive && styles.sidebarTextActive]}>
                            {item}
                        </Text>
                    </TouchableOpacity>
                );
            })}
          </ScrollView>
        </View>

        {/* CONTEÚDO PRINCIPAL (Direita) */}
        <View style={styles.mainContent}>
            {loading ? (
                <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 50 }} />
            ) : (
                <View style={{ flex: 1 }}>
                     <Text style={styles.mainTitle}>{selectedSidebar}</Text>
                     
                     <FlatList
                        data={filteredCategories}
                        renderItem={renderCategoryGridItem}
                        keyExtractor={(item) => String(item.id)}
                        numColumns={3}
                        contentContainerStyle={{ paddingBottom: 20 }}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={
                            <View style={styles.emptyGrid}>
                                <Text style={styles.emptyGridText}>Nenhuma categoria encontrada para "{selectedSidebar}"</Text>
                            </View>
                        }
                     />
                </View>
            )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  
  header: {
      height: 60, 
      backgroundColor: theme.colors.secondary,
      flexDirection: 'row', 
      alignItems: 'center',
      justifyContent: 'space-between', 
      paddingHorizontal: 10, 
      elevation: 2
  },
  headerTitle: { fontSize: 18, color: '#333', fontWeight: '500' },
  
  contentRow: { flex: 1, flexDirection: 'row' },
  
  sidebar: { width: 110, backgroundColor: '#f5f5f5' },
  sidebarItem: {
      minHeight: 70,
      justifyContent: 'center', 
      paddingHorizontal: 10,
      paddingVertical: 15,
      borderBottomWidth: 1, 
      borderBottomColor: '#eee', 
      position: 'relative'
  },
  sidebarItemActive: { backgroundColor: '#fff' },
  sidebarText: { fontSize: 12, color: '#666' },
  sidebarTextActive: { fontWeight: 'bold', color: '#3483fa' },
  activeIndicator: {
      position: 'absolute', left: 0, top: 15, bottom: 15, width: 4, backgroundColor: '#3483fa',
      borderTopRightRadius: 4, borderBottomRightRadius: 4
  },

  mainContent: { flex: 1, backgroundColor: '#fff', padding: 15 },
  mainTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 20 },
  
  gridItem: { 
      width: '33.3%', 
      alignItems: 'center', 
      marginBottom: 25,
      paddingHorizontal: 5
  },
  gridIconCircle: {
      width: 55, height: 55, borderRadius: 27.5, backgroundColor: '#f9f9f9',
      justifyContent: 'center', alignItems: 'center', marginBottom: 8,
      borderWidth: 1, borderColor: '#f0f0f0'
  },
  gridIconText: {
      fontSize: 24, 
      fontWeight: 'bold',
      color: '#666'
  },
  gridLabel: { fontSize: 11, textAlign: 'center', color: '#333', lineHeight: 14 },
  
  emptyGrid: {
      flex: 1,
      alignItems: 'center',
      paddingTop: 40
  },
  emptyGridText: {
      color: '#999',
      fontSize: 14
  }
});