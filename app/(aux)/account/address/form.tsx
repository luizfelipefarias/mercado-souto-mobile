import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { 
    View, 
    StyleSheet, 
    ScrollView, 
    TouchableOpacity, 
    SafeAreaView, 
    Platform, 
    StatusBar,
    KeyboardAvoidingView 
} from 'react-native';
import { Text, TextInput, Button, ActivityIndicator, HelperText } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router'; 
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage'; 
import Toast from 'react-native-toast-message'; 

import { theme } from '../../../../src/constants/theme';
import { useAuth } from '../../../../src/context/AuthContext';
import api from '../../../../src/services/api';
import { Address } from '../../../../src/interfaces'; 

const GUEST_ADDRESS_KEY = '@guest_addresses';

type DisplayAddress = Address & {
    neighborhood?: string;
};

type AddressFormData = {
    zipCode: string;
    street: string;
    number: string;
    complement: string;
    neighborhood: string;
};

export default function AddressForm() {
    const router = useRouter();
    const { user, isGuest, token } = useAuth(); 
    const params = useLocalSearchParams(); 

    const [editingAddressId, setEditingAddressId] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [loadingCep, setLoadingCep] = useState(false);

    const [contactName, setContactName] = useState(user?.name || ''); 
    const [tempCity, setTempCity] = useState('');
    const [tempState, setTempState] = useState('');
    const [contactPhone, setContactPhone] = useState(user?.phone || ''); 
    
    const [form, setForm] = useState<AddressFormData>({
        zipCode: '',
        street: '',
        number: '',
        complement: '',
        neighborhood: '',
    });

    const [errors, setErrors] = useState({
        contactName: false,
        contactPhone: false,
        zipCode: false,
        neighborhood: false,
        street: false,
        number: false,
        city: false
    });
    
    const [originalForm, setOriginalForm] = useState<{ form: AddressFormData, name: string, phone: string, city: string, state: string } | null>(null);

    useEffect(() => {
        if (params.address && typeof params.address === 'string') {
            try {
                const addressToEdit: DisplayAddress = JSON.parse(params.address);
                setEditingAddressId(addressToEdit.id);
                
                const initialForm = {
                    zipCode: addressToEdit.cep || '',
                    street: addressToEdit.street || '',
                    number: addressToEdit.number || '',
                    complement: addressToEdit.complement || '',
                    neighborhood: addressToEdit.additionalInfo || addressToEdit.neighborhood || '',
                };
                const initialName = addressToEdit.contactName || user?.name || '';
                const initialPhone = addressToEdit.contactPhone || user?.phone || '';
                const initialCity = (addressToEdit as any).city || '';
                const initialState = (addressToEdit as any).state || '';

                setForm(initialForm);
                setContactName(initialName);
                setContactPhone(initialPhone);
                setTempCity(initialCity);
                setTempState(initialState);
                
                setOriginalForm({
                    form: initialForm, 
                    name: initialName, 
                    phone: initialPhone, 
                    city: initialCity, 
                    state: initialState
                });

            } catch (e) {
                Toast.show({ type: 'error', text1: 'Erro', text2: 'Falha ao carregar dados.' });
            }
        }
    }, [params.address, user?.phone, user?.name]);

    const hasChanges = useMemo(() => {
        if (!originalForm || !editingAddressId) return true; 

        const formChanged = Object.keys(form).some(key => 
            form[key as keyof AddressFormData] !== originalForm.form[key as keyof AddressFormData]
        );
        
        const otherChanged = 
            contactName !== originalForm.name ||
            contactPhone !== originalForm.phone ||
            tempCity !== originalForm.city ||
            tempState !== originalForm.state;

        return formChanged || otherChanged;
    }, [form, originalForm, contactName, contactPhone, tempCity, tempState, editingAddressId]);

    const validateForm = () => {
        const newErrors = {
            contactName: contactName.trim().length < 3,
            contactPhone: contactPhone.replace(/\D/g, '').length < 10,
            zipCode: form.zipCode.replace(/\D/g, '').length !== 8,
            neighborhood: form.neighborhood.trim() === '',
            street: form.street.trim() === '',
            number: form.number.trim() === '',
            city: tempCity.trim() === ''
        };

        setErrors(newErrors);
        return !Object.values(newErrors).includes(true);
    };

    const handleChange = useCallback((key: keyof AddressFormData, value: string) => {
        setForm(prev => ({ ...prev, [key]: value }));
        // Limpa o erro ao digitar
        if (errors[key as keyof typeof errors]) {
            setErrors(prev => ({ ...prev, [key]: false }));
        }
    }, [errors]);

    const handlePhoneChange = (text: string) => {
        let v = text.replace(/\D/g, '');
        if (v.length > 11) v = v.slice(0, 11);
        v = v.replace(/^(\d{2})(\d)/, '($1) $2');
        v = v.replace(/(\d{5})(\d)/, '$1-$2');

        setContactPhone(v);
        // Limpa erro ao digitar
        if (errors.contactPhone) {
            setErrors(p => ({...p, contactPhone: false}));
        }
    };

    const handleBlurCep = useCallback(async () => {
        const cleanCep = form.zipCode.replace(/\D/g, '');

        if (cleanCep.length !== 8) {
            setErrors(prev => ({ ...prev, zipCode: true }));
            return;
        }

        setLoadingCep(true);
        try {
            const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
            const data = await response.json();

            if (!data.erro) {
                setForm(prev => ({
                    ...prev,
                    street: data.logradouro || '',
                    neighborhood: data.bairro || '',
                }));
                setTempCity(data.localidade || '');
                setTempState(data.uf || '');
                // Limpa múltiplos erros relacionados ao endereço
                setErrors(prev => ({ ...prev, zipCode: false, street: false, neighborhood: false, city: false }));
            } else {
                Toast.show({ type: 'error', text1: 'CEP não encontrado', text2: 'Verifique o número digitado.' });
                setTempCity('');
                setTempState('');
            }
        } catch {
            Toast.show({ type: 'error', text1: 'Erro de conexão', text2: 'Não foi possível buscar o CEP.' });
        } finally {
            setLoadingCep(false);
        }
    }, [form.zipCode]);
    
    const saveGuestAddress = async (payload: any, isEditing: boolean) => {
        const newAddress: Address = { 
            id: isEditing && editingAddressId ? editingAddressId : Date.now(),
            cep: payload.cep,
            street: payload.street,
            number: payload.number,
            complement: payload.complement,
            additionalInfo: payload.additionalInfo, 
            home: true,
            contactName: payload.contactName, 
            contactPhone: payload.contactPhone,
        } as Address; 
        
        const displayAddress: DisplayAddress = {
            ...newAddress,
            city: payload.city, 
            state: payload.state,
            neighborhood: payload.additionalInfo
        } as DisplayAddress;

        const storedAddresses = await AsyncStorage.getItem(GUEST_ADDRESS_KEY);
        let currentAddresses: DisplayAddress[] = storedAddresses ? JSON.parse(storedAddresses) : [];

        if (isEditing) {
            currentAddresses = currentAddresses.map(addr => 
                addr.id === displayAddress.id ? displayAddress : addr
            );
        } else {
            currentAddresses.push(displayAddress);
        }

        await AsyncStorage.setItem(GUEST_ADDRESS_KEY, JSON.stringify(currentAddresses));
        Toast.show({ type: 'success', text1: 'Sucesso', text2: 'Endereço salvo localmente!' });
    };

    const handleRedirect = () => {
        const comingFromCheckout = params.fromCheckout === 'true';
        if (isGuest) {
            router.replace('/(auth)/login' as any); 
        } else if (comingFromCheckout) {
            router.replace('/(aux)/shop/checkout' as any);
        } else {
            router.replace('/(aux)/account/address' as any); 
        }
    };

    const handleSave = useCallback(async () => {
        if (!validateForm()) {
            Toast.show({ 
                type: 'error', 
                text1: 'Campos obrigatórios', 
                text2: 'Verifique os campos em vermelho.' 
            });
            return;
        }

        if (editingAddressId && !hasChanges) {
            Toast.show({ type: 'info', text1: 'Sem alterações', text2: 'Nenhum dado foi modificado.' });
            return;
        }

        const userId = user?.id;
        const isEditing = !!editingAddressId; 

        const payload = {
            cep: form.zipCode.replace(/\D/g, ''),
            street: form.street,
            number: form.number,
            complement: form.complement, 
            additionalInfo: form.neighborhood, 
            home: true,
            contactName: contactName, 
            contactPhone: contactPhone, 
        };

        if (isGuest) {
            try {
                await saveGuestAddress(payload, isEditing);
                handleRedirect(); 
            } catch (error) {
                Toast.show({ type: 'error', text1: 'Erro', text2: 'Falha ao salvar localmente.' });
            }
            return;
        }

        if (!token) {
             Toast.show({ type: 'error', text1: 'Erro', text2: 'Usuário não autenticado.' });
             return;
        }

        setLoading(true);
        try {
            const endpoint = isEditing ? `/api/address/${editingAddressId}` : `/api/address/${userId}`; 
            const method = isEditing ? api.put : api.post;

            await method(endpoint, payload);

            Toast.show({ 
                type: 'success', 
                text1: 'Sucesso!', 
                text2: `Endereço ${isEditing ? 'atualizado' : 'cadastrado'}.` 
            });
            
            handleRedirect(); 
        } catch (error) {
            Toast.show({ type: 'error', text1: 'Erro API', text2: 'Não foi possível salvar o endereço.' });
        } finally {
            setLoading(false);
        }
    }, [form, contactName, contactPhone, user, isGuest, editingAddressId, hasChanges, tempCity]); 

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={theme.colors.secondary} />

            <SafeAreaView style={styles.header}>
                <View style={styles.headerContent}>
                    <TouchableOpacity 
                        onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)')} 
                        hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
                    >
                        <MaterialCommunityIcons name="close" size={24} color="#333" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>
                        {editingAddressId ? 'Editar endereço' : 'Adicionar endereço'} 
                    </Text>
                    <View style={{ width: 24 }} />
                </View>
            </SafeAreaView>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

                    <Text style={styles.sectionTitle}>Dados de Contato</Text>
                    
                    <View>
                        <TextInput
                            label="Nome completo"
                            mode="outlined"
                            value={contactName}
                            onChangeText={(t) => { 
                                setContactName(t); 
                                if(errors.contactName) setErrors(p => ({...p, contactName: false}));
                            }}
                            style={styles.input}
                            error={errors.contactName}
                            activeOutlineColor={theme.colors.primary}
                        />
                     
                        <HelperText type="error" visible={errors.contactName}>
                            Digite o nome completo do recebedor.
                        </HelperText>
                    </View>

                    <View>
                        <TextInput
                            label="Telefone (DDD + Número)"
                            mode="outlined"
                            value={contactPhone}
                            onChangeText={handlePhoneChange}
                            maxLength={15}
                            style={styles.input}
                            error={errors.contactPhone}
                            activeOutlineColor={theme.colors.primary}
                            keyboardType="phone-pad"
                            placeholder='(00) 00000-0000'
                        />
                        <HelperText type="error" visible={errors.contactPhone}>
                            Telefone inválido (mínimo 10 dígitos).
                        </HelperText>
                    </View>

                    <Text style={[styles.sectionTitle, {marginTop: 15}]}>Endereço</Text>

                    <View>
                        <TextInput
                            label="CEP"
                            mode="outlined"
                            value={form.zipCode}
                            onChangeText={t => {
                                const masked = t.replace(/\D/g, '').replace(/^(\d{5})(\d)/, '$1-$2');
                                handleChange('zipCode', masked);
                            }}
                            onBlur={handleBlurCep}
                            style={styles.input}
                            error={errors.zipCode}
                            activeOutlineColor={theme.colors.primary}
                            keyboardType="numeric"
                            maxLength={9}
                            right={loadingCep ? <TextInput.Icon icon={() => <ActivityIndicator size={20} color={theme.colors.primary} />} /> : null}
                        />
                        <HelperText type="error" visible={errors.zipCode}>
                            CEP inválido.
                        </HelperText>
                    </View>

                    <View>
                        <TextInput
                            label="Bairro"
                            mode="outlined"
                            value={form.neighborhood}
                            onChangeText={t => handleChange('neighborhood', t)}
                            style={styles.input}
                            error={errors.neighborhood}
                            activeOutlineColor={theme.colors.primary}
                        />
                        <HelperText type="error" visible={errors.neighborhood}>
                            Bairro obrigatório.
                        </HelperText>
                    </View>

                    <View>
                        <TextInput
                            label="Rua / Avenida"
                            mode="outlined"
                            value={form.street}
                            onChangeText={t => handleChange('street', t)}
                            style={styles.input}
                            error={errors.street}
                            activeOutlineColor={theme.colors.primary}
                        />
                        <HelperText type="error" visible={errors.street}>
                            Rua obrigatória.
                        </HelperText>
                    </View>

                    <View style={styles.row}>
                        <View style={{ flex: 1, marginRight: 10 }}>
                            <TextInput
                                label="Número"
                                mode="outlined"
                                value={form.number}
                                onChangeText={t => handleChange('number', t)}
                                style={styles.input}
                                error={errors.number}
                                activeOutlineColor={theme.colors.primary}
                                keyboardType="numeric"
                            />
                            <HelperText type="error" visible={errors.number}>
                                Obrigatório.
                            </HelperText>
                        </View>

                        <View style={{ flex: 1.5 }}>
                            <TextInput
                                label="Complemento (Opcional)" 
                                mode="outlined"
                                value={form.complement}
                                onChangeText={t => handleChange('complement', t)}
                                style={styles.input}
                                activeOutlineColor={theme.colors.primary}
                            />
                        </View>
                    </View>

                    <Button 
                        mode="contained" 
                        onPress={handleSave} 
                        loading={loading}
                        style={styles.saveButton}
                        contentStyle={{ height: 50 }}
                        labelStyle={{ fontSize: 16, fontWeight: 'bold', color: '#fff' }}
                    >
                        {editingAddressId ? 'Salvar alterações' : 'Salvar endereço'}
                    </Button>

                    <View style={{ height: 50 }} />

                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: { 
        backgroundColor: theme.colors.secondary,
        paddingTop: Platform.OS === 'android' ? 30 : 0,
        elevation: 2,
        zIndex: 10,
    },
    headerContent: { 
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 15,
        height: 60,
    },
    headerTitle: { fontSize: 18, color: '#333', fontWeight: '500' },
    content: { padding: 20 },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#666', marginBottom: 10 },
    input: { backgroundColor: '#fff', fontSize: 16, marginBottom: 0 },
    lockedInput: { backgroundColor: '#f0f0f0', color: '#888' },
    row: { flexDirection: 'row', alignItems: 'flex-start' }, 
    saveButton: { backgroundColor: theme.colors.primary, borderRadius: 6, marginTop: 20 }
});