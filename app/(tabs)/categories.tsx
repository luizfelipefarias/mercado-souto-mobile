import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Platform,
  Image as RNImage
} from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import api from '../../src/services/api';
import { theme } from '../../src/constants/theme';
import { useProduct } from '../../src/context/ProductContext'; // Usando o contexto de produtos

const { width } = Dimensions.get('window');

// Menu Lateral de Categorias
const SIDEBAR_ITEMS = [
  'Todos',
  'Celulares', 
  'Roupas', 
  'Beleza', 
  'Móveis', 
  'Esportes', 
  'Eletro', 
  'Veículos', 
  'Ferramentas',
  'Brinquedos',
  'Outros'
];

type ProductUI = {
    id: number;
    title: string;
    price: number;
    imageUri: string | null;
    stock: number;
    categoryName: string;
};

export default function CategoriesScreen() {
  const router = useRouter();
  
  // Consumindo produtos do contexto para evitar nova chamada de API
  const { products, loading: loadingProducts, loadProducts } = useProduct(); 
  
  const [selectedSidebar, setSelectedSidebar] = useState('Todos');
  const [filteredProducts, setFilteredProducts] = useState<ProductUI[]>([]);

  // Garante que produtos estejam carregados
  useEffect(() => {
    loadProducts();
  }, []);

  // Filtragem local
  useEffect(() => {
    if (products.length === 0) return;

    // Normaliza os produtos para o formato UI
    const allProductsUI: ProductUI[] = products.map((p: any) => ({
        id: p.id,
        title: p.title,
        price: Number(p.price),
        imageUri: (p.imageURL && p.imageURL.length > 0) ? p.imageURL[0] : null,
        stock: p.stock,
        categoryName: p.category?.name || 'Outros'
    }));

    if (selectedSidebar === 'Todos') {
        setFilteredProducts(allProductsUI);
    } else {
        // Filtro aproximado (Ex: "Celulares" pega "Smartphone Samsung")
        // Ou filtro exato se o backend retornar nomes de categoria corretos
        const term = selectedSidebar.toLowerCase();
        
        // Mapeamento de termos para busca flexível
        let searchTerms = [term];
        if (term === 'eletro') searchTerms = ['eletro', 'geladeira', 'fogao', 'maquina'];
        if (term === 'celulares') searchTerms = ['celular', 'smartphone', 'iphone', 'android'];
        
        const filtered = allProductsUI.filter(p => {
            const catName = p.categoryName.toLowerCase();
            const titleName = p.title.toLowerCase();
            
            // Verifica se a categoria OU o título contém o termo
            return searchTerms.some(t => catName.includes(t) || titleName.includes(t));
        });
        
        setFilteredProducts(filtered);
    }
  }, [selectedSidebar, products]);

  const handleProductPress = (id: number) => {
    router.push(`/(aux)/shop/product/${id}` as any);
  };

  const renderProductItem = ({ item }: { item: ProductUI }) => (
    <TouchableOpacity 
        style={styles.productCard}
        onPress={() => handleProductPress(item.id)}
        activeOpacity={0.8}
    >
        <View style={styles.imageBox}>
            {item.imageUri ? (
                <RNImage source={{ uri: item.imageUri }} style={styles.productImage} resizeMode="contain" />
            ) : (
                <MaterialCommunityIcons name="image-off-outline" size={30} color="#ccc" />
            )}
        </View>
        <View style={styles.productInfo}>
            <Text style={styles.productTitle} numberOfLines={2}>{item.title}</Text>
            <Text style={styles.productPrice}>R$ {item.price.toFixed(2).replace('.', ',')}</Text>
            {item.stock > 0 && <Text style={styles.shippingText}>Frete Grátis</Text>}
        </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={theme.colors.secondary} barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 5 }}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Categorias</Text>
        <TouchableOpacity onPress={() => router.push('/(aux)/misc/search' as any)} style={{ padding: 5 }}>
             <MaterialCommunityIcons name="magnify" size={24} color="#333" />
        </TouchableOpacity>
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

        {/* CONTEÚDO PRINCIPAL (Direita - Lista de Produtos) */}
        <View style={styles.mainContent}>
            {loadingProducts ? (
                <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 50 }} />
            ) : (
                <View style={{ flex: 1 }}>
                     <Text style={styles.mainTitle}>{selectedSidebar}</Text>
                     
                     <FlatList
                        data={filteredProducts}
                        renderItem={renderProductItem}
                        keyExtractor={(item) => String(item.id)}
                        numColumns={2} // Grid de 2 produtos
                        contentContainerStyle={{ paddingBottom: 20 }}
                        showsVerticalScrollIndicator={false}
                        columnWrapperStyle={{ justifyContent: 'space-between' }}
                        ListEmptyComponent={
                            <View style={styles.emptyGrid}>
                                <MaterialCommunityIcons name="package-variant-closed" size={40} color="#ddd" />
                                <Text style={styles.emptyGridText}>Nenhum produto encontrado.</Text>
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
      elevation: 2,
      paddingTop: Platform.OS === 'android' ? 10 : 0
  },
  headerTitle: { fontSize: 18, color: '#333', fontWeight: '500' },
  
  contentRow: { flex: 1, flexDirection: 'row' },
  
  // Sidebar
  sidebar: { width: 100, backgroundColor: '#f5f5f5' },
  sidebarItem: {
      minHeight: 60,
      justifyContent: 'center', 
      paddingHorizontal: 10,
      paddingVertical: 12,
      borderBottomWidth: 1, 
      borderBottomColor: '#eee', 
      position: 'relative'
  },
  sidebarItemActive: { backgroundColor: '#fff' },
  sidebarText: { fontSize: 12, color: '#666' },
  sidebarTextActive: { fontWeight: 'bold', color: '#3483fa' },
  activeIndicator: {
      position: 'absolute', left: 0, top: 12, bottom: 12, width: 4, backgroundColor: '#3483fa',
      borderTopRightRadius: 4, borderBottomRightRadius: 4
  },

  // Conteúdo Principal
  mainContent: { flex: 1, backgroundColor: '#fff', padding: 10 },
  mainTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 15 },
  
  // Card de Produto
  productCard: {
      width: '48%',
      backgroundColor: '#fff',
      borderRadius: 6,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: '#eee',
      overflow: 'hidden',
      paddingBottom: 8
  },
  imageBox: {
      height: 100,
      width: '100%',
      backgroundColor: '#f9f9f9',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 5
  },
  productImage: { width: '100%', height: '100%' },
  productInfo: { paddingHorizontal: 6 },
  productTitle: { fontSize: 11, color: '#333', marginBottom: 4, height: 28 },
  productPrice: { fontSize: 14, fontWeight: 'bold', color: '#333' },
  shippingText: { fontSize: 10, color: '#00a650', fontWeight: 'bold', marginTop: 2 },
  
  emptyGrid: {
      flex: 1,
      alignItems: 'center',
      paddingTop: 40
  },
  emptyGridText: {
      color: '#999',
      fontSize: 14,
      marginTop: 10,
      textAlign: 'center'
  }
});