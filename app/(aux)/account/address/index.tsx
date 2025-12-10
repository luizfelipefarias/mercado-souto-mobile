import React, { useState, useCallback, useEffect } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, SafeAreaView, Platform, ActivityIndicator, Alert } from 'react-native';
import { Text, FAB } from 'react-native-paper';
import { useRouter, useFocusEffect } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
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
  // 🔴 Removido city? e state?
}

export default function AddressList() {
  const router = useRouter();
  const { user, isGuest } = useAuth(); 

  const [addresses, setAddresses] = useState<AddressDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null); 

  // 1. Carregar endereço ativo do AsyncStorage na montagem
  // NOTA: Movido para useFocusEffect para melhor sincronização após retorno de form
  
  const fetchAddresses = useCallback(async (currentSelectedId: number | null) => {
    setLoading(true);
    
    // --- 1. Lógica de Carregamento de Endereços (Guest/API) ---

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

    // --- 2. Lógica de Seleção Ativa ---

    // 🟢 Se o ID atual não é válido OU está nulo, e existe um endereço, 
    // tentamos selecionar o primeiro.
    const isIdValid = fetchedAddresses.some(addr => addr.id === currentSelectedId);
    
    if (!currentSelectedId || !isIdValid) {
        if (fetchedAddresses.length > 0) {
            handleSelectAddress(fetchedAddresses[0].id);
        }
    }

    setLoading(false);
  }, [user, isGuest]);

  // 🟢 useFocusEffect: Sincroniza o ID ativo E busca os endereços sempre que a tela entra em foco
  useFocusEffect(
    useCallback(() => {
        let currentSelectedId: number | null = null;

        // 1. LÊ O ENDEREÇO ATIVO SALVO
        AsyncStorage.getItem(SELECTED_ADDRESS_KEY).then(id => {
            if (id) {
                currentSelectedId = Number(id);
                setSelectedAddressId(currentSelectedId);
            } else {
                setSelectedAddressId(null);
            }
            
            // 2. BUSCA A LISTA E TENTA SINCRONIZAR A SELEÇÃO
            fetchAddresses(currentSelectedId);
        });

    }, [fetchAddresses])
  );
  
  // Função para marcar o endereço como ativo
  const handleSelectAddress = async (id: number) => {
      setSelectedAddressId(id);
      // ✅ SALVA O ID ATIVO PARA O CHECKOUT LER
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
    
    // 1. Confirmação do usuário 
    const confirmDelete = Platform.OS === 'web' 
        ? window.confirm("Tem certeza que deseja remover este endereço?")
        : true;

    if (!confirmDelete && Platform.OS === 'web') return;
    
    const performRemoval = async () => {
        if (isGuest) {
            // REMOÇÃO GUEST (ASYNC STORAGE)
            try {
                const storedAddresses = await AsyncStorage.getItem(GUEST_ADDRESS_KEY);
                if (storedAddresses) {
                    let currentAddresses: AddressDisplay[] = JSON.parse(storedAddresses);
                    const updatedAddresses = currentAddresses.filter(addr => addr.id !== id);
                    await AsyncStorage.setItem(GUEST_ADDRESS_KEY, JSON.stringify(updatedAddresses));
                    Toast.show({ type: 'success', text1: 'Endereço removido (Local).' });
                    
                    // Se remover o endereço ativo, desmarca
                    if (selectedAddressId === id) {
                        setSelectedAddressId(null);
                        await AsyncStorage.removeItem(SELECTED_ADDRESS_KEY);
                    }
                    fetchAddresses(null); // Atualiza a lista
                }
            } catch (e) {
                Toast.show({ type: 'error', text1: 'Erro ao remover localmente.' });
            }
        } else {
            // REMOÇÃO LOGADO (API)
            try {
                await api.delete(`/api/address/${id}`);
                Toast.show({ type: 'success', text1: 'Endereço removido.' });
                // Se remover o endereço ativo, desmarca
                if (selectedAddressId === id) {
                    setSelectedAddressId(null);
                    await AsyncStorage.removeItem(SELECTED_ADDRESS_KEY);
                }
                fetchAddresses(null); // Atualiza a lista
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


  const renderItem = ({ item }: { item: AddressDisplay }) => {
    const isSelected = item.id === selectedAddressId;

    return (
        // Clicar no CARD SELECIONA O ENDEREÇO
        <TouchableOpacity 
            onPress={() => handleSelectAddress(item.id)} 
            style={[styles.card, isSelected && styles.selectedCard]}
        >
          <View style={styles.cardContent}>
            <View style={styles.iconColumn}>
              {/* ÍCONE DE SELEÇÃO */}
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
              
              {/* EXIBIÇÃO SIMPLIFICADA: Foca em Bairro (additionalInfo) e CEP */}
              <Text style={styles.text}>
                {item.additionalInfo ? `${item.additionalInfo}` : 'Bairro/Região'}
              </Text>
              
              <Text style={styles.zip}>CEP: {item.cep}</Text>
            </View>
            
            {/* BOTão DE EDIÇÃO */}
            <TouchableOpacity style={styles.editButton} onPress={() => handleNavigateToForm(item)}>
                 <MaterialCommunityIcons name="pencil-outline" size={20} color="#3483fa" />
            </TouchableOpacity>

            {/* Botão de Remover (X) */}
            <TouchableOpacity style={styles.removeButton} onPress={() => handleRemove(item.id)}>
                 <MaterialCommunityIcons name="close" size={20} color="#999" />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        {/* Fallback seguro para router.back() */}
        <TouchableOpacity 
          onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)')} 
          style={{ padding: 5 }}
        >
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

      {/* FAB aparece para todos (Logado ou Guest) */}
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
    overflow: 'hidden',
    borderWidth: 1, 
    borderColor: 'transparent',
  },
  selectedCard: {
      borderColor: theme.colors.primary,
      backgroundColor: '#f0f4f9', 
  },

  cardContent: { flex: 1, flexDirection: 'row', padding: 15, alignItems: 'center' },
  iconColumn: { marginRight: 15 },
  infoColumn: { flex: 1 },

  label: { fontSize: 16, fontWeight: 'bold', marginBottom: 4, color: '#333' },
  text: { color: '#666', fontSize: 14, marginBottom: 2 },
  zip: { color: '#999', fontSize: 12, marginTop: 2 },

  editButton: {
    padding: 5,
    marginLeft: 10,
    marginRight: 0,
  },

  removeButton: {
    padding: 5,
    marginLeft: 5,
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