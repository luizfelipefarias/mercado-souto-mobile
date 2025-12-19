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
  Modal,
  TouchableWithoutFeedback
} from 'react-native';
import { Text, Button, Divider, RadioButton, Checkbox } from 'react-native-paper'; 
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
  specification?: string;
  category?: {
      name: string;
  };
};

type SortOption = 'relevance' | 'price_asc' | 'price_desc';

export default function SearchResults() {
  const router = useRouter();
  const { q } = useLocalSearchParams<{ q?: string }>();

  // --- ESTADOS DE DADOS ---
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [results, setResults] = useState<Product[]>([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // --- ESTADOS DE FILTRO ---
  const [modalVisible, setModalVisible] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  const [filterStock, setFilterStock] = useState(false);

  const normalize = (str: string) => {
      return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  };

  const searchTerm = useMemo(() => normalize(q || ''), [q]);

  // --- BUSCA NA API ---
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(false);

      const response = await api.get('/api/product');
      const products: Product[] = Array.isArray(response.data) ? response.data : [];

      // Filtra pela busca (q)
      const filtered = products.filter(product => {
        const title = normalize(product.title || '');
        const category = normalize(product.category?.name || '');
        const spec = normalize(product.specification || '');

        const matchTitle = title.includes(searchTerm);
        const matchCategory = category.includes(searchTerm);
        const matchSpec = spec.includes(searchTerm);

        let extraMatch = false;
        if (searchTerm === 'tecnologia' || searchTerm === 'eletronicos') {
             extraMatch = 
                category.includes('celular') || 
                category.includes('comput') || 
                category.includes('info') ||
                title.includes('smart');
        }

        return matchTitle || matchCategory || matchSpec || extraMatch;
      });

      setAllProducts(filtered); // Salva o "Backup"
      setResults(filtered);     // Salva o que exibe
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

  // --- LÓGICA DE APLICAR FILTROS ---
  const applyFilters = () => {
      let data = [...allProducts];

      // 1. Filtro de Estoque
      if (filterStock) {
          data = data.filter(p => p.stock > 0);
      }

      // 2. Ordenação
      if (sortBy === 'price_asc') {
          data.sort((a, b) => a.price - b.price);
      } else if (sortBy === 'price_desc') {
          data.sort((a, b) => b.price - a.price);
      }
      // 'relevance' mantem a ordem original da busca

      setResults(data);
      setModalVisible(false);
  };

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

            {item.stock > 0 ? (
              <Text style={styles.shipping}>Chegará grátis amanhã</Text>
            ) : (
              <Text style={[styles.shipping, {color: '#999'}]}>Esgotado</Text>
            )}

            <Text style={styles.installments}>em 6x sem juros</Text>
          </View>
        </TouchableOpacity>
      );
    },
    [handleOpenProduct]
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
        
        {/* BOTÃO FILTRAR AGORA FUNCIONAL */}
        <TouchableOpacity 
            style={{ flexDirection: 'row', alignItems: 'center' }}
            onPress={() => setModalVisible(true)}
        >
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
          <Text>Erro ao carregar</Text>
        </View>
      ) : (
        <FlatList
          data={results}
          renderItem={renderItem}
          keyExtractor={item => String(item.id)}
          contentContainerStyle={{ paddingBottom: 20 }} 
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
             <View style={styles.emptyContainer}>
                <MaterialCommunityIcons name="magnify-remove-outline" size={60} color="#ddd" />
                <Text style={styles.emptyTextTitle}>Não encontramos resultados</Text>
             </View>
          }
        />
      )}


      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
            <View style={styles.modalOverlay} />
        </TouchableWithoutFeedback>

        <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Filtrar e Ordenar</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <MaterialCommunityIcons name="close" size={24} color="#333" />
                </TouchableOpacity>
            </View>
            <Divider />

            <View style={{padding: 20}}>
                <Text style={styles.filterSectionTitle}>Ordenar por</Text>
                
                <TouchableOpacity style={styles.filterOption} onPress={() => setSortBy('relevance')}>
                    <MaterialCommunityIcons 
                        name={sortBy === 'relevance' ? "radiobox-marked" : "radiobox-blank"} 
                        size={24} 
                        color={theme.colors.primary} 
                    />
                    <Text style={styles.filterOptionText}>Mais relevantes</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.filterOption} onPress={() => setSortBy('price_asc')}>
                    <MaterialCommunityIcons 
                        name={sortBy === 'price_asc' ? "radiobox-marked" : "radiobox-blank"} 
                        size={24} 
                        color={theme.colors.primary} 
                    />
                    <Text style={styles.filterOptionText}>Menor preço</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.filterOption} onPress={() => setSortBy('price_desc')}>
                    <MaterialCommunityIcons 
                        name={sortBy === 'price_desc' ? "radiobox-marked" : "radiobox-blank"} 
                        size={24} 
                        color={theme.colors.primary} 
                    />
                    <Text style={styles.filterOptionText}>Maior preço</Text>
                </TouchableOpacity>

                <Text style={[styles.filterSectionTitle, {marginTop: 20}]}>Filtros</Text>
                
                <TouchableOpacity style={styles.filterOption} onPress={() => setFilterStock(!filterStock)}>
                    <MaterialCommunityIcons 
                        name={filterStock ? "checkbox-marked" : "checkbox-blank-outline"} 
                        size={24} 
                        color={theme.colors.primary} 
                    />
                    <Text style={styles.filterOptionText}>Apenas com estoque</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.modalFooter}>
                <Button 
                    mode="contained" 
                    onPress={applyFilters} 
                    style={styles.applyButton}
                    labelStyle={{fontSize: 16, fontWeight: 'bold'}}
                >
                    Aplicar Filtros
                </Button>
            </View>
        </View>
      </Modal>

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

  // --- ESTILOS DO MODAL ---
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
    maxHeight: '60%',
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  filterSectionTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#333',
      marginBottom: 10
  },
  filterOption: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 10,
  },
  filterOptionText: {
      fontSize: 16,
      marginLeft: 10,
      color: '#333'
  },
  modalFooter: {
      paddingHorizontal: 20,
      marginTop: 10
  },
  applyButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: 5,
      paddingVertical: 5
  }
});