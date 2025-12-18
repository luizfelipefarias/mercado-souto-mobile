import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  Dimensions
} from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { theme } from '../../../../src/constants/theme';
import api from '../../../../src/services/api';

type Product = {
  id: number;
  title: string;
  specification: string;
  description: string;
  price: number;
  stock: number;
  imageURL: string[];
};

const { width } = Dimensions.get('window');
const COLUMN_COUNT = 2;
const CARD_SPACING = 10;
const CARD_WIDTH = (width - (CARD_SPACING * (COLUMN_COUNT + 1))) / COLUMN_COUNT;

export default function AllProducts() {
  const router = useRouter();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadProducts = useCallback(async () => {
    try {
      if (!refreshing) setLoading(true);
      
      const response = await api.get<Product[]>('/api/product');
      setProducts(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.log('Erro ao listar produtos:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [refreshing]);

  useEffect(() => {
    loadProducts();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadProducts();
  };

  const formatCurrency = (value: number) => {
    return value.toFixed(2).replace('.', ',');
  };

  const renderItem = ({ item }: { item: Product }) => {
    const hasImage = item.imageURL && item.imageURL.length > 0;
    const oldPrice = item.price * 1.15;
    const installmentValue = item.price / 10;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push(`/(aux)/shop/product/${item.id}` as any)}
        activeOpacity={0.9}
      >
        <View style={styles.imageContainer}>
          {hasImage ? (
            <Image
              source={{ uri: item.imageURL[0] }}
              style={styles.image}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.placeholderImage}>
                <MaterialCommunityIcons name="image-off-outline" size={30} color="#e0e0e0" />
            </View>
          )}
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.title} numberOfLines={2}>
            {item.title}
          </Text>

          {/* Preço Antigo */}
          <Text style={styles.oldPrice}>
            R$ {formatCurrency(oldPrice)}
          </Text>

          {/* Preço Atual e Desconto */}
          <View style={styles.priceRow}>
            <Text style={styles.price}>
              R$ <Text style={styles.priceValue}>{formatCurrency(item.price)}</Text>
            </Text>
            <Text style={styles.discount}>15% OFF</Text>
          </View>

          {/* Parcelamento */}
          <Text style={styles.installments}>
            10x R$ {formatCurrency(installmentValue)} sem juros
          </Text>

          {/* Frete / Estoque */}
          {item.stock > 0 ? (
            <Text style={styles.shipping}>
              Chegará grátis <Text style={{fontWeight: '900', fontStyle:'italic'}}>⚡FULL</Text>
            </Text>
          ) : (
            <Text style={styles.outOfStock}>Esgotado</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.secondary} />

      {/* HEADER AMARELO */}
      <SafeAreaView style={styles.header} edges={['top']}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
            <MaterialCommunityIcons name="arrow-left" size={26} color="#333" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Todos os produtos</Text>

          <TouchableOpacity onPress={() => router.push('/(aux)/shop/cart' as any)} style={styles.iconButton}>
            <MaterialCommunityIcons name="cart-outline" size={26} color="#333" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* CONTEÚDO */}
      {loading && !refreshing ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={{ marginTop: 10, color: '#666' }}>Carregando catálogo...</Text>
        </View>
      ) : (
        <FlatList
          data={products}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          numColumns={COLUMN_COUNT}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
          refreshControl={
            <RefreshControl 
                refreshing={refreshing} 
                onRefresh={onRefresh} 
                colors={[theme.colors.primary]} 
            />
          }
          ListEmptyComponent={
            <View style={styles.center}>
              <MaterialCommunityIcons name="package-variant" size={60} color="#ddd" />
              <Text style={styles.emptyText}>
                Nenhum produto encontrado.
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f5f5f5' 
  },

  header: {
    backgroundColor: theme.colors.secondary,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    zIndex: 10,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  headerTitle: { 
    fontSize: 18, 
    fontWeight: '600', 
    color: '#333' 
  },
  iconButton: {
    padding: 8,
  },

  center: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginTop: 50 
  },
  listContent: { 
    padding: CARD_SPACING, 
    paddingBottom: 40 
  },
  emptyText: {
    color: '#999', 
    marginTop: 10, 
    fontSize: 16 
  },

  card: {
    backgroundColor: '#fff',
    width: CARD_WIDTH,
    marginBottom: CARD_SPACING,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    overflow: 'hidden',
  },

  imageContainer: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f7f7f7',
  },
  image: { 
    width: '100%', 
    height: '100%' 
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 4
  },

  infoContainer: { 
    padding: 12,
    justifyContent: 'space-between',
    flex: 1
  },

  title: {
    fontSize: 13,
    color: '#333',
    marginBottom: 6,
    height: 36,
    lineHeight: 18,
  },

  oldPrice: {
    fontSize: 11,
    color: '#999',
    textDecorationLine: 'line-through',
    marginBottom: 2,
  },

  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    flexWrap: 'wrap'
  },

  price: {
    fontSize: 14,
    color: '#333',
    marginRight: 6,
  },
  priceValue: {
    fontSize: 18,
    fontWeight: '600',
  },

  discount: {
    fontSize: 11,
    color: '#00a650',
    fontWeight: 'bold',
  },

  installments: {
    fontSize: 11,
    color: '#00a650',
    marginBottom: 6,
  },

  shipping: {
    fontSize: 11,
    color: '#00a650',
    fontWeight: 'bold',
  },

  outOfStock: {
    fontSize: 11,
    color: '#d9534f',
    fontWeight: 'bold',
    marginTop: 5
  },
});