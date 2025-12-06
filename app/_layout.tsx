import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { PaperProvider } from 'react-native-paper'; 
import { AuthProvider, useAuth } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import { theme } from '../constants/theme';

function RootNavigation() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    
    const currentSegment = segments[0] as string; 
    

    const inAuthGroup = currentSegment === '(auth)';
    
    if (user && inAuthGroup) {

      router.replace('/(tabs)/home'); 
    } else if (!user && currentSegment !== '(auth)' && currentSegment !== 'index') {

      router.replace('/');
    }
  }, [user, loading, segments, router]);

  return (
    <Stack screenOptions={{ headerShown: false }}>

      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="product/[id]" />

      <Stack.Screen 
        name="(aux)/cart" 
        options={{ presentation: 'modal', animation: 'slide_from_bottom' }} 
      />
      <Stack.Screen name="(aux)/checkout" />
      <Stack.Screen 
        name="(aux)/search" 
        options={{ animation: 'fade' }} 
      />
      <Stack.Screen name="(aux)/search-results" />

    
      <Stack.Screen name="address/index" />
      <Stack.Screen name="address/form" />
      <Stack.Screen name="order/[id]" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <CartProvider>
        <PaperProvider theme={theme}>
          <RootNavigation />
        </PaperProvider>
      </CartProvider>
    </AuthProvider>
  );
}