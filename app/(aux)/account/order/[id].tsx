import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Platform, Image, ActivityIndicator, Alert, StatusBar } from 'react-native';
import { Text, Divider } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../../../../src/constants/theme';
import api from '../../../../src/services/api';
import { useAuth } from '../../../../src/context/AuthContext';


type IconName = keyof typeof MaterialCommunityIcons.glyphMap;


type StatusMapping = {
    title: string;
    icon: IconName; 
    active: boolean;
};

type OrderItemDisplay = {
  id: number;
  product: { id: number; title: string; imageURL: string[] };
  quantity: number;
  price: number;
};

type OrderDetail = {
  id: number;
  date: string;
  status: string;
  total: number;
  items: OrderItemDisplay[];
  address: { street: string, number: string, additionalInfo: string }; 
};


export default function OrderDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { user } = useAuth();

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);


  const STATUS_MAP: Record<string, StatusMapping> = {
    APPROVED: { title: 'Compra aprovada', icon: 'check-circle', active: true },
    PENDING: { title: 'Pagamento pendente', icon: 'progress-alert', active: false },
    PREPARING: { title: 'Em preparação', icon: 'package-variant-closed', active: true },
    SHIPPED: { title: 'A caminho', icon: 'truck-check', active: true },
    DELIVERED: { title: 'Entregue', icon: 'check-circle', active: true },
    CANCELED: { title: 'Cancelado', icon: 'close-circle', active: true },
  };

  const getTimelineSteps = (currentStatus: string): any[] => {
    const statusOrder = ['APPROVED', 'PREPARING', 'SHIPPED', 'DELIVERED'];
    let timeline: any[] = [];
    

    const getDateMock = (active: boolean) => active ? "Hoje" : "Pendente"; 

    for (const status of statusOrder) {
        const isActive = statusOrder.indexOf(status) <= statusOrder.indexOf(currentStatus);
        const statusInfo = STATUS_MAP[status];

        timeline.push({
            title: statusInfo?.title || status,
            date: getDateMock(isActive),
            active: isActive,
            isCurrent: status === currentStatus
        });
        
        if (status === currentStatus) break;
    }

    if (currentStatus === 'CANCELED' && timeline.length === 0) {
        timeline.push({ 
            title: STATUS_MAP['CANCELED'].title, 
            date: getDateMock(true), 
            active: true, 
            isCurrent: true 
        });
    }

    return timeline;
  };
  
  const fetchOrderDetails = async (orderId: string | string[]) => {
    setLoading(true);
    const userId = user?.id;

    if (!userId) {
        setLoading(false);
        router.back();
        return;
    }
    
    try {
        const response = await api.get<any[]>(`/api/purchase/by-client/${userId}`);
        const foundOrder = response.data.find((o: any) => String(o.id) === orderId);

        if (foundOrder) {
            const finalOrder: OrderDetail = {
                ...foundOrder,
                address: foundOrder.addresses?.[0] || { street: 'Rua Mock', number: 'S/N', additionalInfo: 'Bairro' },
                date: new Date(foundOrder.date).toLocaleDateString('pt-BR'),
            };
            setOrder(finalOrder);
        } else {
            Alert.alert("Erro", "Pedido não encontrado.");
            router.back();
        }
    } catch (error) {
        console.error("Erro ao buscar detalhes do pedido:", error);
        Alert.alert("Erro", "Não foi possível carregar os detalhes do pedido.");
        router.back();
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
        fetchOrderDetails(id);
    }
  }, [id, user]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!order) return null;

  const steps = getTimelineSteps(order.status);
  const currentStep = steps.find(s => s.isCurrent) || steps[steps.length - 1];
  const firstItem = order.items[0]?.product;


  const mainIconName = STATUS_MAP[order.status]?.icon || 'package-variant-closed';


  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.secondary} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#333"/>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Pedido #{order.id}</Text>

        <TouchableOpacity onPress={() => router.push('/(aux)/misc/help' as any)}>
          <MaterialCommunityIcons name="help-circle-outline" size={24} color="#333"/>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        

        <View style={styles.statusCard}>
          <MaterialCommunityIcons 
            name={mainIconName} 
            size={30} 
            color={order.status === 'DELIVERED' ? '#00a650' : theme.colors.primary} 
          />
          <View style={{ marginLeft: 15 }}>
            <Text style={{ fontWeight: 'bold', fontSize: 16 }}>{currentStep.title}</Text>
            <Text style={{ color: '#666' }}>{order.status === 'DELIVERED' ? `Entregue em: ${order.date}` : `Data do pedido: ${order.date}`}</Text>
          </View>
        </View>


        <View style={styles.timeline}>
          {steps.map((step, index) => (
            <View key={index} style={styles.stepRow}>
              <View style={styles.stepIndicator}>
                <View style={[styles.dot, step.active && styles.dotActive]} />
                {index < steps.length - 1 && (
                  <View style={[styles.line, step.active && styles.lineActive]} />
                )}
              </View>

              <View style={styles.stepContent}>
                <Text style={[styles.stepTitle, step.active && { color: '#333' }]}>
                  {step.title}
                </Text>
                <Text style={styles.stepDate}>
                    {step.date}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <Divider style={{ marginVertical: 20 }} />

        <View style={styles.addressInfo}>
          <MaterialCommunityIcons name="map-marker-outline" size={24} color="#666" />
          <View style={{ marginLeft: 15 }}>
            <Text style={{ color: '#666', fontSize: 12 }}>
                {order.address.street}, {order.address.number} - {order.address.additionalInfo}
            </Text>
            <Text style={{ fontWeight: 'bold' }}>
                {user?.name || 'Destinatário'}
            </Text>
          </View>
        </View>


        <TouchableOpacity
          style={styles.productCard}
          onPress={() => router.push(`/(aux)/shop/product/${firstItem?.id}` as any)}
        >
          <Image
            source={{ uri: firstItem?.imageURL?.[0] || 'https://via.placeholder.com/100' }}
            style={styles.productImage}
            resizeMode="contain"
          />

          <View style={{ flex: 1 }}>
            <Text numberOfLines={1}>{firstItem?.title || 'Produto Indisponível'}</Text>
            <Text style={{ color: '#666' }}>{order.items.length} produto(s) • R$ {order.total.toFixed(2).replace('.', ',')}</Text>
          </View>

          <MaterialCommunityIcons name="chevron-right" size={20} color="#ccc" />
        </TouchableOpacity>
        
        <Divider style={{ marginVertical: 20 }} />


         <TouchableOpacity style={styles.actionButton}>
             <Text style={styles.actionButtonText}>Precisa de ajuda com o envio?</Text>
         </TouchableOpacity>

         <TouchableOpacity style={styles.actionButton}>
             <Text style={styles.actionButtonText}>Ver Nota Fiscal</Text>
         </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', paddingTop: Platform.OS === 'android' ? 30 : 0 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    alignItems: 'center',
    backgroundColor: theme.colors.secondary
  },

  headerTitle: { fontSize: 18, fontWeight: '500' },

  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff', 
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1
  },

  timeline: { marginLeft: 10, paddingLeft: 10, borderLeftWidth: 1, borderLeftColor: '#ddd' },
  stepRow: { flexDirection: 'row', minHeight: 40 },
  stepIndicator: { alignItems: 'center', width: 20, position: 'relative' },


  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#ddd', zIndex: 1, marginTop: 4 },
  dotActive: { backgroundColor: '#3483fa' }, 

  line: { width: 1, flex: 1, backgroundColor: '#ddd', position: 'absolute', top: 12, bottom: -40, left: 9.5 },
  lineActive: { backgroundColor: '#3483fa' },

  stepContent: { marginLeft: 15, paddingBottom: 20 },
  stepTitle: { fontSize: 14, fontWeight: 'bold', color: '#666' },
  stepDate: { fontSize: 12, color: '#999' },

  addressInfo: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 20, backgroundColor: '#fff', padding: 15, borderRadius: 8 },

  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginTop: 10
  },
  productImage: { width: 60, height: 60, marginRight: 15 },
  
  actionButton: {
      backgroundColor: '#fff',
      padding: 15,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: '#3483fa',
      marginBottom: 10,
      alignItems: 'center'
  },
  actionButtonText: {
      color: theme.colors.primary,
      fontWeight: 'bold',
      fontSize: 15
  }
});