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
          height: Platform.OS === 'android' ? 65 : 90,
          paddingBottom: Platform.OS === 'android' ? 10 : 30,
          paddingTop: 8,
          overflow: 'visible', 
          position: 'absolute', 
          elevation: 0, 
        },
        
        tabBarLabelStyle: {
          fontSize: 12, 
          fontWeight: '600',
          marginBottom: 0,
        },
        
        tabBarIconStyle: { 
            marginTop: 2 
        },
      }}
    >

      {/* 1. INÍCIO */}
      <Tabs.Screen
        name="index" 
        options={{
          title: 'Início',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="home-outline" size={30} color={color} />
          ),
          tabBarLabelStyle: { 
            fontSize: 12, 
            fontWeight: 'bold',
          }
        }}
      />

      {/* 2. CATEGORIAS */}
      <Tabs.Screen
        name="categories"
        options={{
          title: 'Categorias',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="format-list-bulleted" size={30} color={color} />
          ),
          tabBarLabelStyle: { 
            fontSize: 12, 
            fontWeight: 'bold', 
          }
        }}
      />

      {/* 3. FAVORITOS */}
      <Tabs.Screen
        name="favorites"
        options={{
          title: 'Favoritos',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="heart-outline" size={30} color={color} />
          ),
          tabBarLabelStyle: { 
            fontSize: 12, 
            fontWeight: 'bold', 
          }
        }}
      />


      {/* 4. MAIS */}
      <Tabs.Screen
        name="menu"
        options={{
          title: 'Mais',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="menu" size={30} color={color} />
          ),
          tabBarLabelStyle: { 
            fontSize: 12, 
            fontWeight: 'bold', 
          }
        }}
      />


    </Tabs>
  );
}

const styles = StyleSheet.create({
});