import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator, Alert, StatusBar, SafeAreaView, Platform } from 'react-native';
import { Text, Divider } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../../constants/theme';
import api from '../../services/api';
import { useAndroidNavigationBar } from '../../hooks/useAndroidNavigationBar';

type ProductDetail = {
  id: number;
  name: string;
  price: number;
  description: string;
  imageUri?: string;
  stock?: number; 
};

export default function ProductDetails() {
  const { id } = useLocalSearchParams(); 
  const router = useRouter();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
useAndroidNavigationBar(true);
  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const response = await api.get(`/api/product/${id}`);
        setProduct(response.data);
      } catch (error) {
        console.log(error);
        Alert.alert("Ops!", "Produto não encontrado.");
        router.back();
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProductDetails();
  }, [id, router]);

  const handleBuy = () => {
    Alert.alert("Checkout", "Indo para pagamento...");
  };

  const handleAddToCart = () => {
    router.push('/cart' as any);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!product) return null;

  const originalPrice = product.price * 1.25; 
  const installmentPrice = product.price / 6;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.secondary} />
      
      <SafeAreaView style={styles.headerSafeArea}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButtonHeader}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.searchBarHeader}>
            <MaterialCommunityIcons name="magnify" size={20} color="#999" style={{marginLeft: 8}} />
            <Text style={styles.searchTextHeader} numberOfLines={1}>Buscar no Mercado Livre</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cartButtonHeader} onPress={() => router.push('/cart' as any)}>
            <MaterialCommunityIcons name="cart-outline" size={26} color="#333" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.locationBar}>
          <MaterialCommunityIcons name="map-marker-outline" size={14} color="#333" />
          <Text style={styles.locationText}>Enviar para Luiz Felipe - Recife</Text>
        </View>
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.whiteContainer}>
          <View style={styles.topInfo}>
            <Text style={styles.conditionText}>Novo  |  +1000 vendidos</Text>
            <View style={styles.titleRow}>
              <Text style={styles.title}>{product.name}</Text>
            </View>
            
            <View style={styles.ratingContainer}>
              <MaterialCommunityIcons name="star" size={16} color={theme.colors.primary} />
              <MaterialCommunityIcons name="star" size={16} color={theme.colors.primary} />
              <MaterialCommunityIcons name="star" size={16} color={theme.colors.primary} />
              <MaterialCommunityIcons name="star" size={16} color={theme.colors.primary} />
              <MaterialCommunityIcons name="star-half-full" size={16} color={theme.colors.primary} />
              <Text style={styles.ratingText}>4.8 (124)</Text>
            </View>
          </View>

          <View style={styles.imageContainer}>
            {product.imageUri ? (
              <Image source={{ uri: product.imageUri }} style={styles.productImage} resizeMode="contain" />
            ) : (
              <MaterialCommunityIcons name="package-variant" size={180} color="#ddd" />
            )}
            
            <View style={styles.pagination}>
              <View style={[styles.dot, styles.activeDot]} />
              <View style={styles.dot} />
              <View style={styles.dot} />
            </View>

            <TouchableOpacity onPress={() => setIsFavorite(!isFavorite)} style={styles.favoriteFloat}>
              <MaterialCommunityIcons name={isFavorite ? "heart" : "heart-outline"} size={26} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.variationContainer}>
            <Text style={styles.variationLabel}>Cor: <Text style={styles.variationValue}>Padrão</Text></Text>
            <View style={styles.variationBox}>
              {product.imageUri ? (
                 <Image source={{ uri: product.imageUri }} style={{width: 40, height: 40, borderRadius: 4}} />
              ) : (
                 <MaterialCommunityIcons name="format-color-fill" size={24} color="#555" />
              )}
            </View>
          </View>

          <View style={styles.priceContainer}>
            <Text style={styles.oldPrice}>R$ {originalPrice.toFixed(0)}</Text>
            <View style={styles.currentPriceRow}>
              <Text style={styles.currency}>R$</Text>
              <Text style={styles.price}>{Math.floor(product.price)}</Text>
              <Text style={styles.cents}>{((product.price % 1) * 100).toFixed(0).padStart(2, '0')}</Text>
              <Text style={styles.discount}>18% OFF</Text>
            </View>
            <Text style={styles.installments}>em <Text style={{color: '#00a650'}}>6x R$ {installmentPrice.toFixed(2).replace('.', ',')} sem juros</Text></Text>
            <Text style={styles.paymentMethods}>Ver os meios de pagamento</Text>
          </View>

          <View style={styles.benefitsContainer}>
            <View style={styles.benefitRow}>
              <MaterialCommunityIcons name="truck-check-outline" size={24} color="#00a650" />
              <View style={styles.benefitTextCol}>
                <Text style={styles.benefitTitle}>Frete grátis</Text>
                <Text style={styles.benefitSubtitle}>Saiba os prazos de entrega e as formas de envio.</Text>
                <View style={styles.fullRow}>
                  <MaterialCommunityIcons name="lightning-bolt" size={14} color="#00a650" />
                  <Text style={styles.fullText}>FULL</Text>
                  <Text style={styles.fullDesc}>O envio mais rápido e seguro</Text>
                </View>
              </View>
            </View>

            <View style={styles.benefitRow}>
              <MaterialCommunityIcons name="undo-variant" size={24} color="#00a650" />
              <View style={styles.benefitTextCol}>
                <Text style={styles.benefitTitle}>Devolução grátis</Text>
                <Text style={styles.benefitSubtitle}>Você tem 30 dias a partir da data de recebimento.</Text>
              </View>
            </View>

            <View style={styles.benefitRow}>
              <MaterialCommunityIcons name="shield-check-outline" size={24} color="#333" />
              <View style={styles.benefitTextCol}>
                <Text style={styles.benefitTitle}>Compra Garantida</Text>
                <Text style={styles.benefitSubtitle}>Receba o produto que está esperando ou devolvemos o dinheiro.</Text>
              </View>
            </View>
          </View>

          <Text style={styles.stockText}>Estoque disponível</Text>
          <View style={styles.quantityContainer}>
            <Text>Quantidade: <Text style={{fontWeight: 'bold'}}>1 unidade</Text> (+50 disponíveis)</Text>
            <MaterialCommunityIcons name="chevron-right" size={20} color="#ccc" />
          </View>

          <View style={styles.actionsContainer}>
            <TouchableOpacity style={styles.buyButton} onPress={handleBuy}>
              <Text style={styles.buyButtonText}>Comprar agora</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cartButton} onPress={handleAddToCart}>
              <Text style={styles.cartButtonText}>Adicionar ao carrinho</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.sellerSection}>
            <Text style={styles.soldBy}>Vendido por <Text style={{color: theme.colors.primary}}>LOJA OFICIAL</Text></Text>
            <Text style={styles.sellerSubtitle}>MercadoLíder Platinum | +100mil vendas</Text>
          </View>

        </View>

        <Divider style={{ height: 1, backgroundColor: '#eee' }} />

        <View style={styles.descriptionSection}>
          <Text style={styles.sectionTitle}>Descrição</Text>
          <Text style={styles.descriptionText}>
            {product.description || "Produto de alta qualidade, original e com nota fiscal. Aproveite as condições especiais de pagamento e entrega rápida do Mercado Livre Full."}
          </Text>
        </View>

        <View style={{height: 40}} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ebebeb' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  headerSafeArea: { backgroundColor: theme.colors.secondary, paddingTop: Platform.OS === 'android' ? 30 : 0 },
  headerContent: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingBottom: 10, height: 50 },
  backButtonHeader: { marginRight: 10 },
  searchBarHeader: { 
    flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', 
    height: 35, borderRadius: 20, paddingHorizontal: 10, elevation: 2 
  },
  searchTextHeader: { color: '#999', marginLeft: 5, fontSize: 14 },
  cartButtonHeader: { marginLeft: 15 },
  locationBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, paddingBottom: 8 },
  locationText: { fontSize: 12, color: '#333', marginLeft: 5 },

  scrollContent: { paddingBottom: 20 },
  whiteContainer: { backgroundColor: '#fff', padding: 15, marginBottom: 10 },

  topInfo: { marginBottom: 10 },
  conditionText: { fontSize: 12, color: '#999', marginBottom: 5 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between' },
  title: { fontSize: 16, color: '#333', lineHeight: 22, flex: 1 },
  ratingContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 5 },
  ratingText: { color: '#999', fontSize: 12, marginLeft: 5 },

  imageContainer: { width: '100%', height: 300, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  productImage: { width: '100%', height: '100%' },
  favoriteFloat: { 
    position: 'absolute', top: 0, right: 0, backgroundColor: '#fff', 
    padding: 8, borderRadius: 30, elevation: 3, shadowColor: '#000', shadowOpacity: 0.1 
  },
  pagination: { flexDirection: 'row', position: 'absolute', bottom: 10 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#ddd', marginHorizontal: 3 },
  activeDot: { backgroundColor: theme.colors.primary },

  variationContainer: { marginBottom: 20 },
  variationLabel: { fontSize: 14, color: '#333' },
  variationValue: { fontWeight: 'bold' },
  variationBox: { 
    marginTop: 8, borderWidth: 2, borderColor: theme.colors.primary, 
    borderRadius: 6, width: 46, height: 46, justifyContent: 'center', alignItems: 'center' 
  },

  priceContainer: { marginBottom: 20 },
  oldPrice: { fontSize: 14, color: '#999', textDecorationLine: 'line-through' },
  currentPriceRow: { flexDirection: 'row', alignItems: 'flex-start' },
  currency: { fontSize: 20, color: '#333', marginTop: 4 },
  price: { fontSize: 36, fontWeight: '300', color: '#333', marginHorizontal: 2 },
  cents: { fontSize: 18, color: '#333', marginTop: 4 },
  discount: { fontSize: 16, color: '#00a650', fontWeight: 'bold', marginTop: 8, marginLeft: 8 },
  installments: { fontSize: 14, color: '#333', marginTop: 5 },
  paymentMethods: { fontSize: 14, color: theme.colors.primary, marginTop: 5, fontWeight: '500' },

  benefitsContainer: { marginTop: 10 },
  benefitRow: { flexDirection: 'row', marginBottom: 15 },
  benefitTextCol: { marginLeft: 10, flex: 1 },
  benefitTitle: { color: '#00a650', fontWeight: 'bold', fontSize: 14 },
  benefitSubtitle: { color: '#999', fontSize: 13, marginTop: 2 },
  fullRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  fullText: { color: '#00a650', fontWeight: '900', fontStyle: 'italic', fontSize: 12, marginLeft: 2 },
  fullDesc: { color: '#999', fontSize: 12, marginLeft: 5, fontStyle: 'italic' },

  stockText: { fontWeight: 'bold', fontSize: 14, color: '#333', marginBottom: 10 },
  quantityContainer: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
    backgroundColor: '#f5f5f5', padding: 12, borderRadius: 6, marginBottom: 20 
  },

  actionsContainer: { gap: 10 },
  buyButton: { backgroundColor: '#3483fa', paddingVertical: 14, borderRadius: 6, alignItems: 'center' },
  buyButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  cartButton: { backgroundColor: 'rgba(65, 137, 230, 0.2)', paddingVertical: 14, borderRadius: 6, alignItems: 'center' },
  cartButtonText: { color: '#3483fa', fontSize: 16, fontWeight: 'bold' },

  sellerSection: { marginTop: 20, marginBottom: 10 },
  soldBy: { fontSize: 14, color: '#666' },
  sellerSubtitle: { fontSize: 12, color: '#999', marginTop: 2 },

  descriptionSection: { backgroundColor: '#fff', padding: 15 },
  sectionTitle: { fontSize: 18, color: '#333', marginBottom: 10 },
  descriptionText: { fontSize: 14, color: '#666', lineHeight: 20 },
});