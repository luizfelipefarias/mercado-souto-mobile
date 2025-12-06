import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../../constants/theme';
import api from '../../services/api';

type Product = {
  id: number;
  title: string;
  price: number;
  imageURL: string[];
};

export default function Favorites() {
  const router = useRouter();

  const [favorites, setFavorites] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadFavorites() {
      try {
        const response = await api.get('/api/products');
        if (mounted) {
          setFavorites(response.data.slice(0, 4));
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
      router.push(`/product/${id}`);
    },
    [router],
  );


  const renderItem = useCallback(
    ({ item }: { item: Product }) => (
      <TouchableOpacity
        style={styles.card}
        onPress={() => handleOpenProduct(item.id)}
        activeOpacity={0.8}
      >
        <Image
          source={{ uri: item.imageURL[0] }}
          style={styles.image}
          resizeMode="contain"
        />

        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={2}>
            {item.title}
          </Text>

          <Text style={styles.price}>
            R$ {item.price.toFixed(2)}
          </Text>

          <Text style={styles.shipping}>Frete grátis</Text>
        </View>

        <TouchableOpacity style={styles.deleteBtn}>
          <Text style={{ color: theme.colors.primary, fontSize: 12 }}>
            Excluir
          </Text>
        </TouchableOpacity>
      </TouchableOpacity>
    ),
    [handleOpenProduct],
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Favoritos</Text>

        <View style={{ width: 24 }} />
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
          contentContainerStyle={{ padding: 10 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={{ textAlign: 'center', marginTop: 50 }}>
              Você não tem favoritos.
            </Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: theme.colors.secondary,
    alignItems: 'center',
  },

  headerTitle: { fontSize: 18, fontWeight: '500' },

  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginBottom: 10,
    borderRadius: 6,
    padding: 10,
    elevation: 1,
    alignItems: 'center',
  },

  image: { width: 80, height: 80 },

  info: {
    flex: 1,
    marginLeft: 10,
    justifyContent: 'center',
  },

  title: { fontSize: 14, color: '#333' },

  price: { fontSize: 18, fontWeight: 'bold', marginTop: 4 },

  shipping: { fontSize: 12, color: '#00a650' },

  deleteBtn: {
    justifyContent: 'center',
    paddingLeft: 10,
  },
});
