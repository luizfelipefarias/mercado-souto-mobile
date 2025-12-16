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

// Tipagem baseada na resposta da API
type OrderItemDisplay = {
  id: number;
  product: { 
      id: number; 
      title: string; 
      imageURL: string[];
      price: number;
  };
  quantity: number;
  unitPrice: number;
  subTotal: number;
};

// Objeto de endereço vindo do Backend
type BackendAddress = {
    street: string;
    number: string;
    additionalInfo: string;
    neighborhood?: string;
    city?: string;
    state?: string;
};

type OrderDetail = {
  id: number;
  createdAt: string;
  status: string;
  totalPrice: number;
  orderItems: OrderItemDisplay[];
  // Dependendo do backend, o endereço pode vir dentro de 'client' ou solto. 
  // Ajuste conforme seu JSON real. Vou assumir que venha no objeto ou pegamos do user.
  clientAddress?: BackendAddress; 
};

export default function OrderDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  
  // 1. Pegando o token do contexto
  const { user, token } = useAuth();

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
    
    const getDateMock = (active: boolean) => active ? "Concluído" : "Pendente"; 

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
            date: "Hoje", 
            active: true, 
            isCurrent: true 
        });
    }

    return timeline;
  };
  
  const fetchOrderDetails = async (orderId: string | string[]) => {
    setLoading(true);
    const userId = user?.id;

    // Validação de segurança
    if (!userId || !token) {
        setLoading(false);
        // Se não tiver token, volta ou manda pro login
        return;
    }
    
    try {
        console.log(`[DEBUG] Buscando detalhes do pedido ${orderId} para usuario ${userId}`);

        // 2. Passando o Header Authorization
        const response = await api.get<OrderDetail[]>(`/api/purchase/by-client/${userId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        
        // Converte ID para string para comparar
        const foundOrder = response.data.find((o: any) => String(o.id) === String(orderId));

        if (foundOrder) {
            setOrder(foundOrder);
        } else {
            Alert.alert("Aviso", "Pedido não encontrado.");
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
    if (id && user && token) {
        fetchOrderDetails(id);
    }
  }, [id, user, token]);

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
  
  const formattedDate = new Date(order.createdAt).toLocaleDateString('pt-BR');
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
        
        {/* Status Card */}
        <View style={styles.statusCard}>
          <MaterialCommunityIcons 
            name={mainIconName} 
            size={30} 
            color={order.status === 'DELIVERED' ? '#00a650' : theme.colors.primary} 
          />
          <View style={{ marginLeft: 15 }}>
            <Text style={{ fontWeight: 'bold', fontSize: 16 }}>{currentStep.title}</Text>
            <Text style={{ color: '#666' }}>
                {order.status === 'DELIVERED' ? `Entregue em: ${formattedDate}` : `Realizado em: ${formattedDate}`}
            </Text>
          </View>
        </View>

        {/* Timeline */}
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
                <Text style={styles.stepDate}>{step.date}</Text>
              </View>
            </View>
          ))}
        </View>

        <Divider style={{ marginVertical: 20 }} />

        {/* Endereço (Proteção caso o endereço venha nulo) */}
        <View style={styles.addressInfo}>
          <MaterialCommunityIcons name="map-marker-outline" size={24} color="#666" />
          <View style={{ marginLeft: 15, flex: 1 }}>
            {order.clientAddress ? (
                <>
                    <Text style={{ color: '#666', fontSize: 12 }}>
                        {order.clientAddress.street}, {order.clientAddress.number}
                    </Text>
                    {order.clientAddress.additionalInfo ? (
                        <Text style={{ color: '#666', fontSize: 12 }}>{order.clientAddress.additionalInfo}</Text>
                    ) : null}
                </>
            ) : (
                <Text style={{ color: '#666', fontSize: 12 }}>Endereço padrão do cadastro</Text>
            )}
            
            <Text style={{ fontWeight: 'bold', marginTop: 2 }}>
                {user?.name || 'Destinatário'}
            </Text>
          </View>
        </View>

        {/* Lista de Produtos no Pedido */}
        {order.orderItems && order.orderItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.productCard}
              onPress={() => router.push(`/(aux)/shop/product/${item.product.id}` as any)}
            >
              <Image
                source={{ uri: item.product.imageURL?.[0] || 'https://via.placeholder.com/100' }}
                style={styles.productImage}
                resizeMode="contain"
              />

              <View style={{ flex: 1 }}>
                <Text numberOfLines={1} style={{fontWeight: 'bold'}}>{item.product.title || 'Produto'}</Text>
                <Text style={{ color: '#666' }}>
                    {item.quantity} un. x R$ {item.unitPrice ? item.unitPrice.toFixed(2).replace('.', ',') : '0,00'}
                </Text>
                <Text style={{ fontWeight: 'bold', color: theme.colors.primary }}>
                    Total: R$ {item.subTotal ? item.subTotal.toFixed(2).replace('.', ',') : '0,00'}
                </Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={20} color="#ccc" />
            </TouchableOpacity>
        ))}

        <View style={{ marginTop: 10, alignItems: 'flex-end' }}>
             <Text style={{fontSize: 16}}>Total do Pedido:</Text>
             <Text style={{fontSize: 20, fontWeight: 'bold'}}>R$ {order.totalPrice.toFixed(2).replace('.', ',')}</Text>
        </View>
        
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
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#eee'
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