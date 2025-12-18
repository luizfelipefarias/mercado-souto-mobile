import React, { useState, useCallback } from 'react';
import { 
    View, 
    FlatList, 
    StyleSheet, 
    TouchableOpacity, 
    Platform, 
    ActivityIndicator, 
    Alert,
    StatusBar 
} from 'react-native';
import { Text, FAB } from 'react-native-paper';
import { useRouter, useFocusEffect } from 'expo-router';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context'; 

import { theme } from '../../../../src/constants/theme';
import { useAuth } from '../../../../src/context/AuthContext';
import api from '../../../../src/services/api';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage'; 

const GUEST_ADDRESS_KEY = '@guest_addresses';
const SELECTED_ADDRESS_KEY = '@selected_address_id'; 

interface AddressDisplay {
  id: number;
  cep: string;
  street: string;
  number: string;
  complement?: string;
  additionalInfo?: string;
  home: boolean;
}

export default function AddressList() {
  const router = useRouter();
  const { user, isGuest } = useAuth(); 

  const [addresses, setAddresses] = useState<AddressDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null); 

  const fetchAddresses = useCallback(async (currentSelectedId: number | null) => {
    setLoading(true);
    let fetchedAddresses: AddressDisplay[] = [];

    if (isGuest) {
      try {
        const storedAddresses = await AsyncStorage.getItem(GUEST_ADDRESS_KEY);
        fetchedAddresses = storedAddresses ? JSON.parse(storedAddresses) : [];
      } catch (e) {
        console.error("Erro ao carregar endereços do AsyncStorage:", e);
      }
    } else {
      const userId = user?.id;
      if (userId) {
        try {
          const response = await api.get(`/api/address/by-client/${userId}`);
          fetchedAddresses = Array.isArray(response.data) 
            ? response.data.map((addr: any) => ({
                 ...addr,
                 additionalInfo: addr.additionalInfo || addr.neighborhood || '' 
              }))
            : [];
        } catch (error) {
          console.log('Erro ao buscar endereços API:', error);
        }
      }
    }
    
    setAddresses(fetchedAddresses);

    const isIdValid = fetchedAddresses.some(addr => addr.id === currentSelectedId);
    if (!currentSelectedId || !isIdValid) {
        if (fetchedAddresses.length > 0) {
            handleSelectAddress(fetchedAddresses[0].id);
        }
    }
    setLoading(false);
  }, [user, isGuest]);

  useFocusEffect(
    useCallback(() => {
        let currentSelectedId: number | null = null;
        AsyncStorage.getItem(SELECTED_ADDRESS_KEY).then(id => {
            if (id) {
                currentSelectedId = Number(id);
                setSelectedAddressId(currentSelectedId);
            } else {
                setSelectedAddressId(null);
            }
            fetchAddresses(currentSelectedId);
        });
    }, [fetchAddresses])
  );
  
  const handleSelectAddress = async (id: number) => {
      setSelectedAddressId(id);
      await AsyncStorage.setItem(SELECTED_ADDRESS_KEY, id.toString());
      Toast.show({ type: 'info', text1: 'Endereço de entrega selecionado.' });
  };

  const handleNavigateToForm = (address?: AddressDisplay) => {
      router.push({
          pathname: '/(aux)/account/address/form', 
          params: address ? { address: JSON.stringify(address) } : undefined
      } as any);
  };

  const handleRemove = async (id: number) => {
    const performRemoval = async () => {
        if (isGuest) {
            try {
                const storedAddresses = await AsyncStorage.getItem(GUEST_ADDRESS_KEY);
                if (storedAddresses) {
                    let currentAddresses: AddressDisplay[] = JSON.parse(storedAddresses);
                    const updatedAddresses = currentAddresses.filter(addr => addr.id !== id);
                    await AsyncStorage.setItem(GUEST_ADDRESS_KEY, JSON.stringify(updatedAddresses));
                    Toast.show({ type: 'success', text1: 'Endereço removido (Local).' });
                    
                    if (selectedAddressId === id) {
                        setSelectedAddressId(null);
                        await AsyncStorage.removeItem(SELECTED_ADDRESS_KEY);
                    }
                    fetchAddresses(null);
                }
            } catch (e) {
                Toast.show({ type: 'error', text1: 'Erro ao remover localmente.' });
            }
        } else {
            try {
                await api.delete(`/api/address/${id}`);
                Toast.show({ type: 'success', text1: 'Endereço removido.' });
                if (selectedAddressId === id) {
                    setSelectedAddressId(null);
                    await AsyncStorage.removeItem(SELECTED_ADDRESS_KEY);
                }
                fetchAddresses(null);
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
    } else {
        if (window.confirm("Tem certeza que deseja remover este endereço?")) {
            performRemoval();
        }
    }
  };

  const renderItem = ({ item }: { item: AddressDisplay }) => {
    const isSelected = item.id === selectedAddressId;

    return (
        <TouchableOpacity 
            onPress={() => handleSelectAddress(item.id)} 
            style={[styles.card, isSelected && styles.selectedCard]}
            activeOpacity={0.8}
        >
          <View style={styles.cardContent}>
            <View style={styles.iconColumn}>
              <MaterialCommunityIcons 
                  name={isSelected ? "check-circle" : "map-marker-outline"} 
                  size={28} 
                  color={isSelected ? theme.colors.primary : '#999'} 
              />
            </View>

            <View style={styles.infoColumn}>
              <Text style={styles.label}>
                {item.street || 'Rua sem nome'}, {item.number}
              </Text>
              <Text style={styles.text}>
                {item.additionalInfo ? `${item.additionalInfo}` : 'Bairro/Região'}
              </Text>
              <Text style={styles.zip}>CEP: {item.cep}</Text>
            </View>
            
            {/* BOTÃO EDITAR */}
            <TouchableOpacity style={styles.actionButton} onPress={() => handleNavigateToForm(item)}>
                 <MaterialCommunityIcons name="pencil-outline" size={22} color={theme.colors.primary} />
            </TouchableOpacity>

            {/* BOTÃO REMOVER */}
            <TouchableOpacity style={styles.actionButton} onPress={() => handleRemove(item.id)}>
                 <Ionicons name="trash-outline" size={22} color="#999" />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.secondary} />

      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)')} 
          style={{ padding: 5 }}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Meus endereços</Text>

        <View style={{ width: 34 }} />
      </View>

      <View style={styles.container}>
        {loading ? (
            <ActivityIndicator style={{ marginTop: 50 }} color={theme.colors.primary} size="large" />
        ) : (
            <FlatList
            data={addresses}
            renderItem={renderItem}
            keyExtractor={(item: any) => item.id ? item.id.toString() : Math.random().toString()}
            contentContainerStyle={{ padding: 15, paddingBottom: 80 }}
            ListEmptyComponent={
                <View style={styles.emptyContainer}>
                    <MaterialCommunityIcons name="map-marker-off-outline" size={48} color="#ccc" />
                    <Text style={styles.emptyText}>Nenhum endereço cadastrado.</Text>
                    <Text style={{color: '#999', marginTop: 10, textAlign:'center'}}>
                        {isGuest 
                            ? "Endereços salvos localmente para esta sessão." 
                            : "Adicione um endereço para agilizar suas compras."}
                    </Text>
                </View>
            }
            />
        )}
      </View>

      <FAB
          style={styles.fab}
          icon="plus"
          color="#fff"
          label={addresses.length === 0 ? "Adicionar Endereço" : ""}
          onPress={() => handleNavigateToForm()}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { 
      flex: 1, 
      backgroundColor: theme.colors.secondary 
  },
  container: { 
      flex: 1, 
      backgroundColor: '#f5f5f5' 
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: theme.colors.secondary,
    elevation: 2, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  headerTitle: { fontSize: 18, fontWeight: '500', color: '#333' },
  card: {
    backgroundColor: '#fff',
    marginBottom: 15,
    borderRadius: 8,
    elevation: 1,
    borderWidth: 1, 
    borderColor: 'transparent',
  },
  selectedCard: {
      borderColor: theme.colors.primary,
      backgroundColor: '#f9fcff', 
  },
  cardContent: { flexDirection: 'row', padding: 15, alignItems: 'center' },
  iconColumn: { marginRight: 15 },
  infoColumn: { flex: 1 },
  label: { fontSize: 16, fontWeight: 'bold', marginBottom: 4, color: '#333' },
  text: { color: '#666', fontSize: 14, marginBottom: 2 },
  zip: { color: '#999', fontSize: 12, marginTop: 2 },
  actionButton: { padding: 8, marginLeft: 5 },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.primary,
  },
  emptyContainer: { alignItems: 'center', marginTop: 60, paddingHorizontal: 20 },
  emptyText: { textAlign: 'center', marginTop: 15, color: '#666', fontSize: 16, fontWeight: 'bold' }
});