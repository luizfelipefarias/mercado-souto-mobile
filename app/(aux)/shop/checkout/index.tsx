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
import { Text, RadioButton, Divider } from 'react-native-paper';
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

    const [paymentMethod, setPaymentMethod] = useState<'pix' | 'card'>('pix');
    const [loading, setLoading] = useState(false);
    const [loadingAddress, setLoadingAddress] = useState(false);
    const [address, setAddress] = useState<DisplayAddress | null>(null);

    const total = useMemo(
        () => cartItems.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0),
        [cartItems]
    );

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
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Entrar', onPress: () => router.push('/(auth)/login' as any) },
            ]);
            return;
        }

        if (cartItems.length === 0) {
            Alert.alert('Carrinho vazio', 'Adicione produtos antes de continuar.');
            return;
        }

        if (!address) {
            Alert.alert('Endereço', 'Adicione um endereço de entrega.', [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Adicionar', onPress: () => router.push('/(aux)/account/address' as any) },
            ]);
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
            
            if (router.canDismiss()) router.dismissAll(); 
            router.replace('/(aux)/shop/my-purchases' as any);
            
            setTimeout(() => {
                 Alert.alert('Sucesso!', 'Pedido realizado com sucesso.');
            }, 500);
            
        } catch (error: any) {
            console.log('Erro ao finalizar:', error);
            const msg = error?.response?.data?.message || 'Erro ao finalizar compra.';
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
                                        {address.cep} - {address.neighborhood}
                                    </Text>
                                    <Text style={{ color: '#666', fontSize: 12 }}>
                                        {address.contactName || (user as any)?.name}
                                    </Text>
                                    {address.city && (
                                        <Text style={{ color: '#999', fontSize: 12 }}>{address.city}/{address.state}</Text>
                                    )}
                                </>
                            ) : (
                                <Text style={{ color: '#666' }}>Nenhum endereço selecionado</Text>
                            )}
                        </View>
                        <TouchableOpacity onPress={() => router.push('/(aux)/account/address' as any)}>
                            <Text style={styles.link}>Trocar</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Como você prefere pagar?</Text>
                    <TouchableOpacity style={styles.paymentOption} onPress={() => setPaymentMethod('pix')}>
                        <RadioButton value="pix" status={paymentMethod === 'pix' ? 'checked' : 'unchecked'} onPress={() => setPaymentMethod('pix')} color="#00a650" />
                        <MaterialCommunityIcons name="qrcode" size={24} color="#00a650" style={{ marginLeft: 10 }} />
                        <View style={{ marginLeft: 10 }}>
                            <Text style={styles.paymentLabel}>Pix (Aprovação imediata)</Text>
                            <Text style={styles.paymentSubLabel}>Use o app do seu banco</Text>
                        </View>
                    </TouchableOpacity>
                    <Divider />
                    <TouchableOpacity style={styles.paymentOption} onPress={() => setPaymentMethod('card')}>
                        <RadioButton value="card" status={paymentMethod === 'card' ? 'checked' : 'unchecked'} onPress={() => setPaymentMethod('card')} color="#00a650" />
                        <MaterialCommunityIcons name="credit-card-outline" size={24} color="#333" style={{ marginLeft: 10 }} />
                        <View style={{ marginLeft: 10 }}>
                            <Text style={styles.paymentLabel}>Cartão de Crédito</Text>
                            <Text style={styles.paymentSubLabel}>Até 12x sem juros</Text>
                        </View>
                    </TouchableOpacity>
                </View>

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

            <View style={styles.footer}>
                <TouchableOpacity style={styles.payBtn} onPress={handleFinish} disabled={loading}>
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.payText}>Confirmar compra</Text>}
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
    content: { padding: 15, paddingBottom: 140 },
    section: { backgroundColor: '#fff', borderRadius: 8, padding: 15, marginBottom: 15, elevation: 1 },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 15, color: '#333' },
    addressBox: { flexDirection: 'row', alignItems: 'center' },
    link: { color: '#3483fa', fontWeight: 'bold', fontSize: 13 },
    paymentOption: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15 },
    paymentLabel: { fontSize: 14, color: '#333', fontWeight: '500' },
    paymentSubLabel: { fontSize: 12, color: '#00a650' },
    row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    totalLabel: { fontSize: 16, fontWeight: 'bold' },
    totalValue: { fontSize: 20, fontWeight: 'bold' },
    footer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#fff', padding: 15, borderTopWidth: 1, borderColor: '#eee' },
    payBtn: { backgroundColor: theme.colors.primary, padding: 15, borderRadius: 6, alignItems: 'center' },
    payText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});