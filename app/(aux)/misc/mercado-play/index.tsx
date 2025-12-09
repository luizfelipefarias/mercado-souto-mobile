import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as NavigationBar from 'expo-navigation-bar';
import React, { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  Image,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import { Text } from 'react-native-paper';
import { theme } from '../../../../src/constants/theme';
import { useAndroidNavigationBar } from '../../../../src/hooks/useAndroidNavigationBar';
import api from '../../../../src/services/api';
import { useAuth } from '../../../../src/context/AuthContext'; 

type OrderItem = {
  id: number;
  product: {
    id: number;
    title: string;
    imageURL: string[];
  };
  quantity: number;
  price: number;
};

type Order = {
  id: number;
  date: string;
  status: string;
  items: OrderItem[];
  total: number;
};

export default function MyPurchases() {
  const router = useRouter();
  const { user } = useAuth(); 

  const [purchases, setPurchases] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useAndroidNavigationBar(true);

  useEffect(() => {
    if (Platform.OS === 'android') {
      NavigationBar.setVisibilityAsync('hidden');
      NavigationBar.setBehaviorAsync('overlay-swipe');
      return () => {
        NavigationBar.setVisibilityAsync('visible');
      };
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    try {
      const userId = (user as any)?.id;
      if(!userId) return;

      setLoading(true);
 
      const { data } = await api.get(`/api/purchase/by-client/${userId}`);
      

      setPurchases(Array.isArray(data) ? data : []);
    } catch (error) {
      console.log('Erro ao buscar compras:', error);
      setPurchases([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const formatDate = useCallback((value: string) => {
    if(!value) return '';
    const date = new Date(value);
    return date.toLocaleDateString('pt-BR', {
      day: 'numeric',
      month: 'long',
    });
  }, []);

  const translateStatus = useCallback((status: string) => {
    const map: Record<string, string> = {
      DELIVERED: 'Entregue',
      PENDING: 'Pendente',
      SHIPPED: 'A caminho',
      CANCELED: 'Cancelado',
      APPROVED: 'Aprovado'
    };
    return map[status] || status;
  }, []);

  const getStatusColor = useCallback((status: string) => {
    if (status === 'CANCELED') return '#ff3e3e';
    if (status === 'PENDING') return '#ff9900';
    return '#00a650';
  }, []);

  const handleOrderPress = useCallback((orderId: number) => {

      router.push(`/(aux)/purchases/${orderId}` as any);
  }, [router]);

  const handleBuyAgain = useCallback((productId: number) => {
      router.push(`/product/${productId}` as any);
  }, [router]);

  const renderItem = useCallback(
    ({ item }: { item: Order }) => {

      const firstItem = item.items && item.items.length > 0 ? item.items[0] : null;
      
      if (!firstItem) return null;

      const hasMoreItems = item.items.length > 1;
      const imageUri = firstItem.product.imageURL?.[0] || 'https://via.placeholder.com/150';

      return (
        <TouchableOpacity 
            style={styles.card} 
            onPress={() => handleOrderPress(item.id)} 
            activeOpacity={0.9}
        >
          <View style={styles.dateRow}>
            <Text style={styles.dateText}>
              {formatDate(item.date)}
            </Text>
          </View>

          <View style={styles.productRow}>
            <Image source={{ uri: imageUri }} style={styles.image} />

            <View style={styles.info}>
              <Text style={[styles.status, { color: getStatusColor(item.status) }]}>
                {translateStatus(item.status)}
              </Text>

              <Text style={styles.name} numberOfLines={2}>
                {firstItem.product.title}
                {hasMoreItems && (
                  <Text style={styles.moreItems}>
                    {' '} + {item.items.length - 1} itens
                  </Text>
                )}
              </Text>

              <TouchableOpacity
                style={styles.buyAgainBtn}
                onPress={() => handleBuyAgain(firstItem.product.id)}
              >
                <Text style={styles.buyAgainText}>
                  Comprar novamente
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      );
    },
    [formatDate, getStatusColor, translateStatus, handleBuyAgain, handleOrderPress]
  );

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={theme.colors.secondary}
      />

      <SafeAreaView style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()} style={{padding: 5}}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
          </TouchableOpacity>

          <Text style={styles.title}>Minhas Compras</Text>

          <TouchableOpacity style={{padding: 5}}>
             <MaterialCommunityIcons name="magnify" size={24} color="#333" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {loading ? (
        <View style={styles.centerLoading}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={purchases}
          keyExtractor={item => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="shopping-outline" size={60} color="#ddd" />
              <Text style={styles.emptyText}>Você ainda não fez compras.</Text>
              
              <TouchableOpacity 
                style={styles.goShopBtn} 
                onPress={() => router.push('/(tabs)')}
              >
                  <Text style={styles.goShopText}>Ir às compras</Text>
              </TouchableOpacity>
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
  },

  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
  },

  title: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
  },

  centerLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 6,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },

  dateRow: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 10,
    marginBottom: 10,
  },

  dateText: {
    fontWeight: 'bold',
    color: '#333',
    textTransform: 'capitalize',
    fontSize: 14,
  },

  productRow: {
    flexDirection: 'row',
  },

  image: {
    width: 70,
    height: 70,
    borderRadius: 4,
    marginRight: 15,
    backgroundColor: '#fff',
    resizeMode: 'contain',
  },

  info: {
    flex: 1,
    justifyContent: 'space-between',
  },

  status: {
    fontWeight: 'bold',
    marginBottom: 4,
    fontSize: 14,
  },

  name: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
    lineHeight: 18,
  },

  moreItems: {
    fontSize: 12,
    color: '#999',
  },

  buyAgainBtn: {
    backgroundColor: '#e3edfb',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
    alignSelf: 'flex-start',
  },

  buyAgainText: {
    color: theme.colors.primary,
    fontWeight: 'bold',
    fontSize: 13,
  },

  emptyContainer: {
    alignItems: 'center',
    marginTop: 80,
  },

  emptyText: {
    marginTop: 15,
    color: '#999',
    fontSize: 16,
    marginBottom: 20,
  },
  
  goShopBtn: {
      paddingVertical: 10,
      paddingHorizontal: 20,
      backgroundColor: theme.colors.primary,
      borderRadius: 5,
  },
  
  goShopText: {
      color: '#fff',
      fontWeight: 'bold',
  },

  listContent: {
    padding: 15,
    paddingBottom: 40,
  },
});