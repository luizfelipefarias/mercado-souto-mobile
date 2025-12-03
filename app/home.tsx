import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, FlatList, StatusBar, Platform, SafeAreaView, Image, Alert } from 'react-native';
import { Badge, ActivityIndicator, Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router'; 
import { theme } from '../constants/theme';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useAndroidNavigationBar } from '../hooks/useAndroidNavigationBar';

type Product = {
  id: number;
  name: string;
  price: number;
  description?: string;
  imageUri?: string; 
};

const SHORTCUTS = [
  { id: 1, label: 'Ofertas', icon: 'tag-outline' },
  { id: 2, label: 'Mercado Pago', icon: 'qrcode-scan' },
  { id: 3, label: 'Mercado Play', icon: 'play-box-outline' },
  { id: 4, label: 'Veículos', icon: 'car-outline' },
  { id: 5, label: 'Supermercado', icon: 'basket-outline' },
  { id: 6, label: 'Moda', icon: 'tshirt-crew-outline' },
];

export default function Home() {
  const router = useRouter(); 
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
useAndroidNavigationBar(true);
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await api.get('/api/product');
      setProducts(response.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleShortcutPress = (label: string) => {
    Alert.alert(label, `Você tocou em ${label}. Navegação simulada.`);
  };

  const handleProductPress = (item: Product) => {
    router.push(`/product/${item.id}` as any);
  };

  const handleCartPress = () => {
    router.push('/cart' as any);
  };

  const renderProductItem = ({ item }: { item: Product }) => (
    <TouchableOpacity 
      style={styles.productCard} 
      onPress={() => handleProductPress(item)} 
      activeOpacity={0.9}
    >
      <View style={styles.imageContainer}>
        {item.imageUri ? (
          <Image source={{ uri: item.imageUri }} style={styles.productImage} resizeMode="contain" />
        ) : (
          <MaterialCommunityIcons name="package-variant" size={50} color="#ddd" />
        )}
      </View>
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
        
        <Text style={styles.oldPrice}>R$ {(item.price * 1.2).toFixed(2).replace('.', ',')}</Text>
        
        <View style={styles.priceRow}>
          <Text style={styles.price}>R$ {item.price?.toFixed(2).replace('.', ',')}</Text>
          <Text style={styles.discount}>20% OFF</Text>
        </View>
        
        <Text style={styles.installments}>6x R$ {(item.price / 6).toFixed(2).replace('.', ',')} sem juros</Text>
        <Text style={styles.shipping}>Frete grátis <Text style={{fontWeight: 'bold', fontStyle: 'italic', color: '#00a650'}}>FULL</Text></Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.secondary} />
      
      <SafeAreaView style={styles.headerContainer}>
        <View style={styles.headerContent}>
          
          <View style={styles.topRow}>
            <TouchableOpacity style={styles.searchBar} onPress={() => Alert.alert("Busca", "Abrir teclado...")}>
              <MaterialCommunityIcons name="magnify" size={22} color="#999" style={{marginLeft: 10}} />
              <Text style={styles.searchText}>Buscar no Mercado Livre</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.cartButton} onPress={handleCartPress}>
              <MaterialCommunityIcons name="cart-outline" size={28} color="#333" />
              <Badge style={styles.cartBadge} size={16}>2</Badge>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.addressRow} onPress={() => router.push('/address' as any)}>
            <MaterialCommunityIcons name="map-marker-outline" size={18} color="#333" />
            <Text style={styles.addressText} numberOfLines={1}>
              {user ? `Enviar para ${user.email}` : 'Informe seu CEP para ver os preços'}
            </Text>
            <MaterialCommunityIcons name="chevron-right" size={16} color="#777" />
          </TouchableOpacity>

        </View>
      </SafeAreaView>

      <ScrollView style={styles.scrollContainer} contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        
        <View style={styles.bannerContainer}>
          <TouchableOpacity style={styles.banner} onPress={() => Alert.alert("Cyber Monday", "Ver promoções")}>
            <View style={styles.bannerTextContainer}>
              <Text style={styles.bannerTitle}>CYBER MONDAY</Text>
              <Text style={styles.bannerSubtitle}>ATÉ 80% OFF</Text>
              <View style={styles.bannerButton}>
                <Text style={styles.bannerButtonText}>Ver ofertas</Text>
              </View>
            </View>
            <MaterialCommunityIcons name="shopping" size={80} color="#333" style={{opacity: 0.2}} />
          </TouchableOpacity>
        </View>

        <View style={{ height: 100 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.shortcutsList}>
            {SHORTCUTS.map((item) => (
              <TouchableOpacity key={item.id} style={styles.shortcutItem} onPress={() => handleShortcutPress(item.label)}>
                <View style={styles.shortcutCircle}>
                  <MaterialCommunityIcons name={item.icon as any} size={28} color="#666" />
                </View>
                <Text style={styles.shortcutLabel} numberOfLines={2}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Ofertas do dia</Text>
          <TouchableOpacity onPress={() => Alert.alert("Ver todas", "Lista completa")}>
            <Text style={styles.seeAll}>Ver todas</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator color={theme.colors.primary} style={{marginTop: 20}} />
        ) : (
          <FlatList
            data={products}
            renderItem={renderProductItem}
            keyExtractor={item => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.productsList}
            ListEmptyComponent={<Text style={styles.emptyText}>Nenhum produto encontrado.</Text>}
          />
        )}

        <View style={[styles.sectionHeader, {marginTop: 20}]}>
          <Text style={styles.sectionTitle}>Visto recentemente</Text>
          <TouchableOpacity onPress={() => Alert.alert("Histórico", "Ver histórico completo")}>
            <Text style={styles.seeAll}>Ver histórico</Text>
          </TouchableOpacity>
        </View>
        
        <FlatList
            data={[...products].reverse()} 
            renderItem={renderProductItem}
            keyExtractor={item => 'hist-' + item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.productsList}
        />

      </ScrollView>

      <View style={styles.bottomTab}>
        <TabButton 
            icon="home-outline" 
            label="Início" 
            isActive 
            onPress={() => {}} 
        />
        
        <TabButton 
            icon="heart-outline" 
            label="Favoritos" 
            onPress={() => router.push('/favorites' as any)} 
        />
        
        <TabButton 
            icon="shopping-outline" 
            label="Minhas compras" 
            onPress={() => router.push('/my-purchases' as any)} 
        />
        
        <TabButton 
            icon="account-outline" 
            label="Meu Perfil" 
            onPress={() => router.push('/profile' as any)} 
        />
        
        <TabButton 
            icon="menu" 
            label="Mais" 
            onPress={() => router.push('/menu' as any)} 
        />
      </View>
    </View>
  );
}

