import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  SafeAreaView,
  Platform,
  StatusBar,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../../../../src/constants/theme';
import api from '../../../../src/services/api';

type Product = {
  id: number;
  title: string;
  price: number;
  imageURL?: string[];
};

export default function History() {
  const router = useRouter();
  const [history, setHistory] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  
  const loadHistory = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/product');

      const data = Array.isArray(response.data) ? response.data.slice(0, 6) : [];
      setHistory(data);
    } catch (error) {
      console.log('Erro ao carregar histórico', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const handleClearHistory = () => {
    Alert.alert(
      'Limpar histórico',
      'Tem certeza que deseja apagar todo o seu histórico de navegação?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Limpar', 
          onPress: () => setHistory([]), 
          style: 'destructive'
        }
      ]
    );
  };

  const renderItem = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.itemCard}
      onPress={() => router.push(`/product/${item.id}` as any)}
      activeOpacity={0.9}
    >
      <Image
        source={{
          uri: item.imageURL?.[0] || 'https://via.placeholder.com/150',
        }}
        style={styles.itemImage}
        resizeMode="contain"
      />
      
      <View style={styles.itemInfo}>
        <Text style={styles.itemTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.itemPrice}>
          R$ {item.price.toFixed(2).replace('.', ',')}
        </Text>
        
        <Text style={styles.viewedDate}>Visto hoje</Text>
      </View>

      <TouchableOpacity onPress={() => {
        setHistory(prev => prev.filter(p => p.id !== item.id));
      }}>
        <MaterialCommunityIcons name="close" size={20} color="#ccc" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.secondary} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>

        <Text style={styles.title}>Histórico</Text>

        {history.length > 0 ? (
          <TouchableOpacity onPress={handleClearHistory}>
            <Text style={styles.clearText}>Limpar</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 40 }} />
        )}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : history.length === 0 ? (
        <View style={styles.center}>
          <MaterialCommunityIcons
            name="clock-outline"
            size={80}
            color="#ddd"
          />
          <Text style={styles.emptyTitle}>Sem histórico por enquanto</Text>
          <Text style={styles.emptyText}>
            Os produtos que você visitar aparecerão aqui.
          </Text>
          <TouchableOpacity 
            style={styles.goHomeBtn}
            onPress={() => router.push('/(tabs)' as any)}
          >
            <Text style={styles.goHomeText}>Ir para o início</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={history}
          keyExtractor={item => String(item.id)}
          contentContainerStyle={styles.listContent}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: Platform.OS === 'android' ? 30 : 0,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: theme.colors.secondary,
    alignItems: 'center',
    elevation: 2,
  },

  backButton: {
    padding: 5,
  },

  title: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
  },

  clearText: {
    fontSize: 14,
    color: '#333',
    fontWeight: 'bold',
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
  },

  emptyText: {
    color: '#999',
    marginTop: 10,
    textAlign: 'center',
    fontSize: 14,
    marginBottom: 30,
  },

  goHomeBtn: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
  },

  goHomeText: {
    color: '#fff',
    fontWeight: 'bold',
  },

  listContent: {
    padding: 10,
  },

  itemCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
    elevation: 1,
  },

  itemImage: {
    width: 70,
    height: 70,
    borderRadius: 4,
    backgroundColor: '#f9f9f9',
  },

  itemInfo: {
    flex: 1,
    marginLeft: 15,
    justifyContent: 'center',
  },

  itemTitle: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },

  itemPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },

  viewedDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
});