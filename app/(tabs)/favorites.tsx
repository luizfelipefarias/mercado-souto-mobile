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

  useEffect(() => {
    let mounted = true;

    async function loadFavorites() {
      try {
       
        const response = await api.get('/api/product');
        if (mounted) {
  
          setFavorites(Array.isArray(response.data) ? response.data.slice(0, 5) : []);
        }
      } catch (error) {
        console.log('Erro ao carregar favoritos:', error);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadFavorites();

    return () => {
      mounted = false;
    };
  }, []);

  const handleOpenProduct = useCallback(
    (id: number) => {
      router.push(`/(aux)/shop/product/${id}` as any);
    },
    [router],
  );

  const handleRemoveFavorite = (id: number) => {
    Alert.alert("Remover", "Deseja remover este item dos favoritos?", [
        { text: "Cancelar", style: "cancel" },
        { 
            text: "Sim", 
            onPress: () => setFavorites(prev => prev.filter(item => item.id !== id))
        }
    ]);
  };

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
    [handleOpenProduct],
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.secondary} />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Favoritos</Text>

        <TouchableOpacity onPress={() => router.push('/(aux)/shop/cart' as any)} style={{ padding: 5 }}>
            <MaterialCommunityIcons name="cart-outline" size={24} color="#333" />
            {cartItems.length > 0 && (
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>{cartItems.length}</Text>
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
                <TouchableOpacity onPress={() => router.push('/(tabs)')}>
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