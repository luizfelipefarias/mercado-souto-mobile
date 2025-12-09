import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  Platform,
  // 1. IMPORTANTE: Alias para evitar conflito com HTML Image no Web
  Image as RNImage 
} from 'react-native';
import { Badge, Text, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import api from '../../src/services/api';
import { useAuth } from '../../src/context/AuthContext';
import { useCart } from '../../src/context/CartContext';
import { useAndroidNavigationBar } from '../../src/hooks/useAndroidNavigationBar';

// Cor exata do Mercado Livre
const ML_YELLOW = '#FFE600'; 

// Categorias de Texto (Menu Superior)
const TOP_CATEGORIES = ['Tudo', 'Moda', 'Beleza', 'Celulares', 'Lar', 'Computação', 'TVs', 'Veículos'];

// Atalhos com rotas corrigidas para sua estrutura de pastas
const SHORTCUTS = [
  { id: 1, label: 'Ofertas', icon: 'tag-outline', route: '/(aux)/shop/all-products' },
  { id: 2, label: 'Mercado Pago', icon: 'qrcode-scan', route: '/(aux)/account/wallet' },
  { id: 3, label: 'Mercado Play', icon: 'play-box-outline', route: '/(aux)/misc/mercado-play' },
  { id: 4, label: 'Veículos', icon: 'car-outline', route: null },
  { id: 5, label: 'Supermercado', icon: 'basket-outline', route: null },
  { id: 6, label: 'Moda', icon: 'tshirt-crew-outline', route: '/(aux)/shop/all-products' },
];

type ProductUI = {
  id: number;
  title: string;
  price: number;
  imageUri: string | null;
  stock: number;
};

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();
  const { cartItems } = useCart();

  const [products, setProducts] = useState<ProductUI[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useAndroidNavigationBar(true);

  const fetchProducts = useCallback(async () => {
    try {
      const response = await api.get('/api/product');
      const mappedData = Array.isArray(response.data)
        ? response.data.map((item: any) => ({
            id: item.id,
            title: item.title,
            price: Number(item.price) || 0,
            imageUri: item.imageURL?.[0] || null,
            stock: item.stock || 0,
          }))
        : [];
      setProducts(mappedData);
    } catch (error) {
      // Falha silenciosa ou log
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchProducts();
  }, [fetchProducts]);

  const handleProductPress = useCallback(
    (id: number) => {
      router.push(`/(aux)/shop/product/${id}` as any);
    },
    [router]
  );

  const getAddressText = useCallback(() => {
    if (user && !(user as any).isGuest && user.name) {
      return `Enviar para ${user.name.split(' ')[0]}`;
    }
    return 'Enviar para Visitante - Informe seu CEP';
  }, [user]);

  const renderProductItem = useCallback(
    ({ item }: { item: ProductUI }) => (
      <TouchableOpacity
        style={styles.productCard}
        onPress={() => handleProductPress(item.id)}
        activeOpacity={0.9}
      >
        <View style={styles.imageContainer}>
          {item.imageUri ? (
            // USO CORRETO: RNImage
            <RNImage
              source={{ uri: item.imageUri }}
              style={styles.productImage}
              resizeMode="contain"
            />
          ) : (
            <MaterialCommunityIcons
              name="image-off-outline"
              size={40}
              color="#ddd"
            />
          )}
        </View>

        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>
            {item.title}
          </Text>

          <Text style={styles.oldPrice}>
            R$ {(item.price * 1.2).toFixed(2).replace('.', ',')}
          </Text>

          <View style={styles.priceRow}>
            <Text style={styles.price}>
              R$ {item.price.toFixed(2).replace('.', ',')}
            </Text>
            <Text style={styles.discount}>20% OFF</Text>
          </View>

          <Text style={styles.installments}>
            6x R$ {(item.price / 6).toFixed(2).replace('.', ',')} sem juros
          </Text>

          {item.stock > 0 && (
            <Text style={styles.shipping}>
              Frete grátis <Text style={styles.fullText}>FULL</Text>
            </Text>
          )}
        </View>
      </TouchableOpacity>
    ),
    [handleProductPress]
  );

  // Card de Login para Visitantes
  const renderLoginCard = () => {
    const isGuest = !user || (user as any).isGuest;
    if (!isGuest) return null;

    return (
      <View style={styles.loginCardContainer}>
        <Text style={styles.loginTitle}>Crie uma conta para melhorar sua experiência!</Text>
        <Button 
          mode="contained" 
          onPress={() => router.push('/(auth)/register' as any)}
          style={styles.btnPrimary}
          labelStyle={{ fontWeight: 'bold' }}
        >
          Criar conta
        </Button>
        <Button 
          mode="text" 
          onPress={() => router.push('/(auth)/login' as any)}
          style={styles.btnSecondary}
          labelStyle={{ color: '#3483fa', fontWeight: 'bold' }}
        >
          Entrar na minha conta
        </Button>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={ML_YELLOW}
      />

      <View style={styles.headerContainer}>
        <View style={styles.headerContent}>
          <View style={styles.topRow}>
            <TouchableOpacity
              style={styles.searchBar}
              onPress={() => router.push('/(aux)/misc/search' as any)}
              activeOpacity={0.9}
            >
              <MaterialCommunityIcons
                name="magnify"
                size={22}
                color="#999"
                style={{ marginLeft: 10 }}
              />
              <Text style={styles.searchText}>
                Buscar no Mercado Souto
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cartButton}
              onPress={() => router.push('/(aux)/shop/cart' as any)}
            >
              <MaterialCommunityIcons
                name="cart-outline"
                size={28}
                color="#333"
              />
              {cartItems.length > 0 && (
                <Badge size={16} style={styles.cartBadge}>
                  {cartItems.length}
                </Badge>
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.addressRow}
            onPress={() => router.push('/(aux)/account/address' as any)}
          >
            <MaterialCommunityIcons
              name="map-marker-outline"
              size={18}
              color="#333"
            />
            <Text style={styles.addressText} numberOfLines={1}>
              {getAddressText()}
            </Text>
            <MaterialCommunityIcons
              name="chevron-right"
              size={16}
              color="#777"
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        keyboardShouldPersistTaps="handled" // IMPORTANTE PARA CLIQUES
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[ML_YELLOW]}
          />
        }
      >

        <View style={styles.bannerContainer}>
          <TouchableOpacity
            style={styles.banner}
            onPress={() => router.push('/(aux)/shop/all-products' as any)}
            activeOpacity={0.9}
          >
            <View>
              <Text style={styles.bannerTitle}>OFERTAS</Text>
              <Text style={styles.bannerSubtitle}>IMPERDÍVEIS</Text>
              <View style={styles.bannerButton}>
                <Text style={styles.bannerButtonText}>
                  Ver mais
                </Text>
              </View>
            </View>
            {/* Ícone Seguro em vez de imagem local */}
            <MaterialCommunityIcons
              name="truck-delivery"
              size={80}
              color="#2d3277"
              style={{ marginRight: 10 }}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.shortcutsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {SHORTCUTS.map((item, index) => (
              <TouchableOpacity 
                key={index} 
                style={styles.shortcutItem}
                onPress={() => item.route && router.push(item.route as any)}
              >
                <View style={styles.shortcutCircle}>
                  <MaterialCommunityIcons
                    name={item.icon as any}
                    size={28}
                    color="#666"
                  />
                </View>
                <Text
                  style={styles.shortcutLabel}
                  numberOfLines={2}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Ofertas do dia</Text>
          <TouchableOpacity
            onPress={() => router.push('/(aux)/shop/all-products' as any)}
          >
            <Text style={styles.seeAll}>Ver todas</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator
            size="large"
            color={'#3483fa'}
            style={{ marginTop: 20 }}
          />
        ) : (
          <FlatList
            data={products}
            horizontal
            renderItem={renderProductItem}
            keyExtractor={item => String(item.id)}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.productsList}
            keyboardShouldPersistTaps="handled"
          />
        )}

        {/* Card de Login */}
        {renderLoginCard()}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },

  headerContainer: {
    backgroundColor: ML_YELLOW,
    paddingTop: Platform.OS === 'android' ? 10 : 50,
    elevation: 4,
    zIndex: 10,
  },

  headerContent: {
    paddingHorizontal: 15,
    paddingBottom: 12,
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
    height: 38,
    borderRadius: 30,
    marginRight: 12,
    elevation: 2,
    paddingHorizontal: 10,
  },

  searchText: {
    marginLeft: 8,
    color: '#bbb',
    fontSize: 14,
  },

  cartButton: { padding: 5 },

  cartBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#d63031',
    fontSize: 10,
    fontWeight: 'bold',
  },

  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  addressText: {
    flex: 1,
    fontSize: 13,
    marginLeft: 6,
    marginRight: 5,
  },

  bannerContainer: { padding: 15 },

  banner: {
    backgroundColor: '#3483fa',
    height: 150,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    elevation: 4,
  },

  bannerTitle: {
    color: '#FFE600',
    fontSize: 22,
    fontWeight: '900',
    fontStyle: 'italic',
  },

  bannerSubtitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },

  bannerButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },

  bannerButtonText: {
    color: '#3483fa',
    fontWeight: 'bold',
    fontSize: 12,
  },

  shortcutsContainer: { height: 95 },

  shortcutItem: {
    alignItems: 'center',
    marginRight: 15,
    width: 72,
  },

  shortcutCircle: {
    width: 58,
    height: 58,
    backgroundColor: '#fff',
    borderRadius: 29,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },

  shortcutLabel: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    marginBottom: 10,
    alignItems: 'center',
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
  },

  seeAll: {
    color: '#3483fa',
    fontSize: 14,
  },

  productsList: { paddingHorizontal: 10 },

  productCard: {
    backgroundColor: '#fff',
    width: 160,
    height: 310,
    marginHorizontal: 6,
    borderRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },

  imageContainer: {
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
    padding: 10,
  },

  productImage: { width: '100%', height: '100%' },

  productInfo: { padding: 12, flex: 1 },

  productName: {
    fontSize: 13,
    marginBottom: 6,
    height: 32,
  },

  oldPrice: {
    fontSize: 11,
    color: '#aaa',
    textDecorationLine: 'line-through',
  },

  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  price: {
    fontSize: 20,
    fontWeight: '500',
    marginRight: 8,
  },

  discount: {
    fontSize: 12,
    color: '#00a650',
    fontWeight: 'bold',
  },

  installments: {
    fontSize: 11,
  },

  shipping: {
    fontSize: 11,
    color: '#00a650',
    marginTop: 4,
    fontWeight: '700',
  },

  fullText: {
    fontWeight: 'bold',
    fontStyle: 'italic',
  },

  loginCardContainer: {
      backgroundColor: '#fff', margin: 10, padding: 15, borderRadius: 8, elevation: 2
  },
  loginTitle: { fontSize: 14, fontWeight: 'bold', textAlign: 'center', marginBottom: 15 },
  btnPrimary: { backgroundColor: '#3483fa', marginBottom: 10, borderRadius: 6 },
  btnSecondary: { borderRadius: 6 },
});