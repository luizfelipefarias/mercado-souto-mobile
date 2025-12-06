import React, { useCallback, useMemo, useState } from 'react';
import {
  Platform,
  SafeAreaView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Text } from 'react-native-paper';

const TRENDING_TERMS = ['Notebook', 'iPhone 15', 'Tênis Nike', 'Ventilador'];

export default function Search() {
  const router = useRouter();
  const [query, setQuery] = useState('');

  const isValidQuery = useMemo(() => query.trim().length > 0, [query]);

  const handleSearch = useCallback(
    (value?: string) => {
      const searchValue = value ?? query;

      if (!searchValue.trim()) return;

      router.push({
        pathname: '/search-results',
        params: { q: searchValue.trim() },
      });
    },
    [query, router]
  );

  const handleClear = useCallback(() => {
    setQuery('');
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#666" />
        </TouchableOpacity>

        <View style={styles.inputContainer}>
          <MaterialCommunityIcons
            name="magnify"
            size={20}
            color="#999"
            style={{ marginLeft: 10 }}
          />

          <TextInput
            placeholder="Buscar no Mercado Souto"
            autoFocus
            style={styles.input}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={() => handleSearch()}
            returnKeyType="search"
          />

          {isValidQuery && (
            <TouchableOpacity onPress={handleClear}>
              <MaterialCommunityIcons
                name="close-circle"
                size={18}
                color="#ccc"
                style={{ marginRight: 10 }}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.trendingContainer}>
        <Text style={styles.trendingTitle}>Tendências</Text>

        <View style={styles.trendingList}>
          {TRENDING_TERMS.map(term => (
            <TouchableOpacity
              key={term}
              style={styles.trendButton}
              onPress={() => {
                setQuery(term);
                handleSearch(term);
              }}
            >
              <Text style={styles.trendTag}>{term}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
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
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#eee',
  },

  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    marginLeft: 10,
    height: 40,
  },

  input: {
    flex: 1,
    marginLeft: 5,
    fontSize: 16,
    color: '#333',
  },

  trendingContainer: {
    padding: 20,
  },

  trendingTitle: {
    color: '#999',
    fontSize: 14,
  },

  trendingList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },

  trendButton: {
    marginRight: 10,
    marginBottom: 10,
  },

  trendTag: {
    color: '#3483fa',
    fontSize: 16,
  },
});
