import React, { useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, SafeAreaView, Platform, ActivityIndicator } from 'react-native';
import { Text, FAB } from 'react-native-paper';
import { useRouter, useFocusEffect } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../../../../src/constants/theme';
import { useAuth } from '../../../../src/context/AuthContext';
import api from '../../../../src/services/api';

export default function AddressList() {
  const router = useRouter();
  const { user } = useAuth();

  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const fetchAddresses = async () => {
        try {
          const userId = (user as any)?.id;
          if (!userId) return;

          // Busca endereços do cliente
          const response = await api.get(`/api/address/by-client/${userId}`);
          
          if (isActive) {
            // Garante que seja sempre um array
            setAddresses(Array.isArray(response.data) ? response.data : []);
          }
        } catch (error) {
          console.log('Erro ao buscar endereços:', error);
        } finally {
          if (isActive) setLoading(false);
        }
      };

      fetchAddresses();

      return () => {
        isActive = false;
      };
    }, [user])
  );

  const handleNavigateToForm = () => {
    router.push('/(aux)/account/address/form' as any);
  };

  const renderItem = ({ item }: any) => (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        <View style={styles.iconColumn}>
          <MaterialCommunityIcons name="map-marker-outline" size={28} color="#999" />
        </View>

        <View style={styles.infoColumn}>
          <Text style={styles.label}>{item.street || 'Rua sem nome'}, {item.number}</Text>
          
          {/* Exibe Bairro (additionalInfo) + Cidade/UF */}
          <Text style={styles.text}>
            {item.additionalInfo ? `${item.additionalInfo} - ` : ''} 
            {item.city}/{item.state}
          </Text>
          
          <Text style={styles.zip}>CEP: {item.cep}</Text>
        </View>
        
        {/* Ícone indicando que é clicável/editável (futuro) */}
        {/* <MaterialCommunityIcons name="chevron-right" size={24} color="#ccc" /> */}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 5 }}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Meus endereços</Text>

        <View style={{ width: 34 }} />
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 50 }} color={theme.colors.primary} size="large" />
      ) : (
        <FlatList
          data={addresses}
          renderItem={renderItem}
          keyExtractor={(item: any) => item.id.toString()}
          contentContainerStyle={{ padding: 15, paddingBottom: 80 }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
                <MaterialCommunityIcons name="map-marker-off-outline" size={48} color="#ccc" />
                <Text style={styles.emptyText}>Nenhum endereço cadastrado.</Text>
            </View>
          }
        />
      )}

      <FAB
        style={styles.fab}
        icon="plus"
        color="#fff"
        label="Adicionar"
        onPress={handleNavigateToForm}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', paddingTop: Platform.OS === 'android' ? 30 : 0 },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: theme.colors.secondary,
    elevation: 2,
  },

  headerTitle: { fontSize: 18, fontWeight: '500', color: '#333' },

  card: {
    backgroundColor: '#fff',
    marginBottom: 15,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden'
  },

  cardContent: { flex: 1, flexDirection: 'row', padding: 15, alignItems: 'center' },
  iconColumn: { marginRight: 15 },
  infoColumn: { flex: 1 },

  label: { fontSize: 16, fontWeight: 'bold', marginBottom: 4, color: '#333' },
  text: { color: '#666', fontSize: 14, marginBottom: 2 },
  zip: { color: '#999', fontSize: 12, marginTop: 2 },

  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.primary,
  },

  emptyContainer: { alignItems: 'center', marginTop: 50 },
  emptyText: { textAlign: 'center', marginTop: 10, color: '#999', fontSize: 16 }
});