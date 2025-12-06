import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../../constants/theme';
import api from '../../services/api';

type Category = {
  id: number;
  name: string;
  icon?: string;
};

export default function Categories() {
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function fetchCategories() {
      try {
        const response = await api.get('/api/categories');
        if (mounted) setCategories(response.data);
      } catch (error) {
        console.log('Erro ao buscar categorias:', error);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchCategories();

    return () => {
      mounted = false;
    };
  }, []);

  const handleSelectCategory = useCallback(
    (name: string) => {
      router.push({
        pathname: '/search-results',
        params: { q: name },
      });
    },
    [router], 
  );

  const renderItem = useCallback(
    ({ item }: { item: Category }) => (
      <TouchableOpacity
        style={styles.item}
        onPress={() => handleSelectCategory(item.name)}
        activeOpacity={0.7}
      >
        <MaterialCommunityIcons
          name={(item.icon as any) || 'shape-outline'}
          size={30}
          color={theme.colors.primary}
        />

        <Text style={styles.label}>{item.name}</Text>

        <MaterialCommunityIcons name="chevron-right" size={20} color="#ccc" />
      </TouchableOpacity>
    ),
    [handleSelectCategory], 
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons name="close" size={24} color="#333" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Categorias</Text>

        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <ActivityIndicator
          style={{ marginTop: 50 }}
          color={theme.colors.primary}
          size="large"
        />
      ) : (
        <FlatList
          data={categories}
          renderItem={renderItem}
          keyExtractor={item => String(item.id)}
          contentContainerStyle={{ padding: 15 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={{ textAlign: 'center', marginTop: 20 }}>
              Nenhuma categoria encontrada.
            </Text>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? 30 : 0,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: theme.colors.secondary,
    alignItems: 'center',
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: '500',
  },

  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderColor: '#f0f0f0',
  },

  label: {
    flex: 1,
    marginLeft: 20,
    fontSize: 16,
    color: '#333',
  },
});
