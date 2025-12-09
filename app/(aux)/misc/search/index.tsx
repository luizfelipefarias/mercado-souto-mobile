import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform
} from 'react-native';
import { Text } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import api from '../../../../src/services/api'; 
import { theme } from '../../../../src/constants/theme';

type Product = {
  id: number;
  title: string;
  price: number;
  imageURL?: string[];
  stock: number;
};

export default function SearchResults() {
  const router = useRouter();
  const { q } = useLocalSearchParams(); // Recebe o termo da busca
  const searchTerm = typeof q === 'string' ? q : '';

  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<Product[]>([]);

  useEffect(() => {
    const fetchAndFilter = async () => {
      setLoading(true);
      try {
        const response = await api.get('/api/product');
        const allProducts = Array.isArray(response.data) ? response.data : [];

        const filtered = allProducts.filter((item: any) =>
          item.title.toLowerCase().includes(searchTerm.toLowerCase())
        );

        setResults(
          filtered.map((item: any) => ({
            id: item.id,
            title: item.title,
            price: Number(item.price),
            imageURL: item.imageURL,
            stock: item.stock,
          }))
        );
      } catch (error) {
        console.log('Erro na busca:', error);
      } finally {
        setLoading(false);
      }
    };

    if (searchTerm) {
      fetchAndFilter();
    }
  }, [searchTerm]);

  const handleProductPress = (id: number) => {
    router.push(`/product/${id}` as any);
  };

  const renderItem = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => handleProductPress(item.id)}
      activeOpacity={0.9}
    >
      <Image
        source={{
          uri: item.imageURL?.[0] || 'https://via.placeholder.com/150',
        }}
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
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.secondary} />
      

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={{padding: 5}}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.fakeInput} onPress={() => router.back()}>
            <Text style={styles.inputText} numberOfLines={1}>{searchTerm}</Text>
            <MaterialCommunityIcons name="close" size={20} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity style={{padding: 5}} onPress={() => router.push('/cart' as any)}>
             <MaterialCommunityIcons name="cart-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <View style={styles.filterBar}>
         <Text style={styles.resultCount}>{results.length} resultados</Text>
         <TouchableOpacity style={styles.filterBtn}>
             <Text style={styles.filterText}>Filtrar</Text>
             <MaterialCommunityIcons name="filter-variant" size={16} color="#3483fa" />
         </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <MaterialCommunityIcons name="magnify-remove-outline" size={60} color="#ddd" />
              <Text style={styles.emptyTitle}>Não encontramos resultados</Text>
              <Text style={styles.emptySub}>
                Verifique se a palavra está escrita corretamente.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', paddingTop: Platform.OS === 'android' ? 30 : 0 },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.secondary,
    padding: 10,
    justifyContent: 'space-between'
  },
  
  fakeInput: {
      flex: 1,
      backgroundColor: '#fff',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginHorizontal: 10,
      borderRadius: 20,
      height: 35,
      paddingHorizontal: 15
  },
  
  inputText: { color: '#333', fontSize: 14, flex: 1 },

  filterBar: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 15,
      backgroundColor: '#fff',
      borderBottomWidth: 1,
      borderColor: '#eee'
  },
  
  resultCount: { fontSize: 14, fontWeight: 'bold', color: '#333' },
  filterBtn: { flexDirection: 'row', alignItems: 'center' },
  filterText: { color: '#3483fa', marginRight: 5, fontWeight: '500' },

  list: { padding: 10 },

  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 6,
    marginBottom: 2, 
    padding: 15,
    borderBottomWidth: 1,
    borderColor: '#eee'
  },
  
  image: { width: 100, height: 100, borderRadius: 4, backgroundColor: '#f9f9f9' },
  
  info: { flex: 1, marginLeft: 15, justifyContent: 'center' },
  
  title: { fontSize: 14, color: '#333', marginBottom: 5 },
  price: { fontSize: 20, fontWeight: '500', color: '#333' },
  shipping: { fontSize: 12, color: '#00a650', fontWeight: 'bold', marginTop: 5 },

  empty: { alignItems: 'center', marginTop: 50, padding: 20 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 10, color: '#333' },
  emptySub: { fontSize: 14, color: '#999', textAlign: 'center', marginTop: 5 }
});