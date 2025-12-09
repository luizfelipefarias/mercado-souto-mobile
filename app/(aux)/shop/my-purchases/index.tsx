import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../../../../src/constants/theme'; 
import { useAuth } from '../../../../src/context/AuthContext';
import api from '../../../../src/services/api';

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
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      
      const userId = (user as any)?.id;
      if (!userId) return;

      const { data } = await api.get(`/api/purchase/by-client/${userId}`);
      
     
      const sortedData = Array.isArray(data) 
        ? data.sort((a: Order, b: Order) => new Date(b.date).getTime() - new Date(a.date).getTime()) 
        : [];

      setPurchases(sortedData);
    } catch (error) {
      console.log('Erro ao buscar compras:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchOrders();
  }, [fetchOrders]);

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' });
    } catch {
      return dateString;
    }
  };

  const translateStatus = (status: string) => {
    const map: Record<string, string> = {
      DELIVERED: 'Entregue',
      PENDING: 'Pendente',
      SHIPPED: 'A caminho',
      CANCELED: 'Cancelado',
      APPROVED: 'Aprovado',
      PREPARING: 'Em preparação'
    };
    return map[status] || status;
  };

  const getStatusColor = (status: string) => {
    if (status === 'CANCELED') return '#ff3e3e'; 
    if (status === 'PENDING') return '#ff9900'; 
    return '#00a650'; // Verde
  };

  const handleOrderPress = (orderId: number) => {
   
    router.push(`/(aux)/account/order/${orderId}` as any);
  };

  const handleBuyAgain = (productId: number) => {
    router.push(`/(aux)/shop/product/${productId}` as any);
  };

  const renderItem = ({ item }: { item: Order }) => {
    const firstItem = item.items && item.items.length > 0 ? item.items[0] : null;
    if (!firstItem) return null;

    const hasMoreItems = item.items.length > 1;
    const imageUri = firstItem.product?.imageURL?.[0] || 'https://via.placeholder.com/150';

    return (
      <TouchableOpacity 
        style={styles.card} 
        onPress={() => handleOrderPress(item.id)}
        activeOpacity={0.9}
      >
        <View style={styles.dateRow}>
          <Text style={styles.dateText}>{formatDate(item.date)}</Text>
          <MaterialCommunityIcons name="chevron-right" size={20} color="#ccc" />
        </View>

        <View style={styles.contentRow}>
          <Image 
            source={{ uri: imageUri }} 
            style={styles.productImage} 
            resizeMode="contain" 
          />

          <View style={styles.infoColumn}>
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {translateStatus(item.status)}
            </Text>

            <Text style={styles.productTitle} numberOfLines={2}>
              {firstItem.product.title}
              {hasMoreItems && <Text style={styles.moreText}> + {item.items.length - 1} itens</Text>}
            </Text>

            <TouchableOpacity 
              style={styles.buyAgainButton}
              onPress={() => handleBuyAgain(firstItem.product.id)}
            >
              <Text style={styles.buyAgainText}>Comprar novamente</Text>
            </TouchableOpacity>
          </View>
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

          <Text style={styles.headerTitle}>Minhas Compras</Text>

          <TouchableOpacity style={{ padding: 5 }} onPress={() => router.push('/(aux)/misc/search/index' as any)}>
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
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.iconCircle}>
                <MaterialCommunityIcons name="shopping-outline" size={50} color="#999" />
              </View>
              <Text style={styles.emptyTitle}>Você ainda não fez compras</Text>
              <Text style={styles.emptySub}>Confira nossas ofertas e comece a comprar agora!</Text>
              <TouchableOpacity 
                style={styles.goShopButton}
                onPress={() => router.push('/(tabs)')}
              >
                <Text style={styles.goShopText}>Ir para o início</Text>
              </TouchableOpacity>
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
    backgroundColor: '#f5f5f5',
  },
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
    height: 50
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
  },
  
  centerLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  listContent: {
    padding: 15,
    paddingBottom: 40,
  },


  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 8,
  },
  dateText: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#333',
    textTransform: 'capitalize',
  },
  contentRow: {
    flexDirection: 'row',
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 6,
    backgroundColor: '#f9f9f9',
    marginRight: 15,
  },
  infoColumn: {
    flex: 1,
    justifyContent: 'space-between',
  },
  statusText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  productTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
    lineHeight: 18,
  },
  moreText: {
    fontSize: 12,
    color: '#999',
  },
  buyAgainButton: {
    backgroundColor: '#e3edfb',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  buyAgainText: {
    color: theme.colors.primary,
    fontWeight: 'bold',
    fontSize: 13,
  },


  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
    paddingHorizontal: 40,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptySub: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  goShopButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    width: '100%',
    borderRadius: 6,
    alignItems: 'center',
  },
  goShopText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});