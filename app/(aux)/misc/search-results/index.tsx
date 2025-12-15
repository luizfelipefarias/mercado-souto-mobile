import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { Text } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../../../../src/constants/theme';
import api from '../../../../src/services/api';

type Product = {
  id: number;
  title: string;
  price: number;
  stock: number;
  imageURL?: string[];
  category?: {
      name: string;
  };
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
      
      const products: Product[] = Array.isArray(response.data) ? response.data : [];


      const filtered = products.filter(product => {
        const titleMatch = product.title.toLowerCase().includes(searchTerm);
        

        const categoryMatch = product.category?.name?.toLowerCase().includes(searchTerm);
        

        let extraMatch = false;
        if (searchTerm === 'tecnologia') {
             const cat = product.category?.name?.toLowerCase() || '';
             extraMatch = cat.includes('celular') || cat.includes('comput') || cat.includes('eletr');
        }

        return titleMatch || categoryMatch || extraMatch;
      });

      setResults(filtered);
    } catch (err) {
      console.log('Erro na busca:', err);
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
      router.push(`/(aux)/shop/product/${id}` as any);
    },
    [router]
  );

  const renderItem = useCallback(
    ({ item }: { item: Product }) => {
      const imageUri = (item.imageURL && item.imageURL.length > 0) 
        ? item.imageURL[0] 
        : 'https://via.placeholder.com/150';

      return (
        <TouchableOpacity
          style={styles.card}
          onPress={() => handleOpenProduct(item.id)}
          activeOpacity={0.9}
        >
          <Image
            source={{ uri: imageUri }}
            style={styles.image}
            resizeMode="contain"
          />

          <View style={styles.info}>
            <Text style={styles.title} numberOfLines={2}>
              {item.title}
            </Text>

            <Text style={styles.price}>
              R$ {item.price.toFixed(2).replace('.', ',')}
            </Text>

            {item.stock > 0 && (
              <Text style={styles.shipping}>Chegará grátis amanhã</Text>
            )}

            <Text style={styles.installments}>em 6x sem juros</Text>
          </View>
        </TouchableOpacity>
      );
    },
    [handleOpenProduct]
  );

  const ListEmpty = useMemo(
    () => (
      <View style={styles.emptyContainer}>
        <MaterialCommunityIcons
          name="magnify-remove-outline"
          size={60}
          color="#ddd"
        />
        <Text style={styles.emptyTextTitle}>Não encontramos resultados</Text>
        <Text style={styles.emptyTextSub}>
          Verifique se a palavra está escrita corretamente ou tente termos mais genéricos.
        </Text>
      </View>
    ),
    []
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.secondary} />

      <View style={styles.header}>

        <TouchableOpacity onPress={() => router.back()} style={styles.inputMock}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#666" style={{marginRight: 10}}/>
          <Text style={styles.searchText} numberOfLines={1}>
            {q}
          </Text>
          <MaterialCommunityIcons name="close" size={20} color="#999" style={{ marginLeft: 'auto' }}/>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/(aux)/shop/cart' as any)} style={{padding: 5}}>
          <MaterialCommunityIcons name="cart-outline" size={26} color="#333" />
        </TouchableOpacity>
      </View>

      <View style={styles.filters}>
        <Text style={styles.resultCount}>{results.length} resultados</Text>

        <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={styles.filterText}>Filtrar</Text>
          <MaterialCommunityIcons name="filter-variant" size={16} color="#3483fa" />
        </TouchableOpacity>
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
          <Text style={styles.emptyTextTitle}>Erro ao buscar produtos</Text>
          <TouchableOpacity onPress={fetchProducts} style={{marginTop: 10}}>
             <Text style={{color: theme.colors.primary, fontWeight: 'bold'}}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={results}
          renderItem={renderItem}
          keyExtractor={item => String(item.id)}
          contentContainerStyle={{ paddingBottom: 20 }} 
          showsVerticalScrollIndicator={false}
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
    height: 40,
    borderRadius: 20,
    paddingHorizontal: 15,
    marginRight: 10,
    elevation: 2,
  },

  searchText: {
    color: '#333',
    fontSize: 16,
    flex: 1,
  },

  filters: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#eee',
    elevation: 1,
  },

  resultCount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },

  filterText: {
    color: '#3483fa',
    marginRight: 5,
    fontSize: 14,
    fontWeight: '500',
  },

  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginBottom: 2, 
    padding: 15,
    elevation: 1,
  },

  image: {
    width: 110,
    height: 110,
    marginRight: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 4,
  },

  info: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingTop: 5,
  },

  title: {
    fontSize: 14,
    color: '#333',
    marginBottom: 6,
    lineHeight: 18,
  },

  price: {
    fontSize: 20,
    fontWeight: '500',
    color: '#333',
  },

  shipping: {
    fontSize: 12,
    color: '#00a650',
    fontWeight: 'bold',
    marginTop: 4,
  },

  installments: {
    fontSize: 12,
    color: '#333',
    marginTop: 2,
  },

  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
    paddingHorizontal: 40,
  },

  emptyTextTitle: {
    color: '#333',
    fontWeight: 'bold',
    fontSize: 18,
    marginTop: 15,
    marginBottom: 5,
    textAlign: 'center',
  },
  
  emptyTextSub: {
    color: '#999',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});