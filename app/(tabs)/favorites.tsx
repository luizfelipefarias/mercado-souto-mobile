import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Platform,
  Alert
} from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../../src/constants/theme';
import api from '../../src/services/api';
import { useCart } from '../../src/context/CartContext'; 
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';


const STORAGE_KEY = '@MercadoSouto:Favorites';

type Product = {
  id: number;
  title: string;
  price: number;
  imageURL: string[];
};

export default function Favorites() {
  const router = useRouter();
  const { cartItems } = useCart(); 

  const [favorites, setFavorites] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]); 


  const loadFavoriteIds = useCallback(async () => {
    try {
      const storedIds = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedIds) {
        setFavoriteIds(JSON.parse(storedIds));
        return JSON.parse(storedIds);
      }
    } catch (error) {
      console.log('Erro ao carregar IDs favoritos:', error);
    }
    return [];
  }, []);


  useEffect(() => {
    let mounted = true;

    async function loadFavoritesData() {
      const ids = await loadFavoriteIds();

      if (ids.length === 0) {
          if (mounted) setLoading(false);
          return;
      }
      
      try {

        const response = await api.get('/api/product');
        const allProducts = Array.isArray(response.data) ? response.data : [];

        const favoriteProducts = allProducts
          .filter((p: any) => ids.includes(p.id))
          .map((p: any) => ({
            id: p.id,
            title: p.title,
            price: Number(p.price),
            imageURL: p.imageURL || [],
          }));

        if (mounted) {
          setFavorites(favoriteProducts);
        }
      } catch (error) {
        console.log('Erro ao carregar dados dos favoritos:', error);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadFavoritesData();

    return () => {
      mounted = false;
    };
  }, [loadFavoriteIds]);



  const saveFavoriteIds = useCallback(async (newIds: number[]) => {
    setFavoriteIds(newIds);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newIds));
    } catch (error) {
      console.log('Erro ao salvar IDs favoritos:', error);
    }
  }, []);

  
  const handleOpenProduct = useCallback(
    (id: number) => {
      router.push(`/(aux)/shop/product/${id}` as any);
    },
    [router],
  );


  const handleRemoveFavorite = useCallback((id: number) => {
    const message = "Deseja remover este item dos favoritos?";
    
    const performRemoval = () => {
        setFavorites(prev => prev.filter(item => item.id !== id));
        const newIds = favoriteIds.filter(favId => favId !== id);
        saveFavoriteIds(newIds);
        Toast.show({ type: 'success', text1: 'Removido dos favoritos.' });
    };
    

    if (Platform.OS === 'web') {
        if (window.confirm(message)) {
            performRemoval();
        }
    } else {
        Alert.alert("Remover", message, [
            { text: "Cancelar", style: "cancel" },
            { 
                text: "Sim", 
                style: "destructive",
                onPress: performRemoval
            }
        ]);
    }
  }, [favoriteIds, saveFavoriteIds]);

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

              <Text style={styles.shipping}>Frete grátis</Text>
            </View>

            <TouchableOpacity 
                style={styles.deleteBtn} 
                onPress={() => handleRemoveFavorite(item.id)}
            >
              <Text style={styles.deleteText}>Excluir</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        );
    },
    [handleOpenProduct, handleRemoveFavorite],
  );
  

  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.secondary} />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Favoritos</Text>

        <TouchableOpacity onPress={() => router.push('/(aux)/shop/cart' as any)} style={{ padding: 5 }}>
            <MaterialCommunityIcons name="cart-outline" size={24} color="#333" />
            {cartItemCount > 0 && (
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>{cartItemCount}</Text>
                </View>
            )}
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color={theme.colors.primary}
          style={{ marginTop: 50 }}
        />
      ) : (
        <FlatList
          data={favorites}
          renderItem={renderItem}
          keyExtractor={item => String(item.id)}
          contentContainerStyle={{ padding: 10, paddingBottom: 80 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
                <MaterialCommunityIcons name="heart-broken" size={60} color="#ddd" />
                <Text style={styles.emptyText}>Você não tem favoritos ainda.</Text>
                <TouchableOpacity onPress={() => router.push('/(tabs)' as any)}>
                    <Text style={styles.linkText}>Descobrir produtos</Text>
                </TouchableOpacity>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
      flex: 1, 
      backgroundColor: '#f5f5f5',
      paddingTop: Platform.OS === 'android' ? 30 : 0 
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: theme.colors.secondary,
    alignItems: 'center',
    elevation: 2,
  },

  headerTitle: { fontSize: 20, fontWeight: '500', color: '#333' },

  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginBottom: 2, 
    padding: 15,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },

  image: { 
      width: 80, 
      height: 80,
      backgroundColor: '#f9f9f9',
      borderRadius: 4
  },

  info: {
    flex: 1,
    marginLeft: 15,
    justifyContent: 'center',
  },

  title: { fontSize: 14, color: '#333', marginBottom: 5 },

  price: { fontSize: 18, fontWeight: '500', color: '#333' },

  shipping: { fontSize: 12, color: '#00a650', fontWeight: 'bold', marginTop: 2 },

  deleteBtn: {
    padding: 10,
    justifyContent: 'center',
  },
  
  deleteText: {
      color: '#3483fa',
      fontSize: 13,
      fontWeight: '500'
  },

  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#d63031',
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },

  emptyContainer: {
      alignItems: 'center',
      marginTop: 60
  },
  emptyText: {
      marginTop: 15,
      fontSize: 16,
      color: '#666'
  },
  linkText: {
      marginTop: 10,
      color: '#3483fa',
      fontWeight: 'bold'
  }
});