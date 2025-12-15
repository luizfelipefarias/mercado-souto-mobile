import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  Platform
} from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { theme } from '@/constants/theme'; 
import { useAuth } from '@/context/AuthContext';
import { useOrder, Order } from '@/context/OrderContext'; 

export default function MyPurchasesScreen() {
  const router = useRouter();
  const { user, isGuest } = useAuth();
  
  const { orders, loadingOrder, fetchMyOrders } = useOrder();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!isGuest && user) {
        fetchMyOrders();
    }
  }, [user, isGuest]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchMyOrders();
    setRefreshing(false);
  }, [fetchMyOrders]);

  if (!user || isGuest) {
      return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={theme.colors.secondary} />
            <SafeAreaView style={styles.header} edges={['top']}>
                <View style={styles.headerContent}>
                    <TouchableOpacity onPress={() => router.back()} style={{ padding: 5 }}>
                        <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Minhas Compras</Text>
                    <View style={{ width: 34 }} />
                </View>
            </SafeAreaView>

            <View style={styles.guestContainer}>
                <MaterialCommunityIcons name="lock-outline" size={80} color="#ddd" />
                <Text style={styles.guestTitle}>Faça login para ver suas compras</Text>
                <Text style={styles.guestSub}>
                    Acompanhe seus pedidos, veja o histórico e compre novamente seus produtos favoritos.
                </Text>
                
                <Button 
                    mode="contained" 
                    onPress={() => router.push('/(auth)/login' as any)}
                    style={styles.loginButton}
                    labelStyle={{ fontWeight: 'bold' }}
                >
                    Entrar na minha conta
                </Button>

                <TouchableOpacity onPress={() => router.push('/(auth)/register' as any)}>
                    <Text style={styles.registerLink}>Criar conta grátis</Text>
                </TouchableOpacity>
            </View>
        </View>
      );
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString('pt-BR', { 
        day: 'numeric', 
        month: 'long' 
      });
    } catch {
      return '';
    }
  };

  const getStatusInfo = (status: string) => {
    const map: Record<string, { label: string, color: string }> = {
      APPROVED: { label: 'Compra aprovada', color: '#00a650' }, 
      PENDING: { label: 'Pagamento pendente', color: '#ff9900' }, 
      PREPARING: { label: 'Em preparação', color: '#3483fa' }, 
      SHIPPED: { label: 'A caminho', color: '#3483fa' },
      DELIVERED: { label: 'Entregue', color: '#00a650' },
      CANCELED: { label: 'Cancelado', color: '#ff3e3e' }, 
    };
    return map[status] || { label: status, color: '#666' };
  };

  const handleOrderPress = (orderId: number) => {
    router.push(`/(aux)/account/order/${orderId}` as any);
  };

  const handleBuyAgain = (productId: number) => {
    router.push(`/(aux)/shop/product/${productId}` as any);
  };

  const renderItem = ({ item }: { item: Order }) => {
    const firstItem = item.orderItems && item.orderItems.length > 0 ? item.orderItems[0] : null;
    
    if (!firstItem) return null;

    const hasMoreItems = item.orderItems.length > 1;
    
    const imageUri = (firstItem.product.imageURL && firstItem.product.imageURL.length > 0)
      ? firstItem.product.imageURL[0]
      : null;

    const statusInfo = getStatusInfo(item.status);

    return (
      <TouchableOpacity 
        style={styles.card} 
        onPress={() => handleOrderPress(item.id)}
        activeOpacity={0.9}
      >
        <View style={styles.dateRow}>
          <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
          <MaterialCommunityIcons name="chevron-right" size={20} color="#ccc" />
        </View>

        <View style={styles.contentRow}>
          {imageUri ? (
            <Image 
              source={{ uri: imageUri }} 
              style={styles.productImage} 
              resizeMode="contain" 
            />
          ) : (
            <View style={[styles.productImage, styles.placeholderImage]}>
               <MaterialCommunityIcons name="image-off-outline" size={24} color="#ccc"/>
            </View>
          )}

          <View style={styles.infoColumn}>
            <Text style={[styles.statusText, { color: statusInfo.color }]}>
              {statusInfo.label}
            </Text>

            <Text style={styles.productTitle} numberOfLines={2}>
              {firstItem.product.title}
              {hasMoreItems && <Text style={styles.moreText}> + {item.orderItems.length - 1} itens</Text>}
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

      <SafeAreaView style={styles.header} edges={['top']}>
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

      {loadingOrder && !refreshing ? (
        <View style={styles.centerLoading}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={orders}
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
                onPress={() => router.push('/(tabs)' as any)}
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
    elevation: 2,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingBottom: 12,
    paddingTop: 10,
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
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center'
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

  guestContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 30,
      backgroundColor: '#f5f5f5'
  },
  guestTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#333',
      marginTop: 20,
      marginBottom: 10,
      textAlign: 'center'
  },
  guestSub: {
      fontSize: 14,
      color: '#666',
      textAlign: 'center',
      marginBottom: 30,
      lineHeight: 20
  },
  loginButton: {
      width: '100%',
      backgroundColor: theme.colors.primary,
      paddingVertical: 5,
      borderRadius: 6,
      marginBottom: 15
  },
  registerLink: {
      color: theme.colors.primary,
      fontWeight: 'bold',
      fontSize: 16
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