import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import Toast from 'react-native-toast-message';

import { theme } from '../src/constants/theme'; 
import { HistoryProvider } from '../src/context/HistoryContext'; 
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import { CartProvider } from '../src/context/CartContext';
import { ProductProvider } from '../src/context/ProductContext';
import { UserProvider } from '../src/context/UserContext';
import { OrderProvider } from '../src/context/OrderContext';
import { CategoryProvider } from '@/context/CategoryContext';
import { FavoritesProvider } from '../src/context/FavoritesContext';

function RootNavigation() {
  const { user, loading, isGuest } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    
    const currentSegment = segments[0] as string; 
    const inAuthGroup = currentSegment === '(auth)';
    
    if (user && !isGuest && inAuthGroup) {
      router.replace('/(tabs)'); 
    } 
    
    const isProtectedRoute = !inAuthGroup && currentSegment !== 'index' && currentSegment !== undefined;

    if (!user && !isGuest && isProtectedRoute) {
        router.replace('/(auth)/login');
    }

  }, [user, loading, segments, router, isGuest]);

  return (
    <Stack screenOptions={{ headerShown: false }}>

      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
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
      <Stack.Screen name="(aux)/account/order/[id]" />



      <Stack.Screen name="(aux)/account/profile/index" />
      
      <Stack.Screen name="(aux)/account/profile/edit" />
      <Stack.Screen name="(aux)/account/profile/security" />
      <Stack.Screen name="(aux)/account/profile/privacy" />
      <Stack.Screen name="(aux)/account/profile/change-password" />

      <Stack.Screen name="(aux)/account/address/index" />
      <Stack.Screen name="(aux)/account/address/form" />



      <Stack.Screen 
        name="(aux)/misc/search/index" 
        options={{ animation: 'fade' }} 
      />
      <Stack.Screen name="(aux)/misc/search-results/index" />
      <Stack.Screen name="(aux)/misc/help/index" />


    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <UserProvider>
        <ProductProvider>
          <CategoryProvider>
           <CartProvider>
             <OrderProvider>
               <HistoryProvider>
                <FavoritesProvider>
                   <PaperProvider theme={theme}>
                         <RootNavigation />
                           <Toast />
                         </PaperProvider>
                       </FavoritesProvider>
                    </HistoryProvider>
                 </OrderProvider>
              </CartProvider>
          </CategoryProvider>
        </ProductProvider>
      </UserProvider>
    </AuthProvider>
  );
}