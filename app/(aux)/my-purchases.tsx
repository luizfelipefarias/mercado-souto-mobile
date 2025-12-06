import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as NavigationBar from 'expo-navigation-bar';
import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Image,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
  ActivityIndicator
} from 'react-native';
import { Text } from 'react-native-paper';
import { theme } from '../../constants/theme';
import { useAndroidNavigationBar } from '../../hooks/useAndroidNavigationBar';
import api from '../../services/api';

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
  
  const [purchases, setPurchases] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useAndroidNavigationBar(true);

  useEffect(() => {
    if (Platform.OS === 'android') {
      NavigationBar.setVisibilityAsync('hidden');
      NavigationBar.setBehaviorAsync('overlay-swipe');
    }
    return () => {
      if (Platform.OS === 'android') {
        NavigationBar.setVisibilityAsync('visible');
      }
    };
  }, []);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/orders'); 
      setPurchases(response.data);
    } catch (error) {
      console.error("Erro ao buscar compras:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' }) + '.';
    } catch { 
      return dateString;
    }
  };

  const translateStatus = (status: string) => {
    const map: Record<string, string> = {
      'DELIVERED': 'Entregue',
      'PENDING': 'Pendente',
      'SHIPPED': 'A caminho',
      'CANCELED': 'Cancelado'
    };
    return map[status] || status;
  };

  const getStatusColor = (status: string) => {
    if (status === 'CANCELED') return '#ff3e3e';
    if (status === 'PENDING') return '#ff9900';
    return '#00a650';
  };

  const handleBuyAgain = (productId: number) => {
    router.push(`/product/${productId}` as any);
  };

  const renderItem = ({ item }: { item: Order }) => {
    const firstItem = item.items[0];
    const hasMoreItems = item.items.length > 1;

    const imageUri = firstItem?.product.imageURL?.[0] || 'https://via.placeholder.com/150';

    return (
      <TouchableOpacity style={styles.card}>
        <View style={styles.dateRow}>
          <Text style={styles.dateText}>{formatDate(item.date)}</Text>
        </View>

        <View style={styles.productRow}>
          <Image source={{ uri: imageUri }} style={styles.image} />

          <View style={styles.info}>
            <Text style={[styles.status, { color: getStatusColor(item.status) }]}>
              {translateStatus(item.status)}
            </Text>
            
            <Text style={styles.name} numberOfLines={2}>
              {firstItem?.product.title} 
              {hasMoreItems && <Text style={{fontSize: 12, color: '#999'}}> + {item.items.length - 1} itens</Text>}
            </Text>

            <TouchableOpacity 
              style={styles.buyAgainBtn}
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
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
          </TouchableOpacity>

          <Text style={styles.title}>Minhas Compras</Text>

          <MaterialCommunityIcons name="magnify" size={24} color="#333" />
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
          contentContainerStyle={{ padding: 15 }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="shopping-outline" size={60} color="#ddd" />
              <Text style={styles.emptyText}>Você ainda não fez compras.</Text>
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
    elevation: 1,
  },

  dateRow: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 10,
    marginBottom: 10,
  },

  dateText: {
    fontWeight: 'bold',
    color: '#333',
    textTransform: 'capitalize'
  },

  productRow: {
    flexDirection: 'row',
  },

  image: {
    width: 60,
    height: 60,
    borderRadius: 4,
    marginRight: 15,
    backgroundColor: '#eee',
    resizeMode: 'contain'
  },

  info: {
    flex: 1,
  },

  status: {
    fontWeight: 'bold',
    marginBottom: 2,
    fontSize: 14,
  },

  name: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },

  buyAgainBtn: {
    backgroundColor: '#e3edfb',
    padding: 8,
    borderRadius: 4,
    alignItems: 'center',
    alignSelf: 'flex-start',
  },

  buyAgainText: {
    color: theme.colors.primary,
    fontWeight: 'bold',
    fontSize: 12,
  },

  emptyContainer: {
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    marginTop: 10,
    color: '#999',
    fontSize: 16
  }
});