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
} from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../../../../src/constants/theme';

export default function Search() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<RNTextInput>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSearch = useCallback(() => {
    if (searchTerm.trim().length === 0) {
      return;
    }
    
    setLoading(true);
    
    router.push({
      pathname: '/(aux)/misc/search-results/index',
      params: { q: searchTerm.trim() }
    } as any);

    setTimeout(() => {
        setLoading(false);
    }, 500);

  }, [searchTerm, router]);

  const handleClear = () => {
      setSearchTerm('');
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
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            autoCorrect={false}
          />
          
          {searchTerm.length > 0 && (
              <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
                  <MaterialCommunityIcons name="close" size={20} color="#999" />
              </TouchableOpacity>
          )}

        </View>
        
        {/* Botão de Carrinho */}
        <TouchableOpacity style={styles.cartButton} onPress={() => router.push('/(aux)/shop/cart' as any)}>
             <MaterialCommunityIcons name="cart-outline" size={24} color="#333" />
        </TouchableOpacity>

      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          
          <Text style={styles.sectionTitle}>Buscas recentes</Text>
          
          {/* Mock: Exibição de Buscas Recentes */}
          <TouchableOpacity style={styles.recentItem} onPress={() => router.push({pathname: '/(aux)/misc/search-results/index', params: { q: 'Notebook' }} as any)}>
              <MaterialCommunityIcons name="history" size={20} color="#999" />
              <Text style={styles.recentText}>Notebook Gamer</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.recentItem} onPress={() => router.push({pathname: '/(aux)/misc/search-results/index', params: { q: 'TV' }} as any)}>
              <MaterialCommunityIcons name="history" size={20} color="#999" />
              <Text style={styles.recentText}>TV 4K</Text>
          </TouchableOpacity>

          {/* Estado de Loading/Aguardando */}
          {loading && (
              <View style={styles.loadingOverlay}>
                  <ActivityIndicator size="large" color={theme.colors.primary} />
              </View>
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

  backButton: {
    padding: 5,
    marginRight: 8
  },

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
  
  clearButton: {
      padding: 5
  },

  cartButton: {
    padding: 5,
    marginLeft: 10
  },

  content: {
    padding: 20,
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15
  },
  
  recentItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 15,
      borderBottomWidth: 1,
      borderBottomColor: '#eee',
      width: '100%'
  },
  
  recentText: {
      fontSize: 16,
      color: '#333',
      marginLeft: 15
  },
  
  loadingOverlay: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.7)',
      zIndex: 10
  }
});