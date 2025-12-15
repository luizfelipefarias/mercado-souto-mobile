import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  StatusBar,
  KeyboardAvoidingView,
  ScrollView,
  TextInput as RNTextInput,
  ActivityIndicator
} from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../../../../src/constants/theme';
import api from '../../../../src/services/api';

type Suggestion = {
    id: number;
    title: string;
};

export default function Search() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  
  const inputRef = useRef<RNTextInput>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
      if (searchTerm.length < 2) {
          setSuggestions([]);
          setLoadingSuggestions(false);
          return;
      }

      const delayDebounceFn = setTimeout(async () => {
          setLoadingSuggestions(true);
          try {
              const response = await api.get('/api/product');
              
              if (Array.isArray(response.data)) {
                  const filtered = response.data
                      .filter((item: any) => 
                          item.title.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .slice(0, 5)
                      .map((item: any) => ({ id: item.id, title: item.title }));
                  
                  setSuggestions(filtered);
              }
          } catch (error) {
              console.log("Erro na busca:", error);
          } finally {
              setLoadingSuggestions(false);
          }
      }, 500);

      return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const performSearch = (term: string) => {
    if (term.trim().length === 0) return;
    
    router.push({
      pathname: '/(aux)/misc/search-results',
      params: { q: term.trim() }
    } as any);
  };

  const handleClear = () => {
      setSearchTerm('');
      setSuggestions([]);
      inputRef.current?.focus();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.secondary} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>

        <View style={styles.searchBox}>
          <MaterialCommunityIcons name="magnify" size={22} color="#999" />
          
          <RNTextInput
            ref={inputRef}
            style={styles.input}
            placeholder="Buscar no Mercado Souto"
            placeholderTextColor="#999"
            value={searchTerm}
            onChangeText={setSearchTerm}
            onSubmitEditing={() => performSearch(searchTerm)}
            returnKeyType="search"
            autoCorrect={false}
          />
          
          {searchTerm.length > 0 && (
              <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
                  <MaterialCommunityIcons name="close" size={20} color="#999" />
              </TouchableOpacity>
          )}

        </View>
        
        <TouchableOpacity style={styles.cartButton} onPress={() => router.push('/(aux)/shop/cart' as any)}>
             <MaterialCommunityIcons name="cart-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          
          {/* 🟢 LISTA DE SUGESTÕES DA API */}
          {searchTerm.length > 0 && (
              <>
                {loadingSuggestions ? (
                    <ActivityIndicator color={theme.colors.primary} style={{ marginTop: 20 }} />
                ) : (
                    suggestions.map((item) => (
                        <TouchableOpacity 
                            key={item.id} 
                            style={styles.suggestionItem} 
                            onPress={() => performSearch(item.title)}
                        >
                            <MaterialCommunityIcons name="magnify" size={20} color="#999" />
                            <Text style={styles.suggestionText} numberOfLines={1}>
                                {item.title}
                            </Text>
                            <MaterialCommunityIcons name="arrow-top-left" size={20} color="#ccc" style={{ marginLeft: 'auto' }} />
                        </TouchableOpacity>
                    ))
                )}
                
                {/* Se digitou e não achou nada */}
                {!loadingSuggestions && suggestions.length === 0 && searchTerm.length > 2 && (
                     <View style={{ padding: 20, alignItems: 'center' }}>
                        <Text style={{ color: '#999' }}>Nenhum resultado encontrado para "{searchTerm}"</Text>
                     </View>
                )}
              </>
          )}

          {/* 🟢 BUSCAS RECENTES (Só aparece se não estiver digitando) */}
          {searchTerm.length === 0 && (
              <>
                <Text style={styles.sectionTitle}>Buscas recentes</Text>
                <TouchableOpacity style={styles.recentItem} onPress={() => performSearch('Notebook')}>
                    <MaterialCommunityIcons name="history" size={20} color="#999" />
                    <Text style={styles.recentText}>Notebook Gamer</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.recentItem} onPress={() => performSearch('TV')}>
                    <MaterialCommunityIcons name="history" size={20} color="#999" />
                    <Text style={styles.recentText}>TV 4K</Text>
                </TouchableOpacity>
              </>
          )}
          
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? 30 : 0
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.secondary,
    paddingHorizontal: 10,
    paddingVertical: 12
  },
  backButton: { padding: 5, marginRight: 8 },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 10,
    height: 40,
    elevation: 2,
  },
  input: {
    flex: 1,
    fontSize: 16,
    marginLeft: 8,
    marginRight: 5,
    paddingVertical: 0, 
  },
  clearButton: { padding: 5 },
  cartButton: { padding: 5, marginLeft: 10 },
  content: { padding: 20 },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 15 },
  
  recentItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 15,
      borderBottomWidth: 1,
      borderBottomColor: '#eee',
      width: '100%'
  },
  recentText: { fontSize: 16, color: '#333', marginLeft: 15 },

  suggestionItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 15,
      borderBottomWidth: 1,
      borderBottomColor: '#f0f0f0',
  },
  suggestionText: {
      fontSize: 16,
      color: '#666',
      marginLeft: 15,
      flex: 1
  }
});