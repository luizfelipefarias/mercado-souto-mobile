import React, { useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, SafeAreaView, Platform, ActivityIndicator, Alert } from 'react-native';
import { Text, FAB } from 'react-native-paper';
import { useRouter, useFocusEffect } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../../../../src/constants/theme';
import { useAuth } from '../../../../src/context/AuthContext';
import api from '../../../../src/services/api';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage'; // 🟢 Importando AsyncStorage

// 🟢 Nova chave para endereços de convidado
const GUEST_ADDRESS_KEY = '@guest_addresses';

interface AddressDisplay {
  id: number;
  cep: string;
  street: string;
  number: string;
  complement?: string;
  additionalInfo?: string;
  home: boolean;
  city?: string;
  state?: string;
}

export default function AddressList() {
  const router = useRouter();
  const { user, isGuest } = useAuth(); 

  const [addresses, setAddresses] = useState<AddressDisplay[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAddresses = useCallback(async () => {
    setLoading(true);
    
    if (isGuest) {
      // 🟢 CENÁRIO 1: USUÁRIO CONVIDADO (ASYNC STORAGE)
      try {
        const storedAddresses = await AsyncStorage.getItem(GUEST_ADDRESS_KEY);
        if (storedAddresses) {
          setAddresses(JSON.parse(storedAddresses));
        } else {
          setAddresses([]);
        }
      } catch (e) {
        console.error("Erro ao carregar endereços do AsyncStorage:", e);
        setAddresses([]);
      } finally {
        setLoading(false);
      }
      return;
    }

    const userId = user?.id;
    if (!userId) {
        setAddresses([]);
        setLoading(false);
        return;
    }

    // 🟢 CENÁRIO 2: USUÁRIO LOGADO (API)
    try {
      const response = await api.get(`/api/address/by-client/${userId}`);
      
      const mappedAddresses: AddressDisplay[] = Array.isArray(response.data) 
        ? response.data.map((addr: any) => ({
            ...addr,
            city: 'São Paulo', 
            state: 'SP',
          }))
        : [];

      setAddresses(mappedAddresses);
    } catch (error) {
      console.log('Erro ao buscar endereços API:', error);
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  }, [user, isGuest]);

  useFocusEffect(
    useCallback(() => {
      fetchAddresses();
    }, [fetchAddresses])
  );

  const handleNavigateToForm = (address?: AddressDisplay) => {
    router.push({
        pathname: '/(aux)/account/address/form',
        params: address ? { address: JSON.stringify(address) } : undefined
    } as any);
  };

  const handleRemove = async (id: number) => {
    
    // 1. Confirmação do usuário (mantida a lógica de Alert)
    const confirmDelete = Platform.OS === 'web' 
        ? window.confirm("Tem certeza que deseja remover este endereço?")
        : true;

    if (!confirmDelete && Platform.OS === 'web') return;
    
    const performRemoval = async () => {
        if (isGuest) {
            // 🟢 REMOÇÃO GUEST (ASYNC STORAGE)
            try {
                const storedAddresses = await AsyncStorage.getItem(GUEST_ADDRESS_KEY);
                if (storedAddresses) {
                    let currentAddresses: AddressDisplay[] = JSON.parse(storedAddresses);
                    const updatedAddresses = currentAddresses.filter(addr => addr.id !== id);
                    await AsyncStorage.setItem(GUEST_ADDRESS_KEY, JSON.stringify(updatedAddresses));
                    Toast.show({ type: 'success', text1: 'Endereço removido (Local).' });
                    fetchAddresses(); 
                }
            } catch (e) {
                Toast.show({ type: 'error', text1: 'Erro ao remover localmente.' });
            }
        } else {
            // 🟢 REMOÇÃO LOGADO (API)
            try {
                await api.delete(`/api/address/${id}`);
                Toast.show({ type: 'success', text1: 'Endereço removido.' });
                fetchAddresses();
            } catch (error) {
                Toast.show({ type: 'error', text1: 'Erro ao remover API.' });
            }
        }
    };


    if (Platform.OS !== 'web') {
        Alert.alert("Remover", "Tem certeza que deseja remover este endereço?", [
            { text: "Cancelar", style: "cancel" },
            { text: "Remover", style: "destructive", onPress: performRemoval }
        ]);
        return;
    }

    if (confirmDelete && Platform.OS === 'web') {
        performRemoval();
    }
  };


  const renderItem = ({ item }: { item: AddressDisplay }) => (
    // 🟢 Tornando o Card clicável para EDIÇÃO
    <TouchableOpacity onPress={() => handleNavigateToForm(item)} style={styles.card}>
      <View style={styles.cardContent}>
        <View style={styles.iconColumn}>
          <MaterialCommunityIcons name="map-marker-outline" size={28} color="#999" />
        </View>

        <View style={styles.infoColumn}>
          <Text style={styles.label}>
            {item.street || 'Rua sem nome'}, {item.number}
          </Text>
          
          <Text style={styles.text}>
            {item.additionalInfo ? `${item.additionalInfo} - ` : ''} 
            {item.city}/{item.state}
          </Text>
          
          <Text style={styles.zip}>CEP: {item.cep}</Text>
        </View>
        
        {/* Botão de Remover (X) */}
        <TouchableOpacity style={styles.removeButton} onPress={() => handleRemove(item.id)}>
             <MaterialCommunityIcons name="close" size={20} color="#999" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
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
          // 💡 Ajuste para garantir que o ID do convidado seja uma string única (ex: timestamp)
          keyExtractor={(item: any) => item.id ? item.id.toString() : Math.random().toString()}
          contentContainerStyle={{ padding: 15, paddingBottom: 80 }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
                <MaterialCommunityIcons name="map-marker-off-outline" size={48} color="#ccc" />
                <Text style={styles.emptyText}>Nenhum endereço cadastrado.</Text>
                
                {isGuest && ( 
                     <Text style={{color: '#999', marginTop: 10}}>Endereços salvos localmente para esta sessão.</Text>
                )}
                {!isGuest && (
                     <Text style={{color: '#999', marginTop: 10}}>Comece adicionando seu primeiro endereço.</Text>
                )}
            </View>
          }
        />
      )}

      {/* 🟢 FAB agora aparece para todos (Logado ou Guest) */}
      <FAB
          style={styles.fab}
          icon="plus"
          color="#fff"
          label="Adicionar"
          onPress={() => handleNavigateToForm()}
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

  removeButton: {
    padding: 5,
    marginLeft: 10,
  },

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