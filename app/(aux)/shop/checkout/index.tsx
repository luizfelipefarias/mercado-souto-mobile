import React, { useEffect, useMemo, useState } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    SafeAreaView,
    Platform,
    StatusBar,
    ActivityIndicator,
} from 'react-native';
import { Text, RadioButton, Divider } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../../../../src/constants/theme';
import { useCart } from '../../../../src/context/CartContext';
import { useAuth } from '../../../../src/context/AuthContext';
import api from '../../../../src/services/api';
import { Address } from '../../../../src/interfaces'; 
import AsyncStorage from '@react-native-async-storage/async-storage';

const SELECTED_ADDRESS_KEY = '@selected_address_id'; 
const GUEST_ADDRESS_KEY = '@guest_addresses'; // 🟢 Chave para endereços locais

type DisplayAddress = Address & {
    city?: string; // Mantido para exibição se disponível
    state?: string; // Mantido para exibição se disponível
    neighborhood?: string; // Mantido para exibição se disponível
};

export default function Checkout() {
    const router = useRouter();
    const { cartItems, clearCart } = useCart();
    const { user, signed, isGuest } = useAuth(); // 💡 Usando isGuest

    const [paymentMethod, setPaymentMethod] = useState<'pix' | 'card'>('pix');
    const [loading, setLoading] = useState(false);
    const [loadingAddress, setLoadingAddress] = useState(false);
    const [address, setAddress] = useState<DisplayAddress | null>(null);

    // CORREÇÃO 1: Acessar item.price (formato plano)
    const total = useMemo(
        () =>
          cartItems.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0),
        [cartItems]
    );

    useEffect(() => {
        // 🟢 Função unificada para carregar endereços (Local ou API)
        async function fetchAllAddresses() {
            let addresses: Address[] = [];
            
            if (isGuest) {
                // 1. Cenário Guest (Local Storage)
                const stored = await AsyncStorage.getItem(GUEST_ADDRESS_KEY);
                if (stored) {
                    addresses = JSON.parse(stored);
                }
            } else {
                // 2. Cenário Logado (API)
                try {
                    const res = await api.get<Address[]>(`/api/address/by-client/${user?.id}`);
                    addresses = res.data;
                } catch (e) {
                    console.log('Erro ao buscar endereços API:', e);
                }
            }
            return addresses;
        }


        async function loadAddress() {
            setLoadingAddress(true);
            try {
                // 1. Tentar carregar o ID do endereço ativo salvo
                const selectedIdString = await AsyncStorage.getItem(SELECTED_ADDRESS_KEY);
                const selectedId = selectedIdString ? Number(selectedIdString) : null;
                
                // 2. Buscar TODOS os endereços (Guest ou API)
                const allAddresses = await fetchAllAddresses();

                // 3. Encontrar o endereço que está ativo (selecionado)
                let selectedAddress = allAddresses.find(addr => addr.id === selectedId);
                
                // 4. Se o selecionado não existir ou for nulo, usa o primeiro
                if (!selectedAddress && allAddresses.length > 0) {
                    selectedAddress = allAddresses[0];
                    // Opcional: Salvar o primeiro como ativo se não houver seleção prévia
                    await AsyncStorage.setItem(SELECTED_ADDRESS_KEY, selectedAddress.id.toString());
                }

                if (selectedAddress) {
                     // 5. Mapear para DisplayAddress (incluindo dados do ViaCEP salvos no Guest Storage)
                    const displayAddress: DisplayAddress = {
                        ...selectedAddress,
                        // Assumindo que city/state/neighborhood são salvos no storage ou retornados pela API
                        neighborhood: (selectedAddress as any).neighborhood || selectedAddress.additionalInfo || 'Bairro', 
                        city: (selectedAddress as any).city || 'Cidade',
                        state: (selectedAddress as any).state || 'UF',
                    };
                    setAddress(displayAddress);
                } else {
                    setAddress(null);
                }
            } catch (err) {
                console.log('Erro ao carregar endereço:', err);
                setAddress(null);
            } finally {
                setLoadingAddress(false);
            }
        }
        
        // 💡 Chama a função de carregamento quando o componente foca (ou monta)
        // e se estiver logado OU for convidado (para o cenário Guest).
        if (signed || isGuest) {
             loadAddress();
        }

    }, [user, signed, isGuest]);

    const handleFinish = async () => {
        if (!signed || (user as any)?.isGuest) {
            Alert.alert(
                'Login necessário',
                'Você precisa estar logado com uma conta para finalizar a compra.',
                [
                    { text: 'Cancelar', style: 'cancel' },
                    { text: 'Entrar', onPress: () => router.push('/(auth)/login' as any) },
                ]
            );
            return;
        }
        // ... (restante do handleFinish, inalterado)

        if (cartItems.length === 0) {
            Alert.alert('Carrinho vazio', 'Adicione produtos antes de continuar.');
            return;
        }

        if (!address) {
            Alert.alert(
                'Endereço não encontrado',
                'Adicione um endereço de entrega antes de finalizar a compra.',
                [
                    { text: 'Cancelar', style: 'cancel' },
                    { text: 'Adicionar endereço', onPress: () => router.push('/(aux)/account/address' as any) },
                ]
            );
            return;
        }

        setLoading(true);
        try {
            const orderData = {
                clientId: (user as any)?.id,
                items: cartItems.map((item) => ({
                    productId: item.id, 
                    quantity: item.quantity || 1,
                    price: item.price,
                })),
                addressId: address.id,
                total: Number(total.toFixed(2)),
                paymentMethod,
                status: 'PENDING',
            };

            await api.post('/api/orders', orderData);

            clearCart();
            
            Alert.alert('Sucesso!', 'Pedido realizado. Acompanhe o status em Minhas Compras.');
            
            router.replace('/(aux)/shop/my-purchases' as any);
            
        } catch (error: any) {
            console.log('Erro ao finalizar pedido:', error);
            const msg =
                error?.response?.data?.message ||
                error?.message ||
                'Não foi possível finalizar a compra. Tente novamente.';
            Alert.alert('Erro', msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={theme.colors.secondary} />
            <SafeAreaView style={styles.header}>
                <View style={styles.headerContent}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <MaterialCommunityIcons name="close" size={24} color="#333" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Checkout</Text>
                    <View style={{ width: 24 }} />
                </View>
            </SafeAreaView>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Seção de Endereço */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Endereço de entrega</Text>
                    <View style={styles.addressBox}>
                        <MaterialCommunityIcons name="map-marker-outline" size={24} color="#333" />
                        <View style={{ marginLeft: 10, flex: 1 }}>
                            {loadingAddress ? (
                                <ActivityIndicator color={theme.colors.primary} />
                            ) : address ? (
                                <>
                                    <Text style={{ fontWeight: 'bold' }}>{address.street}, {address.number}</Text>
                                    <Text style={{ color: '#666' }}>
                                        {/* 🟢 Renderização simplificada: Bairro (neighborhood/additionalInfo) e CEP */}
                                        {address.cep} - {address.neighborhood || address.additionalInfo || 'Detalhes não informados'}
                                    </Text>
                                    <Text style={{ color: '#666', fontSize: 12 }}>{address.contactName || (user as any)?.name || 'Destinatário'}</Text>
                                    {/* 💡 Se necessário exibir a cidade/UF (que foi salva no storage Guest) */}
                                    {address.city && address.state && (
                                        <Text style={{ color: '#999', fontSize: 12 }}>{address.city} / {address.state}</Text>
                                    )}
                                </>
                            ) : (
                                <>
                                    <Text style={{ fontWeight: 'bold' }}>Nenhum endereço</Text>
                                    <Text style={{ color: '#666' }}>Adicione um endereço para entrega</Text>
                                </>
                            )}
                        </View>
                        
                        <TouchableOpacity onPress={() => router.push('/(aux)/account/address' as any)}>
                            <Text style={styles.link}>Trocar</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Seção de Pagamento */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Como você prefere pagar?</Text>

                    <TouchableOpacity style={styles.paymentOption} onPress={() => setPaymentMethod('pix')}>
                        <RadioButton
                            value="pix"
                            status={paymentMethod === 'pix' ? 'checked' : 'unchecked'}
                            onPress={() => setPaymentMethod('pix')}
                            color="#00a650"
                        />
                        <MaterialCommunityIcons name="qrcode" size={24} color="#00a650" style={{ marginLeft: 10 }} />
                        <View style={{ marginLeft: 10 }}>
                            <Text style={styles.paymentLabel}>Pix (Aprovação imediata)</Text>
                            <Text style={styles.paymentSubLabel}>Use o app do seu banco</Text>
                        </View>
                    </TouchableOpacity>

                    <Divider />

                    <TouchableOpacity style={styles.paymentOption} onPress={() => setPaymentMethod('card')}>
                        <RadioButton
                            value="card"
                            status={paymentMethod === 'card' ? 'checked' : 'unchecked'}
                            onPress={() => setPaymentMethod('card')}
                            color="#00a650"
                        />
                        <MaterialCommunityIcons name="credit-card-outline" size={24} color="#333" style={{ marginLeft: 10 }} />
                        <View style={{ marginLeft: 10 }}>
                            <Text style={styles.paymentLabel}>Cartão de Crédito</Text>
                            <Text style={styles.paymentSubLabel}>Até 12x sem juros</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Resumo */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Resumo</Text>
                    <View style={styles.row}>
                        <Text>Produtos</Text>
                        <Text>R$ {total.toFixed(2).replace('.', ',')}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text>Frete</Text>
                        <Text style={{ color: '#00a650' }}>Grátis</Text>
                    </View>
                    <Divider style={{ marginVertical: 10 }} />
                    <View style={styles.row}>
                        <Text style={styles.totalLabel}>Você paga</Text>
                        <Text style={styles.totalValue}>R$ {total.toFixed(2).replace('.', ',')}</Text>
                    </View>
                </View>
            </ScrollView>

            {/* Botão de Confirmar */}
            <View style={styles.footer}>
                <TouchableOpacity style={styles.payBtn} onPress={handleFinish} disabled={loading}>
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.payText}>Confirmar compra</Text>}
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        backgroundColor: theme.colors.secondary,
        paddingTop: Platform.OS === 'android' ? 30 : 0,
    },
    headerContent: {
        padding: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '500',
    },
    content: {
        padding: 15,
        paddingBottom: 140,
    },
    section: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 15,
        marginBottom: 15,
        elevation: 1,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#333',
    },
    addressBox: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    link: {
        color: '#3483fa',
        fontWeight: 'bold',
        fontSize: 13,
    },
    paymentOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
    },
    paymentLabel: {
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
    },
    paymentSubLabel: {
        fontSize: 12,
        color: '#00a650',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    totalValue: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        padding: 15,
        borderTopWidth: 1,
        borderColor: '#eee',
    },
    payBtn: {
        backgroundColor: theme.colors.primary,
        padding: 15,
        borderRadius: 6,
        alignItems: 'center',
    },
    payText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});