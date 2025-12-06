import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Platform,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { Text } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../../constants/theme';
import api from '../../services/api';

type Product = {
  id: number;
  title: string;
  price: number;
  stock: number;
  imageURL?: string[];
};

export default function SearchResults() {
  const router = useRouter();
  const { q } = useLocalSearchParams<{ q?: string }>();

  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const searchTerm = useMemo(() => String(q || '').toLowerCase(), [q]);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(false);

      const response = await api.get('/api/product');
      const products: Product[] = response.data;

      const filtered = products.filter(product =>
        product.title.toLowerCase().includes(searchTerm)
      );

      setResults(filtered);
    } catch (err) {
      console.log(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    if (searchTerm) fetchProducts();
  }, [fetchProducts, searchTerm]);

  const handleOpenProduct = useCallback(
    (id: number) => {
      router.push(`/product/${id}` as any);
    },
    [router]
  );

  const renderItem = useCallback(
    ({ item }: { item: Product }) => (
      <TouchableOpacity
        style={styles.card}
        onPress={() => handleOpenProduct(item.id)}
      >
        <Image
          source={{ uri: item.imageURL?.[0] }}
          style={styles.image}
          resizeMode="contain"
        />

        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={2}>
            {item.title}
          </Text>

          <Text style={styles.price}>R$ {item.price.toFixed(2)}</Text>

          {item.stock > 0 && (
            <Text style={styles.shipping}>Chegará grátis amanhã</Text>
          )}

          <Text style={styles.installments}>em 6x sem juros</Text>
        </View>
      </TouchableOpacity>
    ),
    [handleOpenProduct]
  );

  const ListEmpty = useMemo(
    () => (
      <View style={styles.emptyContainer}>
        <MaterialCommunityIcons
          name="magnify-remove-outline"
          size={50}
          color="#ddd"
        />
        <Text style={styles.emptyText}>
          Não encontramos produtos para &quot;{q}&quot;
        </Text>
      </View>
    ),
    [q]
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.inputMock}>
          <MaterialCommunityIcons name="magnify" size={20} color="#666" />
          <Text style={styles.searchText}>{q}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/cart' as any)}>
          <MaterialCommunityIcons name="cart-outline" size={26} color="#333" />
        </TouchableOpacity>
      </View>

      <View style={styles.filters}>
        <Text style={styles.resultCount}>{results.length} resultados</Text>

        <View style={{ flexDirection: 'row' }}>
          <Text style={styles.filterText}>Filtrar</Text>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator
          style={{ marginTop: 50 }}
          color={theme.colors.primary}
          size="large"
        />
      ) : error ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="alert-circle-outline" size={48} color="#ccc" />
          <Text style={styles.emptyText}>Erro ao buscar produtos</Text>
        </View>
      ) : (
        <FlatList
          data={results}
          renderItem={renderItem}
          keyExtractor={item => String(item.id)}
          contentContainerStyle={{ padding: 10 }}
          ListEmptyComponent={ListEmpty}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: Platform.OS === 'android' ? 30 : 0,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: theme.colors.secondary,
  },

  inputMock: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    height: 35,
    borderRadius: 20,
    paddingHorizontal: 10,
    marginRight: 10,
  },

  searchText: {
    marginLeft: 10,
    color: '#333',
  },

  filters: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#eee',
  },

  resultCount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },

  filterText: {
    color: '#3483fa',
    marginRight: 15,
  },

  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginBottom: 2,
    padding: 15,
  },

  image: {
    width: 100,
    height: 100,
    marginRight: 15,
  },

  info: {
    flex: 1,
    justifyContent: 'center',
  },

  title: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },

  price: {
    fontSize: 20,
    fontWeight: 'bold',
  },

  shipping: {
    fontSize: 12,
    color: '#00a650',
    fontWeight: 'bold',
    marginTop: 2,
  },

  installments: {
    fontSize: 12,
    color: '#333',
  },

  emptyContainer: {
    alignItems: 'center',
    marginTop: 50,
  },

  emptyText: {
    color: '#666',
    marginTop: 10,
  },
});
