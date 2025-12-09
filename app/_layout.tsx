import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import Toast from 'react-native-toast-message';
import { theme } from '@/constants/theme'; 

import { AuthProvider, useAuth } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { ProductProvider } from '@/context/ProductContext';
import { UserProvider } from '@/context/UserContext';
import { OrderProvider } from '@/context/OrderContext';

function RootNavigation() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    
    const currentSegment = segments[0] as string; 
    
    const inAuthGroup = currentSegment === '(auth)';
    
    if (user && inAuthGroup) {
      router.replace('/(tabs)'); 
    } 
    
    else if (!user && currentSegment !== '(auth)' && segments.length > 0) {
    }
  }, [user, loading, segments, router]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Telas Principais */}
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />

      {/* --- GRUPO SHOP --- */}
      {/* Modal para o Carrinho */}
      <Stack.Screen 
        name="(aux)/shop/cart/index" 
        options={{ 
          presentation: 'modal', 
          animation: 'slide_from_bottom',
          gestureEnabled: true 
        }} 
      />
      <Stack.Screen name="(aux)/shop/checkout/index" />
      <Stack.Screen name="(aux)/shop/all-products/index" />
      <Stack.Screen name="(aux)/shop/my-purchases/index" />
      <Stack.Screen name="(aux)/shop/history/index" />
      <Stack.Screen name="(aux)/shop/product/[id]" />

      {/* --- GRUPO ACCOUNT --- */}
      <Stack.Screen name="(aux)/account/profile/index" />
      <Stack.Screen name="(aux)/account/wallet/index" />
      
      <Stack.Screen name="(aux)/account/profile/edit" />
      <Stack.Screen name="(aux)/account/profile/security" />
      <Stack.Screen name="(aux)/account/profile/privacy" />
      <Stack.Screen name="(aux)/account/profile/change-password" />

      <Stack.Screen name="(aux)/account/address/index" />
      <Stack.Screen name="(aux)/account/address/form" />

      <Stack.Screen name="(aux)/account/order/[id]" />

      {/* --- GRUPO MISC --- */}
      {/* Animação suave para a busca */}
      <Stack.Screen 
        name="(aux)/misc/search/index" 
        options={{ animation: 'fade' }} 
      />
      <Stack.Screen name="(aux)/misc/search-results/index" />
      <Stack.Screen name="(aux)/misc/help/index" />
      <Stack.Screen name="(aux)/misc/mercado-play/index" />
      <Stack.Screen name="(aux)/misc/review/[id]" />

    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <UserProvider>
        <ProductProvider>
          <CartProvider>
            <OrderProvider>
              <PaperProvider theme={theme}>
                <RootNavigation />
                <Toast />
              </PaperProvider>
            </OrderProvider>
          </CartProvider>
        </ProductProvider>
      </UserProvider>
    </AuthProvider>
  );
}