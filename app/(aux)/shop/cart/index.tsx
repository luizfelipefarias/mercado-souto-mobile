import React, { useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import { Text, Divider, Button } from 'react-native-paper';
import { useRouter, Router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '@/constants/theme';
import { useAndroidNavigationBar } from '@/hooks/useAndroidNavigationBar';
import { useCart, CartItem } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import Toast from 'react-native-toast-message';

interface CartItemComponentProps {
    item: CartItem;
    handleRemove: (id: number) => void;
    updateQuantity: (id: number, amount: number) => void;
    router: Router;
}

const CartItemComponent = ({ item, handleRemove, updateQuantity, router }: CartItemComponentProps) => {
    const [imageError, setImageError] = useState(false);
    
    const productId = item.id;
    const productName = item.name;
    const productPrice = item.price;
    const productImageUri = item.image; 
    
    const showIconFallback = imageError || !productImageUri || productImageUri.length === 0;

    return (
        <View style={styles.itemContainer}>
          <View style={styles.itemRow}>
            <View style={styles.itemImageContainer}>
              {showIconFallback ? (
                  <View style={styles.fallbackBackground}>
                      <MaterialCommunityIcons name="image-off-outline" size={30} color="#999" />
                  </View>
              ) : (
                <Image
                  source={{ uri: productImageUri! }}
                  style={styles.itemImage}
                  resizeMode="contain"
                  onError={() => setImageError(true)}
                />
              )}
            </View>

            <View style={styles.itemInfo}>
              <Text style={styles.itemName} numberOfLines={2}>
                {productName}
              </Text>
              <Text style={styles.itemPrice}>
                R$ {productPrice.toFixed(2).replace('.', ',')}
              </Text>
              <View style={styles.controlsRow}>
                <View style={styles.quantityControl}>
                  <TouchableOpacity
                    onPress={() => updateQuantity(productId, -1)} 
                    style={[styles.qtdBtn, item.quantity === 1 && { opacity: 0.3 }]}
                    disabled={item.quantity === 1}
                  >
                    <Text style={styles.qtdBtnText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.qtdText}>{item.quantity}</Text>
                  <TouchableOpacity
                    onPress={() => updateQuantity(productId, 1)}
                    style={styles.qtdBtn}
                  >
                    <Text style={styles.qtdBtnText}>+</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity onPress={() => handleRemove(productId)}> 
                  <Text style={styles.deleteText}>Excluir</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
          <Divider style={{ marginTop: 15, marginBottom: 10 }} />
          <TouchableOpacity style={{alignItems: 'center'}} onPress={() => router.push(`/(aux)/shop/product/${productId}` as any)}>
              <Text style={{color: '#3483fa', fontWeight: '500'}}>Ver detalhes</Text>
          </TouchableOpacity>
        </View>
    );
};

export default function Cart() {
  const router = useRouter();
  const { user, isGuest } = useAuth(); 
  const { cartItems, removeFromCart, updateQuantity } = useCart();
  
  const groupedCart = useMemo(() => {
    interface SellerGroup {
        sellerId: number;
        sellerName: string;
        items: CartItem[];
    }

    const groups: { [key: string]: SellerGroup } = {};

    cartItems.forEach((item) => {
        const rawId = item.seller?.id || 0;
        const idKey = String(rawId);
        
        const name = item.seller?.tradeName || item.seller?.name || 'Mercado Souto';

        if (!groups[idKey]) {
            groups[idKey] = {
                sellerId: rawId,
                sellerName: name,
                items: []
            };
        } else {
            if (groups[idKey].sellerName === 'Carregando vendedor...' && name !== 'Carregando vendedor...') {
                groups[idKey].sellerName = name;
            }
        }

        groups[idKey].items.push(item);
    });

    return Object.values(groups);
  }, [cartItems]);

  const totalItemsCount = useMemo(
    () => cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0),
    [cartItems]
  );
  
  const totalProduct = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.price * Math.max(item.quantity || 1, 1), 0),
    [cartItems]
  );

  const totalShipping = useMemo(
    () => cartItems.reduce((sum, item) => sum + (item.shipping || 0), 0),
    [cartItems]
  );

  const total = totalProduct + totalShipping;

  useAndroidNavigationBar(true);

  const handleRemove = (id: number) => {
    const confirmAction = () => {
        removeFromCart(id);
        Toast.show({ type: 'success', text1: 'Item removido!' });
    };

    if (Platform.OS === 'web') {
        if (window.confirm('Remover este produto?')) confirmAction();
    } else {
        Alert.alert('Remover item', 'Deseja remover este produto do carrinho?', [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Remover', style: 'destructive', onPress: confirmAction },
        ]);
    }
  };

  const handleCheckout = () => {
    if (!user || isGuest) {
      Toast.show({
        type: 'info',
        text1: 'Login Necessário',
        text2: 'Faça login para finalizar a compra.',
        visibilityTime: 4000
      });
      router.push('/(auth)/login' as any); 
      return;
    }

    if (cartItems.length === 0) {
        Toast.show({
            type: 'info',
            text1: 'Carrinho vazio',
            text2: 'Adicione produtos antes de continuar.',
            visibilityTime: 3000
        });
      return;
    }

    router.push('/(aux)/shop/checkout' as any);
  };
  
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.secondary} />

      <SafeAreaView style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity 
            onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/home' as any)} 
            style={{ padding: 5 }}
          >
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
          <Button mode="contained" onPress={() => router.push('/(tabs)/home' as any)} style={styles.goHomeButton} labelStyle={{ color: '#333', fontWeight: 'bold' }}>
            Descobrir ofertas
          </Button>
        </View>
      ) : (
        <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
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

          {/* RENDERIZAÇÃO AGRUPADA POR ID DO VENDEDOR */}
          {groupedCart.map((group) => (
              <View key={group.sellerId.toString()} style={styles.sellerSection}>
                  <View style={styles.sellerHeader}>
                      <MaterialCommunityIcons name="store-outline" size={20} color="#666" />
                      <Text style={styles.sellerTitle}>
                          Vendido por {group.sellerName}
                      </Text>
                  </View>
                  
                  {group.items.map((item) => (
                      <CartItemComponent 
                          key={item.id}
                          item={item}
                          handleRemove={handleRemove}
                          updateQuantity={updateQuantity}
                          router={router}
                      />
                  ))}
              </View>
          ))}

          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Resumo da compra</Text>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Produtos ({totalItemsCount})</Text>
              <Text style={styles.summaryValue}>R$ {totalProduct.toFixed(2).replace('.', ',')}</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Frete</Text>
              <Text style={[styles.summaryValue, totalShipping === 0 && { color: '#00a650' }]}>
                {totalShipping === 0 ? 'Grátis' : `R$ ${totalShipping.toFixed(2).replace('.', ',')}`}
              </Text>
            </View>

            <Divider style={{ marginVertical: 12 }} />

            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>R$ {total.toFixed(2).replace('.', ',')}</Text>
            </View>
          </View>

          <View style={{ height: 120 }} />
        </ScrollView>
      )}

      {cartItems.length > 0 && (
        <View style={styles.footer}>
          <View style={styles.footerRow}>
            <Text style={styles.footerTotalLabel}>Total</Text>
            <Text style={styles.footerTotalValue}>R$ {total.toFixed(2).replace('.', ',')}</Text>
          </View>
          <Button mode="contained" onPress={handleCheckout} style={styles.checkoutButton} labelStyle={{ fontWeight: 'bold', fontSize: 16, color: '#fff' }}>
            Continuar compra
          </Button>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { backgroundColor: theme.colors.secondary, paddingTop: Platform.OS === 'android' ? 30 : 0 },
  headerContent: { height: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 10 },
  headerTitle: { fontSize: 18, color: '#333', fontWeight: '500' },
  
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  iconCircle: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#eee', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  emptyText: { fontSize: 18, fontWeight: 'bold', color: '#333', marginTop: 10 },
  goHomeButton: { backgroundColor: theme.colors.primary, borderRadius: 6, width: '100%', paddingVertical: 4, marginTop: 20 },
  
  scrollContent: { padding: 10 },
  
  shippingCard: { backgroundColor: '#fff', padding: 15, borderRadius: 8, marginBottom: 12, flexDirection: 'row', alignItems: 'center', elevation: 1 },
  summaryCard: { backgroundColor: '#fff', borderRadius: 8, padding: 20, elevation: 1, marginBottom: 20 },
  
  sellerSection: { backgroundColor: '#fff', borderRadius: 8, marginBottom: 15, elevation: 2, overflow: 'hidden' },
  sellerHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 12, backgroundColor: '#fafafa', borderBottomWidth: 1, borderBottomColor: '#eee' },
  sellerTitle: { fontSize: 14, fontWeight: 'bold', color: '#444', marginLeft: 8 },
  
  itemContainer: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' }, 
  itemRow: { flexDirection: 'row' },
  itemImageContainer: { width: 70, height: 70, marginRight: 15, borderRadius: 4, justifyContent: 'center', alignItems: 'center', overflow: 'hidden', backgroundColor: '#fff', borderWidth: 1, borderColor: '#f0f0f0' },
  fallbackBackground: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9f9f9' },
  itemImage: { width: '100%', height: '100%' },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 14, color: '#333', marginBottom: 8, lineHeight: 18 },
  itemPrice: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  
  controlsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  quantityControl: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 20, height: 32 },
  qtdBtn: { paddingHorizontal: 12, height: '100%', justifyContent: 'center' },
  qtdBtnText: { fontSize: 18, color: '#3483fa', fontWeight: 'bold' },
  qtdText: { paddingHorizontal: 8, fontWeight: 'bold', fontSize: 14 },
  deleteText: { color: '#3483fa', fontSize: 13, fontWeight: '500' },
  
  summaryTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 15 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  summaryLabel: { color: '#666', fontSize: 15 },
  summaryValue: { color: '#333', fontSize: 15 },
  totalLabel: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  totalValue: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  
  footer: { backgroundColor: '#fff', padding: 15, borderTopWidth: 1, borderTopColor: '#e0e0e0', position: 'absolute', bottom: 0, left: 0, right: 0, elevation: 20 },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  footerTotalLabel: { fontSize: 16, color: '#333', fontWeight: 'bold' },
  footerTotalValue: { fontSize: 24, color: '#333', fontWeight: 'bold' },
  checkoutButton: { backgroundColor: '#3483fa', borderRadius: 6, paddingVertical: 8 },
});