const TabButton = ({ icon, label, isActive, onPress }: any) => (
  <TouchableOpacity style={styles.tabButton} onPress={onPress}>
    <MaterialCommunityIcons name={icon} size={24} color={isActive ? theme.colors.primary : '#666'} />
    <Text style={[styles.tabLabel, isActive && { color: theme.colors.primary }]}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ebebeb' },
  
  headerContainer: {
    backgroundColor: theme.colors.secondary, 
    paddingTop: Platform.OS === 'android' ? 40 : 0, 
  },
  headerContent: {
    paddingHorizontal: 10,
    paddingBottom: 12,
    paddingTop: 5, 
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  searchBar: { 
    flex: 1, 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#fff', 
    height: 42, 
    borderRadius: 30, 
    marginRight: 10,
    elevation: 3,
    paddingHorizontal: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchText: { color: '#bbb', marginLeft: 8, fontSize: 15 },
  cartButton: { position: 'relative', padding: 5 },
  cartBadge: { position: 'absolute', top: 0, right: 0, backgroundColor: '#d63031', color: '#fff', fontSize: 10 },
  
  addressRow: { flexDirection: 'row', alignItems: 'center', paddingLeft: 5 },
  addressText: { fontSize: 12, color: '#333', marginLeft: 5, marginRight: 5, flex: 1 },

  scrollContainer: { flex: 1 },

  bannerContainer: { padding: 15 },
  banner: { 
    backgroundColor: theme.colors.primary, 
    height: 160, 
    borderRadius: 6, 
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    elevation: 3,
    overflow: 'hidden'
  },
  bannerTextContainer: { flex: 1 },
  bannerTitle: { color: '#ffe600', fontSize: 24, fontWeight: '900', fontStyle: 'italic' },
  bannerSubtitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  bannerButton: { backgroundColor: '#fff', alignSelf: 'flex-start', paddingHorizontal: 15, paddingVertical: 6, borderRadius: 4 },
  bannerButtonText: { color: '#333', fontWeight: 'bold', fontSize: 12 },

  shortcutsList: { paddingHorizontal: 10, paddingBottom: 10 },
  shortcutItem: { alignItems: 'center', marginRight: 15, width: 70 },
  shortcutCircle: { 
    width: 60, height: 60, backgroundColor: '#fff', borderRadius: 30, 
    justifyContent: 'center', alignItems: 'center', marginBottom: 5, elevation: 2 
  },
  shortcutLabel: { fontSize: 11, color: '#888', textAlign: 'center' },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 15, marginBottom: 10 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#333' },
  seeAll: { color: theme.colors.primary, fontSize: 14 },
  
  productsList: { paddingHorizontal: 10 },
  emptyText: { marginLeft: 15, color: '#999', paddingVertical: 20 },

  productCard: { 
    backgroundColor: '#fff', width: 150, height: 280, marginHorizontal: 5, borderRadius: 6, elevation: 2, overflow: 'hidden' 
  },
  imageContainer: { height: 140, justifyContent: 'center', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#f0f0f0', padding: 5 },
  productImage: { width: '100%', height: '100%' },
  productInfo: { padding: 10, flex: 1, justifyContent: 'space-between' },
  productName: { fontSize: 13, color: '#333', height: 32, marginBottom: 2 },
  oldPrice: { fontSize: 11, color: '#999', textDecorationLine: 'line-through' },
  priceRow: { flexDirection: 'row', alignItems: 'center' },
  price: { fontSize: 18, fontWeight: '500', color: '#333', marginRight: 8 },
  discount: { fontSize: 12, color: '#00a650', fontWeight: 'bold' },
  installments: { fontSize: 10, color: '#333' },
  shipping: { fontSize: 10, color: '#00a650', marginTop: 2 },

  bottomTab: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    height: 60,
    alignItems: 'center',
    justifyContent: 'space-around',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 10
  },
  tabButton: { alignItems: 'center', justifyContent: 'center', flex: 1 },
  tabLabel: { fontSize: 10, color: '#666', marginTop: 3 }
});