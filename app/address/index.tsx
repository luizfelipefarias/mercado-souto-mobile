import React, { useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, SafeAreaView, Platform, ActivityIndicator } from 'react-native';
import { Text, FAB } from 'react-native-paper';
import { useRouter, useFocusEffect } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

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

          const response = await api.get(`/api/address/${userId}`);
          if (isActive) setAddresses(response.data);
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
    router.push('/address/form');
  };

  const renderItem = ({ item }: any) => (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        <View style={styles.iconColumn}>
          <MaterialCommunityIcons name="map-marker-outline" size={28} color="#999" />
        </View>

        <View style={styles.infoColumn}>
          <Text style={styles.label}>Endereço</Text>
          <Text style={styles.text}>{item.street}, {item.number}</Text>
          <Text style={styles.text}>{item.neighborhood} - {item.city}/{item.state}</Text>
          <Text style={styles.zip}>{item.zipCode}</Text>
        </View>
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
        <ActivityIndicator style={{ marginTop: 50 }} color={theme.colors.primary} />
      ) : (
        <FlatList
          data={addresses}
          renderItem={renderItem}
          keyExtractor={(item: any) => item.id.toString()}
          contentContainerStyle={{ padding: 15, paddingBottom: 80 }}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Nenhum endereço cadastrado.</Text>
          }
        />
      )}

      <FAB
        style={styles.fab}
        icon="plus"
        color="#fff"
        label="Adicionar endereço"
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
    backgroundColor: theme.colors.secondary
  },

  headerTitle: { fontSize: 18, fontWeight: '500' },

  card: {
    backgroundColor: '#fff',
    marginBottom: 15,
    borderRadius: 8,
    elevation: 1,
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

  emptyText: { textAlign: 'center', marginTop: 50, color: '#999' }
});
