import React, { useState } from 'react'; // <--- useEffect removido
import { View, StyleSheet, ScrollView, Image, TouchableOpacity, SafeAreaView, StatusBar, Platform, Alert } from 'react-native';
import { Text, Divider, Button } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../constants/theme';
import { useAndroidNavigationBar } from '../hooks/useAndroidNavigationBar';

const MOCK_CART = [
  {
    id: 1,
    name: 'Tênis Nike Revolution 6 Next Nature',
    price: 299.99,
    quantity: 1,
    image: 'https://http2.mlstatic.com/D_NQ_NP_965033-MLB72634426749_112023-O.webp', 
    shipping: 0 
  },
  {
    id: 2,
    name: 'Fone de Ouvido Bluetooth JBL Tune',
    price: 150.00,
    quantity: 2,
    image: 'https://http2.mlstatic.com/D_NQ_NP_821636-MLA46604993138_072021-O.webp',
    shipping: 15.90
  }
];

export default function Cart() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState(MOCK_CART);
  
 useAndroidNavigationBar(true);
  const totalProduct = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalShipping = cartItems.reduce((sum, item) => sum + (item.shipping || 0), 0);
  const total = totalProduct + totalShipping;

  const handleRemove = (id: number) => {
    Alert.alert("Remover", "Deseja tirar este item do carrinho?", [
      { text: "Cancelar" },
      { text: "Sim, remover", onPress: () => setCartItems(prev => prev.filter(i => i.id !== id)) }
    ]);
  };

  const updateQuantity = (id: number, delta: number) => {
    setCartItems(prev => prev.map(item => {
      if (item.id === id) {
        const newQtd = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQtd };
      }
      return item;
    }));
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.secondary} />
      
      <SafeAreaView style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()} style={{padding: 5}}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Carrinho ({cartItems.length})</Text>
          {/* Espaço vazio para alinhar */}
          <View style={{width: 30}} />
        </View>
      </SafeAreaView>

      {cartItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="cart-off" size={80} color="#ddd" />
          <Text style={styles.emptyText}>Seu carrinho está vazio</Text>
          <Text style={styles.emptySubText}>Confira as ofertas do dia e comece a comprar!</Text>
          <Button mode="contained" onPress={() => router.push('/home')} style={styles.goHomeButton}>
            Ver ofertas
          </Button>
        </View>
      ) : (

        <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          <View style={styles.shippingCard}>
            <MaterialCommunityIcons name="truck-delivery-outline" size={24} color="#00a650" />
            <View style={{marginLeft: 15, flex: 1}}>
              {totalShipping === 0 ? (
                <Text style={{color: '#00a650', fontWeight: 'bold'}}>Frete grátis</Text>
              ) : (
                <Text style={{color: '#333'}}>Custo de envio: R$ {totalShipping.toFixed(2).replace('.', ',')}</Text>
              )}
              <Text style={{fontSize: 12, color: '#666'}}>Enviando para sua casa</Text>
            </View>
          </View>

          {cartItems.map((item) => (
            <View key={item.id} style={styles.itemCard}>
              <View style={styles.itemRow}>
                <Image source={{ uri: item.image }} style={styles.itemImage} resizeMode="contain" />
                
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
                  
                  <View style={styles.priceRow}>
                    <Text style={styles.itemPrice}>R$ {item.price.toFixed(2).replace('.', ',')}</Text>
                  </View>

                  <View style={styles.controlsRow}>
                    <View style={styles.quantityControl}>
                      <TouchableOpacity onPress={() => updateQuantity(item.id, -1)} style={styles.qtdBtn}>
                        <Text style={styles.qtdBtnText}>-</Text>
                      </TouchableOpacity>
                      <Text style={styles.qtdText}>{item.quantity}</Text>
                      <TouchableOpacity onPress={() => updateQuantity(item.id, 1)} style={styles.qtdBtn}>
                        <Text style={styles.qtdBtnText}>+</Text>
                      </TouchableOpacity>
                    </View>
                    
                    <TouchableOpacity onPress={() => handleRemove(item.id)}>
                      <Text style={styles.deleteText}>Excluir</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
              
              <Divider style={{marginTop: 15}} />
              <TouchableOpacity style={styles.saveForLater}>
                <Text style={styles.blueLink}>Salvar para depois</Text>
              </TouchableOpacity>
            </View>
          ))}

          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Resumo da compra</Text>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Produtos ({cartItems.reduce((a,b)=>a+b.quantity,0)})</Text>
              <Text style={styles.summaryValue}>R$ {totalProduct.toFixed(2).replace('.', ',')}</Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Frete</Text>
              <Text style={[styles.summaryValue, totalShipping === 0 && {color: '#00a650'}]}>
                {totalShipping === 0 ? 'Grátis' : `R$ ${totalShipping.toFixed(2).replace('.', ',')}`}
              </Text>
            </View>

            <Divider style={{marginVertical: 10}} />
            
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>R$ {total.toFixed(2).replace('.', ',')}</Text>
            </View>
          </View>

          <View style={{height: 100}} /> 
        </ScrollView>
      )}

      {cartItems.length > 0 && (
        <View style={styles.footer}>
          <View style={styles.footerRow}>
            <Text style={styles.footerTotalLabel}>Total</Text>
            <Text style={styles.footerTotalValue}>R$ {total.toFixed(2).replace('.', ',')}</Text>
          </View>
          <Button 
            mode="contained" 
            onPress={() => Alert.alert("Sucesso", "Compra finalizada!")} 
            style={styles.checkoutButton}
            labelStyle={{fontWeight: 'bold', fontSize: 16}}
          >
            Continuar compra
          </Button>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ebebeb' },
  
 
  header: { backgroundColor: theme.colors.secondary, paddingTop: Platform.OS === 'android' ? 30 : 0 },
  headerContent: { 
    height: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 10 
  },
  headerTitle: { fontSize: 18, color: '#333', fontWeight: '500' },


  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  emptyText: { fontSize: 20, fontWeight: 'bold', color: '#333', marginTop: 10 },
  emptySubText: { fontSize: 14, color: '#999', textAlign: 'center', marginTop: 5, marginBottom: 20 },
  goHomeButton: { backgroundColor: theme.colors.primary, borderRadius: 6 },

  scrollContent: { padding: 10 },

  shippingCard: { 
    backgroundColor: '#fff', padding: 15, borderRadius: 6, marginBottom: 10, 
    flexDirection: 'row', alignItems: 'center', elevation: 1 
  },
  
  itemCard: { backgroundColor: '#fff', borderRadius: 6, marginBottom: 10, padding: 15, elevation: 1 },
  itemRow: { flexDirection: 'row' },
  itemImage: { width: 60, height: 60, marginRight: 15, backgroundColor: '#f0f0f0', borderRadius: 4 },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 14, color: '#333', marginBottom: 5 },
  itemPrice: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  
  priceRow: { marginBottom: 10 },
  controlsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  
  quantityControl: { 
    flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#eee', borderRadius: 4 
  },
  qtdBtn: { paddingHorizontal: 12, paddingVertical: 5 },
  qtdBtnText: { fontSize: 18, color: theme.colors.primary },
  qtdText: { paddingHorizontal: 10, fontWeight: 'bold' },
  
  deleteText: { color: '#d63031', fontSize: 13 },
  saveForLater: { marginTop: 10, alignItems: 'center' },
  blueLink: { color: theme.colors.primary, fontSize: 14 },

  summaryCard: { backgroundColor: '#fff', borderRadius: 6, padding: 15, elevation: 1, marginBottom: 20 },
  summaryTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 15 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  summaryLabel: { color: '#666' },
  summaryValue: { color: '#333' },
  totalLabel: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  totalValue: { fontSize: 20, fontWeight: 'bold', color: '#333' },

  footer: { 
    backgroundColor: '#fff', padding: 15, borderTopWidth: 1, borderTopColor: '#eee', 
    position: 'absolute', bottom: 0, left: 0, right: 0, elevation: 10 
  },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  footerTotalLabel: { fontSize: 16, color: '#333', fontWeight: 'bold' },
  footerTotalValue: { fontSize: 20, color: '#333', fontWeight: 'bold' },
  checkoutButton: { backgroundColor: theme.colors.primary, borderRadius: 6, paddingVertical: 6 },
});