import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Platform, View, StyleSheet } from 'react-native';
import { theme } from '../../src/constants/theme';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: '#666',
        
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
          height: Platform.OS === 'android' ? 60 : 85,
          paddingBottom: Platform.OS === 'android' ? 10 : 30,
          paddingTop: 8,
          overflow: 'visible', 
          position: 'absolute',
          elevation: 0, 
        },
        
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          marginBottom: 0,
        },
      }}
    >
      {/* 1. INÍCIO */}
      <Tabs.Screen
        name="index" 
        options={{
          title: 'Início',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="home-outline" size={26} color={color} />
          ),
        }}
      />

      {/* 2. CATEGORIAS */}
      <Tabs.Screen
        name="categories"
        options={{
          title: 'Categorias',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="format-list-bulleted" size={26} color={color} />
          ),
        }}
      />

      {/* 3. CARRINHO (BOTÃO FLUTUANTE) */}
      {/* Requer o arquivo app/(tabs)/cart.tsx */}
      <Tabs.Screen
        name="cart"
        options={{
          title: '',
          tabBarIcon: ({ focused }) => (
            <View style={styles.floatingButtonContainer}>
              <View style={[styles.floatingButton, focused && styles.floatingButtonFocused]}>
                <MaterialCommunityIcons name="cart-outline" size={30} color="#FFF" />
              </View>
            </View>
          ),
        }}
      />

      {/* 4. FAVORITOS */}
      <Tabs.Screen
        name="favorites"
        options={{
          title: 'Favoritos',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="heart-outline" size={26} color={color} />
          ),
        }}
      />

      {/* 5. MAIS */}
      <Tabs.Screen
        name="menu"
        options={{
          title: 'Mais',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="menu" size={26} color={color} />
          ),
        }}
      />

      {/* ROTAS OCULTAS */}
      <Tabs.Screen name="my-purchases" options={{ href: null }} />
      <Tabs.Screen name="notifications" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  floatingButtonContainer: {
    top: -20, 
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    elevation: 10,
  },
  floatingButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.primary, 
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    borderWidth: 3,
    borderColor: '#f5f5f5', 
  },
  floatingButtonFocused: {
    backgroundColor: '#2968c8',
  }
});