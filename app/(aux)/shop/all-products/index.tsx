import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Platform,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
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

export default function AllProducts() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get<Product[]>('/api/product');
      setProducts(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.log('Erro ao listar produtos:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const renderItem = ({ item }: { item: Product }) => {
    const hasImage = item.imageURL && item.imageURL.length > 0;

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
            <MaterialCommunityIcons name="image-off-outline" size={42} color="#ccc" />
          )}
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.title} numberOfLines={2}>
            {item.title}
          </Text>

          {/* Preço "De" (Fictício para efeito visual) */}
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

          {item.stock > 0 ? (
            <Text style={styles.shipping}>Chegará grátis amanhã</Text>
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

      <SafeAreaView style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()} style={{ padding: 5 }}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Todos os produtos</Text>

          {/* ROTA CORRETA: Apontando para /aux/shop/cart */}
          <TouchableOpacity onPress={() => router.push('/(aux)/shop/cart' as any)} style={{ padding: 5 }}>
            <MaterialCommunityIcons name="cart-outline" size={24} color="#333" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={products}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
          ListEmptyComponent={
            <View style={styles.center}>
              <MaterialCommunityIcons name="package-variant" size={60} color="#ddd" />
              <Text style={{ color: '#999', marginTop: 10 }}>
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
  container: { flex: 1, backgroundColor: '#f5f5f5' },

  header: {
    backgroundColor: theme.colors.secondary,
    paddingTop: Platform.OS === 'android' ? 30 : 0,
    elevation: 2,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingBottom: 12,
  },
  headerTitle: { fontSize: 18, fontWeight: '500', color: '#333' },

  center: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 },

  listContent: { padding: 10, paddingBottom: 50 },

  card: {
    backgroundColor: '#fff',
    width: '48.5%',
    marginBottom: 10,
    borderRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },

  imageContainer: {
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    padding: 10,
  },

  image: { width: '100%', height: '100%' },

  infoContainer: { padding: 12 },

  title: {
    fontSize: 13,
    color: '#333',
    marginBottom: 6,
    height: 34,
    lineHeight: 17,
  },

  oldPrice: {
    fontSize: 11,
    color: '#bbb',
    textDecorationLine: 'line-through',
  },

  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },

  price: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
    marginRight: 6,
  },

  discount: {
    fontSize: 12,
    color: '#00a650',
    fontWeight: 'bold',
  },

  installments: {
    fontSize: 11,
    color: '#333',
    marginBottom: 4,
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
  },
});