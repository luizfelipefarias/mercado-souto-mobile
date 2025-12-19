import React, { useCallback, useEffect, useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  Platform,
  Alert,
  BackHandler
} from 'react-native';
import { Text, Button, Divider } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { theme } from '../../../../src/constants/theme'; 
import { useAuth } from '../../../../src/context/AuthContext';
import api from '../../../../src/services/api';

type Product = {
    id: number;
    title: string;
    imageURL: string[];
};

type OrderItem = {
    id: number;
    product: Product;
    quantity: number;
};

type Order = {
    id: number;
    createdAt: string;
    status: string;
    totalPrice: number;
    orderItems: OrderItem[];
};

export default function MyPurchasesScreen() {
  const router = useRouter();
  const { user, isGuest, token } = useAuth();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrder, setLoadingOrder] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const handleBack = useCallback(() => {
      if (router.canGoBack()) {
          router.back();
      } else {
          router.replace('/(tabs)' as any); 
      }
      return true;
  }, [router]);

  useEffect(() => {
      const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBack);
      return () => backHandler.remove();
  }, [handleBack]);

  const goToProduct = (productId: number) => {
      router.push(`/(aux)/shop/product/${productId}` as any);
  };

  const goToOrderDetails = (orderId: number) => {
      router.push(`/(aux)/account/order/${orderId}` as any);
  };

  const fetchMyOrders = useCallback(async () => {
    if (!user || !user.id || !token) {
        setLoadingOrder(false);
        return;
    }
    
    try {
        if (!refreshing) setLoadingOrder(true);
        
        const endpoint = `/api/client/${user.id}/orders`;
        console.log(`[DEBUG] Buscando pedidos em: ${endpoint}`);
        
        const response = await api.get(endpoint, {
            headers: { Authorization: `Bearer ${token}` }
        });

        let ordersData: Order[] = [];
        if (Array.isArray(response.data)) {
            ordersData = response.data;
        } else if (response.data && Array.isArray((response.data as any).content)) {
            ordersData = (response.data as any).content;
        }
        
        const sortedOrders = ordersData.sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        setOrders(sortedOrders);

    } catch (error: any) {
        console.error("ERRO AO BUSCAR COMPRAS:", error);
    } finally {
        setLoadingOrder(false);
        setRefreshing(false);
    }
  }, [user?.id, refreshing, token]);

  useEffect(() => {
    if (!isGuest && user && token) {
        fetchMyOrders();
    } else {
        setLoadingOrder(false);
    }
  }, [user, isGuest, token, fetchMyOrders]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchMyOrders();
  }, [fetchMyOrders]);

  const activeOrder = useMemo(() => {
      if (!orders) return null;
      return orders.find(o => 
          ['APPROVED', 'PENDING', 'PREPARING', 'SHIPPED'].includes(o.status)
      );
  }, [orders]);

  const handleTrackOrder = () => {
      if (activeOrder) {
          goToOrderDetails(activeOrder.id);
      } else {
          Alert.alert('Tudo entregue', 'Você não possui pedidos em andamento.');
      }
  };

  if (!user || isGuest) {
      return (
        <View style={styles.container}>
            <SafeAreaView style={styles.header} edges={['top']}>
                <View style={styles.headerContent}>
                    <TouchableOpacity onPress={handleBack} style={{ padding: 5 }}>
                        <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Minhas Compras</Text>
                    <View style={{ width: 34 }} />
                </View>
            </SafeAreaView>
            <View style={styles.guestContainer}>
                <MaterialCommunityIcons name="lock-outline" size={80} color="#ddd" />
                <Text style={styles.guestTitle}>Faça login para ver suas compras</Text>
                <Button mode="contained" onPress={() => router.push('/(auth)/login' as any)} style={styles.loginButton}>
                    Entrar na minha conta
                </Button>
            </View>
        </View>
      );
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString('pt-BR', { 
        day: 'numeric', month: 'long', year: 'numeric'
      });
    } catch { return ''; }
  };

  const getStatusInfo = (status: string) => {
    const map: Record<string, { label: string, color: string, icon: string }> = {
      APPROVED: { label: 'Aprovado', color: '#00a650', icon: 'check-circle' }, 
      PENDING: { label: 'Pendente', color: '#ff9900', icon: 'clock-outline' }, 
      PREPARING: { label: 'Em preparação', color: '#3483fa', icon: 'package-variant' }, 
      SHIPPED: { label: 'Enviado', color: '#3483fa', icon: 'truck-fast' },
      DELIVERED: { label: 'Entregue', color: '#00a650', icon: 'check-all' },
      CANCELED: { label: 'Cancelado', color: '#ff3e3e', icon: 'close-circle' }, 
    };
    return map[status] || { label: status, color: '#666', icon: 'help-circle' };
  };

  const ListHeader = () => (
    <View>
        <TouchableOpacity 
            style={[styles.trackLinkContainer, !activeOrder && { opacity: 0.7, backgroundColor: '#f9f9f9' }]} 
            onPress={handleTrackOrder}
            activeOpacity={0.7}
        >
            <View style={[styles.trackIconBox, !activeOrder && { backgroundColor: '#eee' }]}>
                <MaterialCommunityIcons 
                    name={activeOrder ? "truck-fast-outline" : "check-all"} 
                    size={28} 
                    color={activeOrder ? theme.colors.primary : "#999"} 
                />
            </View>
            <View style={{ flex: 1, marginLeft: 15 }}>
                <Text style={[styles.trackTitle, !activeOrder && {color: '#666'}]}>
                    {activeOrder ? 'Acompanhar envio' : 'Nenhum envio ativo'}
                </Text>
                <Text style={styles.trackSubtitle}>
                    {activeOrder 
                        ? `Pedido #${activeOrder.id} - ${getStatusInfo(activeOrder.status).label}` 
                        : 'Seus pedidos recentes foram entregues'}
                </Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#ccc" />
        </TouchableOpacity>
        <Text style={styles.sectionHeader}>Histórico de Pedidos</Text>
    </View>
  );

  const renderItem = ({ item }: { item: Order }) => {
    const firstItem = item.orderItems && item.orderItems.length > 0 ? item.orderItems[0] : null;
    if (!firstItem) return null;
    
    const hasMoreItems = item.orderItems.length > 1;
    const imageUri = firstItem.product.imageURL?.[0] || null;
    const statusInfo = getStatusInfo(item.status);

    return (
      <View style={styles.card}>
        <TouchableOpacity 
            style={styles.cardHeader} 
            onPress={() => goToOrderDetails(item.id)}
        >
            <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Text style={{fontSize: 12, color: '#666', marginRight: 5}}>Detalhes</Text>
                <MaterialCommunityIcons name="chevron-right" size={16} color="#ccc" />
            </View>
        </TouchableOpacity>

        <Divider />

        <View style={styles.cardBody}>
            <TouchableOpacity onPress={() => goToProduct(firstItem.product.id)}>
                {imageUri ? (
                    <Image source={{ uri: imageUri }} style={styles.productImage} resizeMode="contain" />
                ) : (
                    <View style={[styles.productImage, styles.placeholderImage]}>
                        <MaterialCommunityIcons name="image-off-outline" size={24} color="#ccc"/>
                    </View>
                )}
            </TouchableOpacity>

            <View style={styles.infoColumn}>
                <View style={styles.statusRow}>
                    <MaterialCommunityIcons name={statusInfo.icon as any} size={16} color={statusInfo.color} />
                    <Text style={[styles.statusText, { color: statusInfo.color }]}>
                        {statusInfo.label}
                    </Text>
                </View>
                <Text style={styles.productTitle} numberOfLines={2}>
                    {firstItem.product.title}
                    {hasMoreItems && <Text style={styles.moreText}> + {item.orderItems.length - 1} itens</Text>}
                </Text>

                <Text style={styles.priceText}>
                    Total: R$ {item.totalPrice.toFixed(2).replace('.', ',')}
                </Text>
            </View>
        </View>

        <View style={styles.cardFooter}>
            <TouchableOpacity 
                style={styles.buyAgainButton}
                onPress={() => goToProduct(firstItem.product.id)}
            >
                <Text style={styles.buyAgainText}>Ver produto / Comprar novamente</Text>
            </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.secondary} />
      <SafeAreaView style={styles.header} edges={['top']}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={handleBack} style={{ padding: 5 }}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>Minhas Compras</Text>
          
          {/* View Vazia para manter o título centralizado */}
          <View style={{ width: 34 }} />
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
          ListHeaderComponent={ListHeader}
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
              <TouchableOpacity style={styles.goShopButton} onPress={() => router.push('/(tabs)' as any)}>
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
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { backgroundColor: theme.colors.secondary, elevation: 2 },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 15, paddingBottom: 12, paddingTop: 10 },
  headerTitle: { fontSize: 18, fontWeight: '500', color: '#333' },
  centerLoading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { padding: 15, paddingBottom: 40 },
  trackLinkContainer: {
      flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 15, borderRadius: 8, marginBottom: 20, elevation: 2,
  },
  trackIconBox: {
      width: 45, height: 45, borderRadius: 22.5, backgroundColor: '#e3edfb', justifyContent: 'center', alignItems: 'center',
  },
  trackTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  trackSubtitle: { fontSize: 13, color: '#666', marginTop: 2 },
  sectionHeader: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#333' },
  
  card: { backgroundColor: '#fff', borderRadius: 8, marginBottom: 15, elevation: 2, overflow: 'hidden' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 12, backgroundColor: '#fafafa' },
  dateText: { fontWeight: 'bold', fontSize: 14, color: '#333', textTransform: 'capitalize' },
  
  cardBody: { flexDirection: 'row', padding: 15 },
  productImage: { width: 80, height: 80, borderRadius: 6, backgroundColor: '#f9f9f9', marginRight: 15 },
  placeholderImage: { justifyContent: 'center', alignItems: 'center' },
  
  infoColumn: { flex: 1, justifyContent: 'space-between' },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  statusText: { fontSize: 14, fontWeight: 'bold', marginLeft: 5 },
  
  productTitle: { fontSize: 14, color: '#444', marginBottom: 5, lineHeight: 18 },
  moreText: { fontSize: 12, color: '#999' },
  priceText: { fontSize: 14, fontWeight: 'bold', color: '#333', marginTop: 5 },
  
  cardFooter: { padding: 10, paddingTop: 0 },
  buyAgainButton: { backgroundColor: '#e3edfb', paddingVertical: 10, borderRadius: 6, alignItems: 'center' },
  buyAgainText: { color: theme.colors.primary, fontWeight: 'bold', fontSize: 14 },

  guestContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  guestTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginTop: 20, marginBottom: 10, textAlign: 'center' },
  loginButton: { width: '100%', backgroundColor: theme.colors.primary, marginTop: 10 },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 40 },
  iconCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#eee', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  goShopButton: { backgroundColor: theme.colors.primary, paddingVertical: 12, width: '100%', borderRadius: 6, alignItems: 'center', marginTop: 15 },
  goShopText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});