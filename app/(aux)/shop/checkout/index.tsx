import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  Platform,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { Text, RadioButton, Divider } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../../../../src/constants/theme';
import { useCart } from '../../../../src/context/CartContext';
import { useAuth } from '../../../../src/context/AuthContext';
import api from '../../../../src/services/api';
import { Address } from '../../../../src/interfaces'; 

type DisplayAddress = Address & {
    city?: string;
    state?: string;
    neighborhood?: string;
};

export default function Checkout() {
  const router = useRouter();
  const { cartItems, clearCart } = useCart();
  const { user, signed } = useAuth();

  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'card'>('pix');
  const [loading, setLoading] = useState(false);
  const [loadingAddress, setLoadingAddress] = useState(false);
  const [address, setAddress] = useState<DisplayAddress | null>(null);

  const total = useMemo(
    () =>
      cartItems.reduce((sum, item) => sum + (item.product.price * (item.quantity || 1)), 0),
    [cartItems]
  );

  useEffect(() => {
    async function loadAddress() {
      const userId = (user as any)?.id;
      if (!userId || !signed) return;
      
      setLoadingAddress(true);
      try {
        const res = await api.get<Address[]>(`/api/address/by-client/${userId}`);
        
        if (Array.isArray(res.data) && res.data.length > 0) {
          const apiAddress = res.data[0];
          const displayAddress: DisplayAddress = {
              ...apiAddress,
              neighborhood: apiAddress.additionalInfo,
              city: "São Paulo",
              state: "SP",
          };
          setAddress(displayAddress);
        } else {
          setAddress(null);
        }
      } catch (err) {
        console.log('Erro ao buscar endereço:', err);
        setAddress(null);
      } finally {
        setLoadingAddress(false);
      }
    }
    loadAddress();
  }, [user, signed]);

  const handleFinish = async () => {
    if (!signed || (user as any)?.isGuest) {
      Alert.alert(
        'Login necessário',
        'Você precisa estar logado com uma conta para finalizar a compra.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Entrar', onPress: () => router.push('/(auth)/login' as any) },
        ]
      );
      return;
    }

    if (cartItems.length === 0) {
      Alert.alert('Carrinho vazio', 'Adicione produtos antes de continuar.');
      return;
    }

    if (!address) {
      Alert.alert(
        'Endereço não encontrado',
        'Adicione um endereço de entrega antes de finalizar a compra.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Adicionar endereço', onPress: () => router.push('/(aux)/account/address' as any) },
        ]
      );
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        clientId: (user as any)?.id,
        items: cartItems.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity || 1,
          price: item.product.price,
        })),
        addressId: address.id,
        total: Number(total.toFixed(2)),
        paymentMethod,
        status: 'PENDING',
      };

      await api.post('/api/orders', orderData);

      clearCart();
      
      Alert.alert('Sucesso!', 'Pedido realizado. Acompanhe o status em Minhas Compras.');
      
      router.replace('/(aux)/shop/my-purchases' as any);
      
    } catch (error: any) {
      console.log('Erro ao finalizar pedido:', error);
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        'Não foi possível finalizar a compra. Tente novamente.';
      Alert.alert('Erro', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.secondary} />
      <SafeAreaView style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialCommunityIcons name="close" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Checkout</Text>
          <View style={{ width: 24 }} />
        </View>
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Seção de Endereço */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Endereço de entrega</Text>
          <View style={styles.addressBox}>
            <MaterialCommunityIcons name="map-marker-outline" size={24} color="#333" />
            <View style={{ marginLeft: 10, flex: 1 }}>
              {loadingAddress ? (
                <ActivityIndicator color={theme.colors.primary} />
              ) : address ? (
                <>
                  <Text style={{ fontWeight: 'bold' }}>{address.street}, {address.number}</Text>
                  {/* 🟢 CORREÇÃO 2: Usando neighborhood (mock) e city/state (mock) */}
                  <Text style={{ color: '#666' }}>
                    {address.neighborhood} - {address.city}/{address.state}
                  </Text>
                  <Text style={{ color: '#666', fontSize: 12 }}>{(user as any)?.name || 'Destinatário'}</Text>
                </>
              ) : (
                <>
                  <Text style={{ fontWeight: 'bold' }}>Nenhum endereço</Text>
                  <Text style={{ color: '#666' }}>Adicione um endereço para entrega</Text>
                </>
              )}
            </View>
            
            <TouchableOpacity onPress={() => router.push('/(aux)/account/address' as any)}>
              <Text style={styles.link}>Trocar</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Seção de Pagamento */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Como você prefere pagar?</Text>

          <TouchableOpacity style={styles.paymentOption} onPress={() => setPaymentMethod('pix')}>
            <RadioButton
              value="pix"
              status={paymentMethod === 'pix' ? 'checked' : 'unchecked'}
              onPress={() => setPaymentMethod('pix')}
              color="#00a650"
            />
            <MaterialCommunityIcons name="qrcode" size={24} color="#00a650" style={{ marginLeft: 10 }} />
            <View style={{ marginLeft: 10 }}>
              <Text style={styles.paymentLabel}>Pix (Aprovação imediata)</Text>
              <Text style={styles.paymentSubLabel}>Use o app do seu banco</Text>
            </View>
          </TouchableOpacity>

          <Divider />

          <TouchableOpacity style={styles.paymentOption} onPress={() => setPaymentMethod('card')}>
            <RadioButton
              value="card"
              status={paymentMethod === 'card' ? 'checked' : 'unchecked'}
              onPress={() => setPaymentMethod('card')}
              color="#00a650"
            />
            <MaterialCommunityIcons name="credit-card-outline" size={24} color="#333" style={{ marginLeft: 10 }} />
            <View style={{ marginLeft: 10 }}>
              <Text style={styles.paymentLabel}>Cartão de Crédito</Text>
              <Text style={styles.paymentSubLabel}>Até 12x sem juros</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Resumo */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumo</Text>
          <View style={styles.row}>
            <Text>Produtos</Text>
            <Text>R$ {total.toFixed(2).replace('.', ',')}</Text>
          </View>
          <View style={styles.row}>
            <Text>Frete</Text>
            <Text style={{ color: '#00a650' }}>Grátis</Text>
          </View>
          <Divider style={{ marginVertical: 10 }} />
          <View style={styles.row}>
            <Text style={styles.totalLabel}>Você paga</Text>
            <Text style={styles.totalValue}>R$ {total.toFixed(2).replace('.', ',')}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Botão de Confirmar */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.payBtn} onPress={handleFinish} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.payText}>Confirmar compra</Text>}
        </TouchableOpacity>
      </View>
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
  },
  headerContent: {
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '500',
  },
  content: {
    padding: 15,
    paddingBottom: 140,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  addressBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  link: {
    color: '#3483fa',
    fontWeight: 'bold',
    fontSize: 13,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
  },
  paymentLabel: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  paymentSubLabel: {
    fontSize: 12,
    color: '#00a650',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 15,
    borderTopWidth: 1,
    borderColor: '#eee',
  },
  payBtn: {
    backgroundColor: '#3483fa',
    padding: 15,
    borderRadius: 6,
    alignItems: 'center',
  },
  payText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});