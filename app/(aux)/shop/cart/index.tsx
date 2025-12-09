import React, { useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
  Alert,
} from 'react-native';
import { Text, Divider, Button } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../../../../src/constants/theme';
import { useAndroidNavigationBar } from '../../../../src/hooks/useAndroidNavigationBar';
import { useCart } from '../../../../src/context/CartContext';
import { useAuth } from '../../../../src/context/AuthContext';

export default function Cart() {
  const router = useRouter();
  const { cartItems, removeFromCart, updateQuantity } = useCart();
  const { user } = useAuth();

  useAndroidNavigationBar(true);


  const totalProduct = useMemo(
    () =>
      cartItems.reduce(
        (sum, item) => sum + item.price * Math.max(item.quantity || 1, 1),
        0
      ),
    [cartItems]
  );

  const totalShipping = useMemo(
    () => cartItems.reduce((sum, item) => sum + (item.shipping || 0), 0),
    [cartItems]
  );

  const total = totalProduct + totalShipping;

  const handleRemove = (id: number) => {
    Alert.alert('Remover item', 'Tem certeza que deseja remover este produto do carrinho?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover',
        style: 'destructive',
        onPress: () => removeFromCart(id),
      },
    ]);
  };

  const handleCheckout = () => {

    if (!user || (user as any)?.isGuest) {
      Alert.alert(
        'Login necessário',
        'Você precisa estar logado para finalizar a compra.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { 
            text: 'Fazer login', 
            onPress: () => router.push('/(auth)/login' as any) 
          },
        ]
      );
      return;
    }

    if (cartItems.length === 0) {
      Alert.alert('Carrinho vazio', 'Adicione produtos antes de continuar.');
      return;
    }

    router.push('/(aux)/shop/checkout' as any);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.secondary} />

      <SafeAreaView style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()} style={{ padding: 5 }}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Carrinho ({cartItems.length})</Text>
          <View style={{ width: 30 }} />
        </View>
      </SafeAreaView>

      {cartItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons name="cart-outline" size={60} color="#ddd" />
          </View>
          <Text style={styles.emptyText}>Seu carrinho está vazio</Text>
          <Text style={styles.emptySubText}>
            Temos milhares de ofertas e cupons esperando por você!
          </Text>
          <Button
            mode="contained"
            // Rota corrigida para Home (Raiz da Tab)
            onPress={() => router.push('/(tabs)' as any)}
            style={styles.goHomeButton}
            labelStyle={{ color: '#333', fontWeight: 'bold' }}
          >
            Descobrir ofertas
          </Button>
        </View>
      ) : (
        <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Card de Frete */}
          <View style={styles.shippingCard}>
            <MaterialCommunityIcons name="truck-delivery-outline" size={28} color="#00a650" />
            <View style={{ marginLeft: 15, flex: 1 }}>
              {totalShipping === 0 ? (
                <Text style={{ color: '#00a650', fontWeight: 'bold', fontSize: 16 }}>
                  Frete grátis
                </Text>
              ) : (
                <Text style={{ color: '#333' }}>
                  Custo de envio: R$ {totalShipping.toFixed(2).replace('.', ',')}
                </Text>
              )}
              <Text style={{ fontSize: 13, color: '#666' }}>Benefício Mercado Pontos</Text>
            </View>
          </View>


          {cartItems.map(item => (
            <View key={item.id} style={styles.itemCard}>
              <View style={styles.itemRow}>
                <Image
                  source={{ uri: item.image || 'https://via.placeholder.com/150' }}
                  style={styles.itemImage}
                  resizeMode="contain"
                />

                <View style={styles.itemInfo}>
                  <Text style={styles.itemName} numberOfLines={2}>
                    {item.name}
                  </Text>

                  <Text style={styles.itemPrice}>
                    R$ {item.price.toFixed(2).replace('.', ',')}
                  </Text>

                  <View style={styles.controlsRow}>
                    <View style={styles.quantityControl}>
                      <TouchableOpacity
                        onPress={() => updateQuantity(item.id, -1)}
                        style={[
                          styles.qtdBtn,
                          item.quantity === 1 && { opacity: 0.3 },
                        ]}
                        disabled={item.quantity === 1}
                      >
                        <Text style={styles.qtdBtnText}>-</Text>
                      </TouchableOpacity>

                      <Text style={styles.qtdText}>{item.quantity}</Text>

                      <TouchableOpacity
                        onPress={() => updateQuantity(item.id, 1)}
                        style={styles.qtdBtn}
                      >
                        <Text style={styles.qtdBtnText}>+</Text>
                      </TouchableOpacity>
                    </View>

                    <TouchableOpacity onPress={() => handleRemove(item.id)}>
                      <Text style={styles.deleteText}>Excluir</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              <Divider style={{ marginTop: 15, marginBottom: 10 }} />
              
              <View style={{alignItems: 'center'}}>
                  <Text style={{color: '#3483fa', fontWeight: '500'}}>Ver mais produtos do vendedor</Text>
              </View>
            </View>
          ))}


          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Resumo da compra</Text>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>
                Produtos ({cartItems.reduce((a, b) => a + (b.quantity || 1), 0)})
              </Text>
              <Text style={styles.summaryValue}>
                R$ {totalProduct.toFixed(2).replace('.', ',')}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Frete</Text>
              <Text
                style={[
                  styles.summaryValue,
                  totalShipping === 0 && { color: '#00a650' },
                ]}
              >
                {totalShipping === 0
                  ? 'Grátis'
                  : `R$ ${totalShipping.toFixed(2).replace('.', ',')}`}
              </Text>
            </View>

            <Divider style={{ marginVertical: 12 }} />

            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>
                R$ {total.toFixed(2).replace('.', ',')}
              </Text>
            </View>
          </View>

          <View style={{ height: 120 }} />
        </ScrollView>
      )}


      {cartItems.length > 0 && (
        <View style={styles.footer}>
          <View style={styles.footerRow}>
            <Text style={styles.footerTotalLabel}>Total</Text>
            <Text style={styles.footerTotalValue}>
              R$ {total.toFixed(2).replace('.', ',')}
            </Text>
          </View>
          <Button
            mode="contained"
            onPress={handleCheckout}
            style={styles.checkoutButton}
            labelStyle={{ fontWeight: 'bold', fontSize: 16, color: '#fff' }}
          >
            Continuar compra
          </Button>
        </View>
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
  },
  headerContent: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  headerTitle: {
    fontSize: 18,
    color: '#333',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 30,
    lineHeight: 20,
  },
  goHomeButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 6,
    width: '100%',
    paddingVertical: 4,
  },
  scrollContent: {
    padding: 10,
  },
  shippingCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
  },
  itemCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 12,
    padding: 15,
    elevation: 2,
  },
  itemRow: {
    flexDirection: 'row',
  },
  itemImage: {
    width: 70,
    height: 70,
    marginRight: 15,
    backgroundColor: '#fff',
    borderRadius: 4,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    lineHeight: 18,
  },
  itemPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 20,
    height: 32,
  },
  qtdBtn: {
    paddingHorizontal: 12,
    height: '100%',
    justifyContent: 'center',
  },
  qtdBtnText: {
    fontSize: 18,
    color: '#3483fa',
    fontWeight: 'bold',
  },
  qtdText: {
    paddingHorizontal: 8,
    fontWeight: 'bold',
    fontSize: 14,
  },
  deleteText: {
    color: '#3483fa',
    fontSize: 13,
    fontWeight: '500',
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    elevation: 2,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryLabel: {
    color: '#666',
    fontSize: 15,
  },
  summaryValue: {
    color: '#333',
    fontSize: 15,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  footer: {
    backgroundColor: '#fff',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 20,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  footerTotalLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
  },
  footerTotalValue: {
    fontSize: 24,
    color: '#333',
    fontWeight: 'bold',
  },
  checkoutButton: {
    backgroundColor: '#3483fa',
    borderRadius: 6,
    paddingVertical: 8,
  },
});