import React, { useEffect, useState, useMemo } from 'react';
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
  Image as RNImage,
  SafeAreaView
} from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../../src/constants/theme';
import { useProduct } from '../../src/context/ProductContext';
import { useCart } from '../../src/context/CartContext';

const { width } = Dimensions.get('window');

const ML_YELLOW = '#FFE600'; 
const PRIMARY_BLUE = '#3483fa';
const SIDEBAR_BG = '#f0f0f0';

const SIDEBAR_ITEMS = [
  'Todos',
  'Celulares', 
  'Informática', 
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
  const { products, loading: loadingProducts, loadProducts } = useProduct(); 
  const { cartItems } = useCart();
  
  const [selectedSidebar, setSelectedSidebar] = useState('Todos');
  const [filteredProducts, setFilteredProducts] = useState<ProductUI[]>([]);

  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    if (products.length === 0) return;

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
        const term = selectedSidebar.toLowerCase();
        let searchTerms = [term];
        
        if (term === 'eletro') searchTerms = ['eletro', 'geladeira', 'fogao', 'maquina', 'cozinha'];
        if (term === 'celulares') searchTerms = ['celular', 'smartphone', 'iphone', 'android', 'samsung'];
        if (term === 'informatica') searchTerms = ['notebook', 'pc', 'computador', 'monitor', 'teclado'];
        
        const filtered = allProductsUI.filter(p => {
            const catName = p.categoryName.toLowerCase();
            const titleName = p.title.toLowerCase();
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
        activeOpacity={0.9}
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
            
            <Text style={styles.productPrice}>
                R$ {item.price.toFixed(2).replace('.', ',')}
            </Text>
            
            <Text style={styles.installments}>em 10x sem juros</Text>
            
            {item.stock > 0 && (
                <Text style={styles.shippingText}>
                    Frete Grátis <Text style={{ fontStyle: 'italic', fontWeight: '900' }}>FULL</Text>
                </Text>
            )}
        </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={ML_YELLOW} barStyle="dark-content" />
      
      {/* Header Amarelo */}
      <SafeAreaView style={styles.headerSafeArea}>
          <View style={styles.header}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Categorias</Text>
            </View>

            <TouchableOpacity onPress={() => router.push('/(aux)/shop/cart' as any)} style={styles.headerBtn}>
                 <MaterialCommunityIcons name="cart-outline" size={24} color="#333" />
                 {/* Badge do Carrinho */}
                 {cartItemCount > 0 && (
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{cartItemCount}</Text>
                    </View>
                 )}
            </TouchableOpacity>
          </View>
      </SafeAreaView>

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
                        {isActive && <View style={styles.activeLine} />}
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
            {loadingProducts ? (
                <ActivityIndicator size="large" color={PRIMARY_BLUE} style={{ marginTop: 50 }} />
            ) : (
                <View style={{ flex: 1 }}>
                     <View style={styles.mainHeader}>
                        <Text style={styles.mainTitle}>{selectedSidebar}</Text>
                        <Text style={styles.resultsCount}>{filteredProducts.length} resultados</Text>
                     </View>
                     
                     <FlatList
                        data={filteredProducts}
                        renderItem={renderProductItem}
                        keyExtractor={(item) => String(item.id)}
                        numColumns={2} 
                        contentContainerStyle={{ paddingBottom: 20, paddingTop: 5 }}
                        showsVerticalScrollIndicator={false}
                        columnWrapperStyle={{ justifyContent: 'space-between' }}
                        ListEmptyComponent={
                            <View style={styles.emptyGrid}>
                                <View style={styles.emptyIconCircle}>
                                    <MaterialCommunityIcons name="magnify-remove-outline" size={40} color="#999" />
                                </View>
                                <Text style={styles.emptyGridTitle}>Não encontramos produtos</Text>
                                <Text style={styles.emptyGridSub}>Tente selecionar outra categoria.</Text>
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
  
  headerSafeArea: { backgroundColor: ML_YELLOW },
  header: {
      height: 55, 
      flexDirection: 'row', 
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 15,
      paddingBottom: 5,
      elevation: 2,
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowRadius: 2,
      shadowOffset: {width:0, height: 1}
  },
  headerBtn: { padding: 5, position: 'relative' },
  headerTitle: {
      fontSize: 18,
      fontWeight: '500',
      color: '#333',
      marginLeft: 20
  },
  
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#d63031',
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: ML_YELLOW
  },
  badgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: 'bold'
  },
  
  contentRow: { flex: 1, flexDirection: 'row' },
  
  sidebar: { width: 110, backgroundColor: SIDEBAR_BG },
  sidebarItem: {
      height: 55,
      justifyContent: 'center', 
      paddingHorizontal: 12,
      position: 'relative'
  },
  sidebarItemActive: { backgroundColor: '#fff' },
  sidebarText: { fontSize: 13, color: '#666' },
  sidebarTextActive: { fontWeight: 'bold', color: PRIMARY_BLUE },
  activeLine: {
      position: 'absolute', left: 0, top: 15, bottom: 15, width: 4, backgroundColor: PRIMARY_BLUE,
      borderTopRightRadius: 4, borderBottomRightRadius: 4
  },

  mainContent: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 10 },
  mainHeader: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 10, marginTop: 15 },
  mainTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  resultsCount: { fontSize: 12, color: '#999', marginLeft: 8 },
  
  productCard: {
      width: '48%',
      backgroundColor: '#fff',
      borderRadius: 8,
      marginBottom: 12,
      elevation: 3,
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: '#f0f0f0'
  },
  imageBox: {
      height: 120,
      width: '100%',
      backgroundColor: '#fff',
      justifyContent: 'center',
      alignItems: 'center',
      borderBottomWidth: 1,
      borderBottomColor: '#f9f9f9',
      padding: 5
  },
  productImage: { width: '100%', height: '100%' },
  productInfo: { padding: 8 },
  productTitle: { fontSize: 12, color: '#666', marginBottom: 4, height: 32, lineHeight: 16 },
  productPrice: { fontSize: 16, fontWeight: '500', color: '#333' },
  installments: { fontSize: 10, color: '#00a650', marginBottom: 2 },
  shippingText: { fontSize: 10, color: '#00a650', fontWeight: 'bold', marginTop: 2 },
  
  emptyGrid: { flex: 1, alignItems: 'center', paddingTop: 60 },
  emptyIconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#f5f5f5', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  emptyGridTitle: { fontWeight: 'bold', fontSize: 16, color: '#333' },
  emptyGridSub: { color: '#999', fontSize: 14, marginTop: 5 }
});