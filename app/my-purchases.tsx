import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as NavigationBar from 'expo-navigation-bar';
import React, { useEffect } from 'react';
import {
  FlatList,
  Image,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { Text } from 'react-native-paper';
import { theme } from '../constants/theme';
import { useAndroidNavigationBar } from '../hooks/useAndroidNavigationBar';

const MOCK_PURCHASES = [
  {
    id: 101,
    date: '10 de nov.',
    status: 'Entregue',
    product: 'Kit 3 Camisetas Básicas',
    image: 'https://http2.mlstatic.com/D_NQ_NP_965033-MLB72634426749_112023-O.webp',
  },
  {
    id: 102,
    date: '25 de out.',
    status: 'Entregue',
    product: 'Suporte para Notebook',
    image: 'https://http2.mlstatic.com/D_NQ_NP_821636-MLA46604993138_072021-O.webp',
  },
];

export default function MyPurchases() {
  const router = useRouter();
  useAndroidNavigationBar(true);
  useEffect(() => {
    if (Platform.OS === 'android') {
      NavigationBar.setVisibilityAsync('hidden');
      NavigationBar.setBehaviorAsync('overlay-swipe');
    }

    return () => {
      if (Platform.OS === 'android') {
        NavigationBar.setVisibilityAsync('visible');
      }
    };
  }, []);

  const renderItem = ({ item }: any) => (
    <TouchableOpacity style={styles.card}>
      <View style={styles.dateRow}>
        <Text style={styles.dateText}>{item.date}</Text>
      </View>

      <View style={styles.productRow}>
        <Image source={{ uri: item.image }} style={styles.image} />

        <View style={styles.info}>
          <Text style={styles.status}>{item.status}</Text>
          <Text style={styles.name}>{item.product}</Text>

          <TouchableOpacity style={styles.buyAgainBtn}>
            <Text style={styles.buyAgainText}>Comprar novamente</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.secondary} />

      <SafeAreaView style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
          </TouchableOpacity>

          <Text style={styles.title}>Minhas Compras</Text>

          <MaterialCommunityIcons name="magnify" size={24} color="#333" />
        </View>
      </SafeAreaView>

      <FlatList
        data={MOCK_PURCHASES}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 15 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },

  header: {
    backgroundColor: theme.colors.secondary,
    paddingTop: Platform.OS === 'android' ? 30 : 0,
  },

  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
  },

  title: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 6,
    padding: 15,
    marginBottom: 15,
    elevation: 1,
  },

  dateRow: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 10,
    marginBottom: 10,
  },

  dateText: {
    fontWeight: 'bold',
    color: '#333',
  },

  productRow: {
    flexDirection: 'row',
  },

  image: {
    width: 60,
    height: 60,
    borderRadius: 4,
    marginRight: 15,
    backgroundColor: '#eee',
  },

  info: {
    flex: 1,
  },

  status: {
    color: '#00a650',
    fontWeight: 'bold',
    marginBottom: 2,
  },

  name: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },

  buyAgainBtn: {
    backgroundColor: '#e3edfb',
    padding: 8,
    borderRadius: 4,
    alignItems: 'center',
    alignSelf: 'flex-start',
  },

  buyAgainText: {
    color: theme.colors.primary,
    fontWeight: 'bold',
    fontSize: 12,
  },
});
