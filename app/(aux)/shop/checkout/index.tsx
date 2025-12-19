import React, { useCallback, useMemo, useState } from 'react';
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
import { Text, Divider, TextInput } from 'react-native-paper';
import { useRouter, useFocusEffect } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../../../../src/constants/theme';
import { useCart } from '../../../../src/context/CartContext';
import { useAuth } from '../../../../src/context/AuthContext';
import api from '../../../../src/services/api';
import { Address } from '../../../../src/interfaces'; 
import AsyncStorage from '@react-native-async-storage/async-storage';

const SELECTED_ADDRESS_KEY = '@selected_address_id'; 
const GUEST_ADDRESS_KEY = '@guest_addresses';

type DisplayAddress = Address & {
    city?: string;
    state?: string;
    neighborhood?: string;
};

export default function Checkout() {
    const router = useRouter();
    const { cartItems, clearCart } = useCart();
    const { user, signed, isGuest } = useAuth();

    const [loading, setLoading] = useState(false);
    const [loadingAddress, setLoadingAddress] = useState(false);
    const [address, setAddress] = useState<DisplayAddress | null>(null);

    const [cardNumber, setCardNumber] = useState('');
    const [cardName, setCardName] = useState('');
    const [cardExpiry, setCardExpiry] = useState('');
    const [cardCVV, setCardCVV] = useState('');

    const total = useMemo(
        () => cartItems.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0),
        [cartItems]
    );

    const handleCardNumberChange = (text: string) => {
        const cleaned = text.replace(/\D/g, '');
        const formatted = cleaned.replace(/(\d{4})(?=\d)/g, '$1 ').substring(0, 19);
        setCardNumber(formatted);
    };

    const handleExpiryChange = (text: string) => {
        const cleaned = text.replace(/\D/g, '');
        if (cleaned.length >= 2) {
            setCardExpiry(`${cleaned.substring(0, 2)}/${cleaned.substring(2, 4)}`);
        } else {
            setCardExpiry(cleaned);
        }
    };

    const loadAddressData = useCallback(async () => {
        if (!signed && !isGuest) return;

        setLoadingAddress(true);
        try {
            const selectedIdString = await AsyncStorage.getItem(SELECTED_ADDRESS_KEY);
            const selectedId = selectedIdString ? Number(selectedIdString) : null;
            
            let allAddresses: Address[] = [];
            
            if (isGuest) {
                const stored = await AsyncStorage.getItem(GUEST_ADDRESS_KEY);
                if (stored) allAddresses = JSON.parse(stored);
            } else {
                const res = await api.get<Address[]>(`/api/address/by-client/${user?.id}`);
                allAddresses = res.data;
            }

            let selectedAddress = allAddresses.find(addr => addr.id === selectedId);
            
            if (!selectedAddress && allAddresses.length > 0) {
                selectedAddress = allAddresses[0];
                await AsyncStorage.setItem(SELECTED_ADDRESS_KEY, selectedAddress.id.toString());
            }

            if (selectedAddress) {
                const displayAddress: DisplayAddress = {
                    ...selectedAddress,
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
    }, [signed, isGuest, user?.id]);

    useFocusEffect(
        useCallback(() => {
            loadAddressData();
        }, [loadAddressData])
    );

    const handleFinish = async () => {
        if (!signed || (user as any)?.isGuest) {
            Alert.alert('Login necessário', 'Você precisa estar logado para finalizar.', [
                { text: 'Entrar', onPress: () => router.push('/(auth)/login' as any) },
                { text: 'Cancelar', style: 'cancel' },
            ]);
            return;
        }

        if (cartItems.length === 0) {
            Alert.alert('Carrinho vazio', 'Adicione produtos antes de continuar.');
            return;
        }

        if (!address) {
            Alert.alert('Endereço', 'Adicione um endereço de entrega.');
            return;
        }

        if (cardNumber.length < 16 || !cardName || cardExpiry.length < 5 || cardCVV.length < 3) {
            Alert.alert('Dados inválidos', 'Por favor, preencha corretamente os dados do cartão.');
            return;
        }

        setLoading(true);
        try {
            const orderPromises = cartItems.map(item => {
                const quantity = item.quantity || 1;
                return api.post(
                    `/api/order/product/${item.id}/address/${address.id}`, 
                    { quantity: quantity }
                );
            });

            await Promise.all(orderPromises);
            
            console.log("Pedidos realizados com sucesso");
            
            clearCart();
            
            if (router.canDismiss()) router.dismissAll(); 
            router.replace('/(aux)/shop/my-purchases' as any);
            
            setTimeout(() => {
                 Alert.alert('Sucesso!', 'Compra realizada com sucesso!');
            }, 500);
            
        } catch (error: any) {
            console.log('Erro ao finalizar:', error);
            const msg = error?.response?.data?.message || 'Erro ao processar pedido. Tente novamente.';
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
                    <Text style={styles.headerTitle}>Checkout Seguro</Text>
                    <View style={{ width: 24 }} />
                </View>
            </SafeAreaView>

            <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
                {/* Endereço */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Entregar em</Text>
                    <View style={styles.addressBox}>
                        <MaterialCommunityIcons name="map-marker-outline" size={24} color="#333" />
                        <View style={{ marginLeft: 10, flex: 1 }}>
                            {loadingAddress ? (
                                <ActivityIndicator color={theme.colors.primary} />
                            ) : address ? (
                                <>
                                    <Text style={{ fontWeight: 'bold' }}>{address.street}, {address.number}</Text>
                                    <Text style={{ color: '#666' }}>
                                        {address.cep} - {address.neighborhood}
                                    </Text>
                                    {address.city && (
                                        <Text style={{ color: '#999', fontSize: 12 }}>{address.city}/{address.state}</Text>
                                    )}
                                </>
                            ) : (
                                <Text style={{ color: '#d63031' }}>Selecione um endereço</Text>
                            )}
                        </View>
                        <TouchableOpacity onPress={() => router.push('/(aux)/account/address' as any)}>
                            <Text style={styles.link}>{address ? 'Alterar' : 'Adicionar'}</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Dados do Cartão */}
                <View style={styles.section}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.sectionTitle}>Dados do Cartão</Text>
                        <View style={styles.secureBadge}>
                            <MaterialCommunityIcons name="lock" size={12} color="#00a650" />
                            <Text style={styles.secureText}>Seguro</Text>
                        </View>
                    </View>
                    
                    <TextInput
                        label="Número do Cartão"
                        value={cardNumber}
                        onChangeText={handleCardNumberChange}
                        keyboardType="numeric"
                        maxLength={19}
                        mode="outlined"
                        style={styles.input}
                        activeOutlineColor={theme.colors.primary}
                        left={<TextInput.Icon icon="credit-card" />}
                    />

                    <TextInput
                        label="Nome impresso no cartão"
                        value={cardName}
                        onChangeText={setCardName}
                        autoCapitalize="characters"
                        mode="outlined"
                        style={styles.input}
                        activeOutlineColor={theme.colors.primary}
                    />

                    <View style={styles.rowInputs}>
                        <TextInput
                            label="Validade (MM/AA)"
                            value={cardExpiry}
                            onChangeText={handleExpiryChange}
                            keyboardType="numeric"
                            maxLength={5}
                            mode="outlined"
                            style={[styles.input, { flex: 1, marginRight: 10 }]}
                            activeOutlineColor={theme.colors.primary}
                        />
                        <TextInput
                            label="CVV"
                            value={cardCVV}
                            onChangeText={setCardCVV}
                            keyboardType="numeric"
                            maxLength={4}
                            mode="outlined"
                            style={[styles.input, { flex: 0.6 }]}
                            activeOutlineColor={theme.colors.primary}
                            secureTextEntry
                            right={<TextInput.Icon icon="help-circle-outline" onPress={() => Alert.alert('CVV', 'Código de 3 dígitos no verso do cartão')} />}
                        />
                    </View>
                    
                    <View style={styles.installmentsInfo}>
                         <MaterialCommunityIcons name="check-circle-outline" size={16} color="#00a650" />
                         <Text style={{ marginLeft: 5, color: '#00a650', fontSize: 12 }}>Pagamento em 1x sem juros</Text>
                    </View>
                </View>

                {/* Resumo */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Resumo da Compra</Text>
                    <View style={styles.row}>
                        <Text>Produtos ({cartItems.length})</Text>
                        <Text>R$ {total.toFixed(2).replace('.', ',')}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text>Frete</Text>
                        <Text style={{ color: '#00a650', fontWeight: 'bold' }}>Grátis</Text>
                    </View>
                    <Divider style={{ marginVertical: 10 }} />
                    <View style={styles.row}>
                        <Text style={styles.totalLabel}>Total a pagar</Text>
                        <Text style={styles.totalValue}>R$ {total.toFixed(2).replace('.', ',')}</Text>
                    </View>
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity style={styles.payBtn} onPress={handleFinish} disabled={loading}>
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.payText}>Finalizar Pagamento</Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    header: { backgroundColor: theme.colors.secondary, paddingTop: Platform.OS === 'android' ? 30 : 0 },
    headerContent: { padding: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    headerTitle: { fontSize: 18, fontWeight: '500' },
    content: { padding: 15, paddingBottom: 100 }, 
    section: { backgroundColor: '#fff', borderRadius: 8, padding: 15, marginBottom: 15, elevation: 2 },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 15, color: '#333' },
    addressBox: { flexDirection: 'row', alignItems: 'center' },
    link: { color: '#3483fa', fontWeight: 'bold', fontSize: 13, padding: 5 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    secureBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#e6f7ee', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 },
    secureText: { color: '#00a650', fontSize: 10, fontWeight: 'bold', marginLeft: 2 },
    input: { marginBottom: 12, backgroundColor: '#fff', fontSize: 14, height: 45 },
    rowInputs: { flexDirection: 'row', justifyContent: 'space-between' },
    installmentsInfo: { flexDirection: 'row', marginTop: 5, alignItems: 'center' },
    row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    totalLabel: { fontSize: 18, fontWeight: 'bold' },
    totalValue: { fontSize: 20, fontWeight: 'bold', color: '#333' },
    footer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#fff', padding: 15, borderTopWidth: 1, borderColor: '#eee', elevation: 10 },
    payBtn: { backgroundColor: theme.colors.primary, paddingVertical: 14, borderRadius: 6, alignItems: 'center' },
    payText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});