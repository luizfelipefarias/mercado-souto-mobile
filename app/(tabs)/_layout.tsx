import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Platform, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../../src/constants/theme';

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: '#999',
        
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 0,
          
          height: 100 + insets.bottom , 
          
          paddingBottom: insets.bottom > 0 ? insets.bottom : 10,
          
          paddingTop: 0.1,
          
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.08,
          shadowRadius: 5,
        },
        
        tabBarLabelStyle: {
          fontSize: 15, 
          fontWeight: '300',
          marginTop: 2,
        },
      }}
    >

      {/* 1. INÍCIO */}
      <Tabs.Screen
        name="index" 
        options={{
          title: 'Início',
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons 
              name={focused ? "home" : "home-outline"} 
              size={30} 
              color={color} 
            />
          ),
        }}
      />

      {/* 2. CATEGORIAS */}
      <Tabs.Screen
        name="categories"
        options={{
          title: 'Categorias',
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons 
              name={focused ? "view-grid" : "view-grid-outline"} 
              size={30} 
              color={color} 
            />
          ),
        }}
      />

      {/* 3. FAVORITOS */}
      <Tabs.Screen
        name="favorites"
        options={{
          title: 'Favoritos',
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons 
              name={focused ? "heart" : "heart-outline"} 
              size={30} 
              color={color} 
            />
          ),
        }}
      />

      {/* 4. MAIS */}
      <Tabs.Screen
        name="menu"
        options={{
          title: 'Mais',
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons 
              name={focused ? "menu" : "menu"} 
              size={30} 
              color={color} 
            />
          ),
        }}
      />

    </Tabs>
  );
}
