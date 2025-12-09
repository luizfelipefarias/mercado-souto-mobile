import React, { useEffect, useState } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  Image, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert, 
  StatusBar, 
  SafeAreaView, 
  Platform,
  FlatList,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent
} from 'react-native';
import { Text, Divider } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../../../../src/constants/theme';
import api from '../../../../src/services/api';
import { useAndroidNavigationBar } from '../../../../src/hooks/useAndroidNavigationBar';
import { useCart } from '../../../../src/context/CartContext'; 
import { useAuth } from '../../../../src/context/AuthContext'; 
import CartIcon from '../../../../src/components/CartIcon'; 

import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSequence, 
  runOnJS, 
  Easing,
  interpolate
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');
const CAROUSEL_WIDTH = width - 30; 
const ANIMATION_DURATION = 800; 
const MINIATURE_SIZE = 80;      

type ProductDetail = {
  id: number;
  name: string;
  price: number;
  description: string;
  images: string[];
  stock?: number; 
};

type ProductBackend = {
  id: number;
  title: string;
  price: number;
  description: string;
  imageURL?: string[];
  stock: number;
};

export default function ProductDetails() {
  const { id } = useLocalSearchParams(); 
  const router = useRouter();
  const { addToCart, cartItems } = useCart(); 
  const { user } = useAuth(); 
  
  const totalItems = cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0);
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);

  const flyX = useSharedValue(0); 
  const flyY = useSharedValue(0);
  const flyScale = useSharedValue(0); 
  const flyOpacity = useSharedValue(0);
  const flyRotation = useSharedValue(0);

  useAndroidNavigationBar(true);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const response = await api.get(`/api/product/${id}`);
        const data: ProductBackend = response.data;
        setProduct({
          id: data.id,
          name: data.title,
          price: data.price,
          description: data.description || "Sem descrição disponível.",
          images: data.imageURL && data.imageURL.length > 0 ? data.imageURL : [],
          stock: data.stock
        });
      } catch (error) {
        Alert.alert("Ops!", "Produto não encontrado.");
        router.back();
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProductDetails();
  }, [id, router]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const slide = Math.ceil(event.nativeEvent.contentOffset.x / event.nativeEvent.layoutMeasurement.width);
    if (slide !== activeSlide) setActiveSlide(slide);
  };

  const getAddressText = () => {
    if (user && !user.isGuest && user.name) {
      return `Enviar para ${user.name.split(' ')[0]}`;
    }
    return 'Enviar para Visitante - Informe seu CEP';
  };

  const flyingStyle = useAnimatedStyle(() => {
    const rotateZ = `${interpolate(flyRotation.value, [0, 1], [0, 360])}deg`;

    return {
      position: 'absolute',
      width: MINIATURE_SIZE,
      height: MINIATURE_SIZE,
      zIndex: 9999,
      top: 0,
      left: 0,
      opacity: flyOpacity.value,
      borderRadius: MINIATURE_SIZE / 2,
      borderWidth: 3,       
      borderColor: '#fff',
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 4.65,
      elevation: 8,
      transform: [
        { translateX: flyX.value },
        { translateY: flyY.value },
        { scale: flyScale.value },
        { rotateZ: rotateZ } 
      ]
    };
  });

  const triggerFlyAnimation = (callback: () => void) => {
    const startX = width / 2 - (MINIATURE_SIZE / 2);
    const startY = height / 2 + 50;
    
    const destX = width - 50; 
    const destY = Platform.OS === 'ios' ? 50 : 25;

    flyX.value = startX;
    flyY.value = startY;
    flyScale.value = 0.3; 
    flyOpacity.value = 1;
    flyRotation.value = 0;

    flyX.value = withTiming(destX, { 
      duration: ANIMATION_DURATION, 
      easing: Easing.bezier(0.33, 1, 0.68, 1) 
    });

    flyY.value = withTiming(destY, { 
      duration: ANIMATION_DURATION, 
      easing: Easing.out(Easing.exp) 
    });
    
    flyScale.value = withSequence(
      withTiming(1.2, { duration: ANIMATION_DURATION * 0.3 }),
      withTiming(0.4, { duration: ANIMATION_DURATION * 0.7 }) 
    );

    flyRotation.value = withTiming(1, { duration: ANIMATION_DURATION });

    flyOpacity.value = withSequence(
      withTiming(1, { duration: ANIMATION_DURATION * 0.8 }),
      withTiming(0, { duration: ANIMATION_DURATION * 0.2 }, (finished) => {
        if (finished) {
          runOnJS(callback)();
        }
      })
    );
  };

  const handleBuy = () => {
    if (!product) return;

    const itemToAdd = {
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.images.length > 0 ? product.images[0] : '', 
      shipping: 0 
    };

    addToCart(itemToAdd);
    router.push('/(aux)/shop/checkout' as any);
  };

  const handleToggleFavorite = async () => {
    setIsFavorite(!isFavorite);
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    triggerFlyAnimation(() => {
      const itemToAdd = {
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        image: product.images.length > 0 ? product.images[0] : '', 
        shipping: 0 
      };

      addToCart(itemToAdd);
    });
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
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.secondary} translucent={false} />
      
      {/* Imagem Animada (Fantasma) */}
      {product.images.length > 0 && (
        <Animated.Image 
          source={{ uri: product.images[0] }} 
          style={flyingStyle} 
          resizeMode="cover"
        />
      )}

      <SafeAreaView style={styles.headerSafeArea}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButtonHeader}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
          </TouchableOpacity>
          
          {/* --- CORREÇÃO AQUI --- */}
          {/* Alterado para '/(tabs)' para evitar erro de tipo */}
          <TouchableOpacity style={styles.searchBarHeader} onPress={() => router.push('/(tabs)' as any)}>
            <MaterialCommunityIcons name="magnify" size={20} color="#999" style={styles.searchIcon} />
            <Text style={styles.searchTextHeader} numberOfLines={1}>Buscar no Mercado Souto</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.cartButtonHeader, { zIndex: 20 }]} 
            onPress={() => router.push('/(aux)/shop/cart' as any)}
          >
            <CartIcon itemCount={totalItems} />
          </TouchableOpacity>

        </View>
        
        <View style={styles.locationBar}>
          <MaterialCommunityIcons name="map-marker-outline" size={14} color="#333" />
          <Text style={styles.locationText}>{getAddressText()}</Text>
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
            {product.images.length > 0 ? (
              <FlatList
                data={product.images}
                keyExtractor={(_, index) => index.toString()}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                renderItem={({ item }) => (
                  <View style={styles.carouselItem}>
                    <Image 
                      source={{ uri: item }} 
                      style={styles.productImage} 
                      resizeMode="contain" 
                    />
                  </View>
                )}
              />
            ) : (
              <MaterialCommunityIcons name="image-off-outline" size={120} color="#ddd" />
            )}
            
            {product.images.length > 1 && (
              <View style={styles.pagination}>
                {product.images.map((_, index) => (
                  <View 
                    key={index} 
                    style={[
                      styles.dot, 
                      activeSlide === index ? styles.activeDot : null
                    ]} 
                  />
                ))}
              </View>
            )}

            <TouchableOpacity onPress={handleToggleFavorite} style={styles.favoriteFloat}>
              <MaterialCommunityIcons 
                name={isFavorite ? "heart" : "heart-outline"} 
                size={26} 
                color={theme.colors.primary} 
              />
            </TouchableOpacity>
          </View>

          <View style={styles.variationContainer}>
            <Text style={styles.variationLabel}>Cor: <Text style={styles.variationValue}>Padrão</Text></Text>
            <View style={styles.variationBox}>
              {product.images.length > 0 ? (
                 <Image source={{ uri: product.images[0] }} style={styles.variationImage} />
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
            <Text style={styles.installments}>em <Text style={styles.greenText}>6x R$ {installmentPrice.toFixed(2).replace('.', ',')} sem juros</Text></Text>
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
            <Text>Quantidade: <Text style={styles.boldText}>1 unidade</Text> ({product.stock || 0} disponíveis)</Text>
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
            <Text style={styles.soldBy}>Vendido por <Text style={styles.sellerName}>LOJA OFICIAL</Text></Text>
            <Text style={styles.sellerSubtitle}>MercadoLíder Platinum | +100mil vendas</Text>
          </View>

        </View>

        <Divider style={styles.divider} />

        <View style={styles.descriptionSection}>
          <Text style={styles.sectionTitle}>Descrição</Text>
          <Text style={styles.descriptionText}>
            {product.description}
          </Text>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#ebebeb' 
  },
  loadingContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  
  headerContent: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 10, 
    paddingBottom: 10, 
    height: 50, 
    zIndex: 100 
  }, 
  headerSafeArea: { 
    backgroundColor: theme.colors.secondary, 
    paddingTop: Platform.OS === 'android' ? 10 : 0 
  },
  backButtonHeader: { 
    marginRight: 10 
  },
  searchBarHeader: { 
    flex: 1, 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#fff', 
    height: 35, 
    borderRadius: 20, 
    paddingHorizontal: 10, 
    elevation: 2 
  },
  searchIcon: {
    marginLeft: 8
  },
  searchTextHeader: { 
    color: '#999', 
    marginLeft: 5, 
    fontSize: 14 
  },
  cartButtonHeader: { 
    marginLeft: 10, 
    justifyContent: 'center',
    alignItems: 'center'
  },
  locationBar: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 15, 
    paddingBottom: 8 
  },
  locationText: { 
    fontSize: 12, 
    color: '#333', 
    marginLeft: 5 
  },

  scrollContent: { 
    paddingBottom: 20 
  },
  whiteContainer: { 
    backgroundColor: '#fff', 
    padding: 15, 
    marginBottom: 10 
  },

  topInfo: { 
    marginBottom: 10 
  },
  conditionText: { 
    fontSize: 12, 
    color: '#999', 
    marginBottom: 5 
  },
  titleRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between' 
  },
  title: { 
    fontSize: 16, 
    color: '#333', 
    lineHeight: 22, 
    flex: 1 
  },
  ratingContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginTop: 5 
  },
  ratingText: { 
    color: '#999', 
    fontSize: 12, 
    marginLeft: 5 
  },

  imageContainer: { 
    width: '100%', 
    height: 320, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 20 
  },
  carouselItem: {
    width: CAROUSEL_WIDTH, 
    height: 300, 
    justifyContent: 'center', 
    alignItems: 'center'
  },
  productImage: { 
    width: '100%', 
    height: '100%' 
  },
  favoriteFloat: { 
    position: 'absolute', 
    top: 0, 
    right: 0, 
    backgroundColor: '#fff', 
    padding: 8, 
    borderRadius: 30, 
    elevation: 3, 
    shadowColor: '#000', 
    shadowOpacity: 0.1,
    zIndex: 10
  },
  pagination: { 
    flexDirection: 'row', 
    position: 'absolute', 
    bottom: 5 
  },
  dot: { 
    width: 7, 
    height: 7, 
    borderRadius: 3.5, 
    backgroundColor: '#ddd', 
    marginHorizontal: 3 
  },
  activeDot: { 
    backgroundColor: theme.colors.primary 
  },

  variationContainer: { 
    marginBottom: 20 
  },
  variationLabel: { 
    fontSize: 14, 
    color: '#333' 
  },
  variationValue: { 
    fontWeight: 'bold' 
  },
  variationBox: { 
    marginTop: 8, 
    borderWidth: 2, 
    borderColor: theme.colors.primary, 
    borderRadius: 6, 
    width: 46, 
    height: 46, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  variationImage: {
    width: 40, 
    height: 40, 
    borderRadius: 4
  },

  priceContainer: { 
    marginBottom: 20 
  },
  oldPrice: { 
    fontSize: 14, 
    color: '#999', 
    textDecorationLine: 'line-through' 
  },
  currentPriceRow: { 
    flexDirection: 'row', 
    alignItems: 'flex-start' 
  },
  currency: { 
    fontSize: 20, 
    color: '#333', 
    marginTop: 4 
  },
  price: { 
    fontSize: 36, 
    fontWeight: '300', 
    color: '#333', 
    marginHorizontal: 2 
  },
  cents: { 
    fontSize: 18, 
    color: '#333', 
    marginTop: 4 
  },
  discount: { 
    fontSize: 16, 
    color: '#00a650', 
    fontWeight: 'bold', 
    marginTop: 8, 
    marginLeft: 8 
  },
  installments: { 
    fontSize: 14, 
    color: '#333', 
    marginTop: 5 
  },
  greenText: {
    color: '#00a650'
  },
  paymentMethods: { 
    fontSize: 14, 
    color: theme.colors.primary, 
    marginTop: 5, 
    fontWeight: '500' 
  },

  benefitsContainer: { 
    marginTop: 10 
  },
  benefitRow: { 
    flexDirection: 'row', 
    marginBottom: 15 
  },
  benefitTextCol: { 
    marginLeft: 10, 
    flex: 1 
  },
  benefitTitle: { 
    color: '#00a650', 
    fontWeight: 'bold', 
    fontSize: 14 
  },
  benefitSubtitle: { 
    color: '#999', 
    fontSize: 13, 
    marginTop: 2 
  },
  fullRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginTop: 2 
  },
  fullText: { 
    color: '#00a650', 
    fontWeight: '900', 
    fontStyle: 'italic', 
    fontSize: 12, 
    marginLeft: 2 
  },
  fullDesc: { 
    color: '#999', 
    fontSize: 12, 
    marginLeft: 5, 
    fontStyle: 'italic' 
  },

  stockText: { 
    fontWeight: 'bold', 
    fontSize: 14, 
    color: '#333', 
    marginBottom: 10 
  },
  quantityContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    backgroundColor: '#f5f5f5', 
    padding: 12, 
    borderRadius: 6, 
    marginBottom: 20 
  },
  boldText: {
    fontWeight: 'bold'
  },

  actionsContainer: { 
    gap: 10 
  },
  buyButton: { 
    backgroundColor: '#3483fa', 
    paddingVertical: 14, 
    borderRadius: 6, 
    alignItems: 'center' 
  },
  buyButtonText: { 
    color: '#fff', 
    fontSize: 16, 
    fontWeight: 'bold' 
  },
  cartButton: { 
    backgroundColor: 'rgba(65, 137, 230, 0.2)', 
    paddingVertical: 14, 
    borderRadius: 6, 
    alignItems: 'center' 
  },
  cartButtonText: { 
    color: '#3483fa', 
    fontSize: 16, 
    fontWeight: 'bold' 
  },

 
  sellerSection: { 
    marginTop: 20, 
    marginBottom: 10 
  },
  soldBy: { 
    fontSize: 14, 
    color: '#666' 
  },
  sellerName: {
    color: theme.colors.primary
  },
  sellerSubtitle: { 
    fontSize: 12, 
    color: '#999', 
    marginTop: 2 
  },

  divider: { 
    height: 1, 
    backgroundColor: '#eee' 
  },
  descriptionSection: { 
    backgroundColor: '#fff', 
    padding: 15 
  },
  sectionTitle: { 
    fontSize: 18, 
    color: '#333', 
    marginBottom: 10 
  },
  descriptionText: { 
    fontSize: 14, 
    color: '#666', 
    lineHeight: 20 
  },
  bottomSpacer: {
    height: 40
  }
});