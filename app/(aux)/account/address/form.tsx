import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { 
    View, 
    StyleSheet, 
    ScrollView, 
    TouchableOpacity, 
    Alert, 
    SafeAreaView, 
    Platform, 
    StatusBar,
    KeyboardAvoidingView 
} from 'react-native';
import { Text, TextInput, Button, ActivityIndicator } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router'; 
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage'; 

import { theme } from '../../../../src/constants/theme';
import { useAuth } from '../../../../src/context/AuthContext';
import api from '../../../../src/services/api';
import { Client, Address } from '../../../../src/interfaces'; 

const GUEST_ADDRESS_KEY = '@guest_addresses';

// Definindo o tipo de dado que vem do AddressList para edição
type DisplayAddress = Address & {
    neighborhood?: string;
};

// REMOVENDO CITY/STATE DO ESTADO PRINCIPAL DO FORM
type AddressFormData = {
    zipCode: string;
    street: string;
    number: string;
    complement: string; // Usado para Referência/Observação
    neighborhood: string;
};

export default function AddressForm() {
    const router = useRouter();
    const { user, isGuest } = useAuth(); 
    const params = useLocalSearchParams(); 

    const [editingAddressId, setEditingAddressId] = useState<number | null>(null);

    const [loading, setLoading] = useState(false);
    const [loadingCep, setLoadingCep] = useState(false);

    // ESTADOS ADICIONADOS: Nome Completo e dados temporários do ViaCEP
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
    
    // ESTADO PARA ARMAZENAR DADOS ORIGINAIS (para comparação)
    const [originalForm, setOriginalForm] = useState<{ form: AddressFormData, name: string, phone: string, city: string, state: string } | null>(null);


    // 🟢 EFEITO: Carrega dados do endereço para edição
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
                
                // SALVA O ESTADO ORIGINAL APÓS CARREGAR
                setOriginalForm({
                    form: initialForm, 
                    name: initialName, 
                    phone: initialPhone, 
                    city: initialCity, 
                    state: initialState
                });

            } catch (e) {
                console.error("Erro ao carregar endereço para edição:", e);
                Alert.alert('Erro', 'Não foi possível carregar os dados de edição.');
            }
        }
    }, [params.address, user?.phone, user?.name]);


    // 🟢 MEMO PARA VERIFICAR SE HOUVE ALTERAÇÕES
    const hasChanges = useMemo(() => {
        if (!originalForm || !editingAddressId) return true; // Se for criação, sempre é true (válido)

        // Compara campos do formulário
        const formChanged = Object.keys(form).some(key => 
            form[key as keyof AddressFormData] !== originalForm.form[key as keyof AddressFormData]
        );
        
        // Compara campos de contato e CEP preenchidos
        const otherChanged = 
            contactName !== originalForm.name ||
            contactPhone !== originalForm.phone ||
            tempCity !== originalForm.city ||
            tempState !== originalForm.state;

        return formChanged || otherChanged;

    }, [form, originalForm, contactName, contactPhone, tempCity, tempState, editingAddressId]);


    const isFormValid = useMemo(() => {
        return (
            form.zipCode.replace(/\D/g, '').length === 8 &&
            form.street.trim() &&
            form.number.trim() &&
            form.neighborhood.trim() &&
            tempCity.trim() && 
            tempState.trim() && 
            contactName.trim().length >= 3 &&
            contactPhone.replace(/\D/g, '').length >= 10 
        );
    }, [form, tempCity, tempState, contactPhone, contactName]);

    const handleChange = useCallback((key: keyof AddressFormData, value: string) => {
        setForm(prev => ({ ...prev, [key]: value }));
    }, []);

    const handleBlurCep = useCallback(async () => {
        const cleanCep = form.zipCode.replace(/\D/g, '');

        if (cleanCep.length !== 8) return;

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
            } else {
                Alert.alert('Aviso', 'CEP não encontrado.');
                setTempCity('');
                setTempState('');
            }
        } catch {
            Alert.alert('Erro', 'Falha ao buscar CEP. Verifique sua conexão.');
        } finally {
            setLoadingCep(false);
        }
    }, [form.zipCode]);
    
    // Lógica de salvar endereço para GUEST
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
        Alert.alert('Sucesso', 'Endereço salvo localmente!');
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
        if (!isFormValid) {
            Alert.alert('Atenção', 'Preencha todos os campos obrigatórios.');
            return;
        }


        if (editingAddressId && !hasChanges) {
            Alert.alert(
                'Nenhuma alteração', 
                'Você não fez alterações no endereço. Clique em "Fechar" se não deseja salvar.',
                [{ text: "Ok" }]
            );
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
                console.error("Erro ao salvar endereço guest:", error);
                Alert.alert('Erro', 'Não foi possível salvar o endereço localmente.');
            }
            return;
        }


        if (!userId) {
             Alert.alert('Erro', 'Usuário não autenticado para salvar na API.');
             return;
        }


        setLoading(true);
        try {
            const endpoint = isEditing 
                ? `/api/address/${editingAddressId}` 
                : `/api/address/${userId}`; 

            const method = isEditing ? api.put : api.post;

            await method(endpoint, payload);

            Alert.alert('Sucesso', `Endereço ${isEditing ? 'atualizado' : 'cadastrado'} com sucesso!`);
            
            handleRedirect(); 
        } catch (error) {
            console.error("Erro ao salvar endereço API:", error);
            Alert.alert('Erro', 'Não foi possível salvar o endereço. Tente novamente.');
        } finally {
            setLoading(false);
        }
    }, [form, isFormValid, user, isGuest, router, editingAddressId, tempCity, tempState, contactPhone, contactName, params.fromCheckout, hasChanges]); 

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

            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

                    <Text style={styles.sectionTitle}>Dados do local</Text>
                    

                    <TextInput
                        label="Nome completo (Ex: João da Silva)"
                        mode="outlined"
                        value={contactName}
                        onChangeText={setContactName}
                        style={styles.input}
                        outlineColor="#ddd"
                        activeOutlineColor={theme.colors.primary}
                    />


                    <TextInput
                        label="Telefone para contato"
                        mode="outlined"
                        value={contactPhone}
                        onChangeText={setContactPhone}
                        style={styles.input}
                        outlineColor="#ddd"
                        activeOutlineColor={theme.colors.primary}
                        keyboardType="phone-pad"
                    />


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
                        outlineColor="#ddd"
                        activeOutlineColor={theme.colors.primary}
                        keyboardType="numeric"
                        maxLength={9}
                        right={loadingCep ? <TextInput.Icon icon={() => <ActivityIndicator size={20} color={theme.colors.primary} />} /> : null}
                    />


                    <TextInput
                        label="Bairro"
                        mode="outlined"
                        value={form.neighborhood}
                        onChangeText={t => handleChange('neighborhood', t)}
                        style={styles.input}
                        outlineColor="#ddd"
                        activeOutlineColor={theme.colors.primary}
                    />

                    <TextInput
                        label="Rua / Avenida"
                        mode="outlined"
                        value={form.street}
                        onChangeText={t => handleChange('street', t)}
                        style={styles.input}
                        outlineColor="#ddd"
                        activeOutlineColor={theme.colors.primary}
                    />

                    <View style={styles.row}>
                        <View style={{ flex: 1, marginRight: 10 }}>
                            <TextInput
                                label="Número"
                                mode="outlined"
                                value={form.number}
                                onChangeText={t => handleChange('number', t)}
                                style={styles.input}
                                outlineColor="#ddd"
                                activeOutlineColor={theme.colors.primary}
                                keyboardType="numeric"
                            />
                        </View>

                        <View style={{ flex: 1 }}>
                            <TextInput
                                label="Observação/Referência (Opcional)" 
                                mode="outlined"
                                value={form.complement}
                                onChangeText={t => handleChange('complement', t)}
                                style={styles.input}
                                outlineColor="#ddd"
                                activeOutlineColor={theme.colors.primary}
                            />
                        </View>
                    </View>

                    <View style={styles.footerInfo}>
                        <MaterialCommunityIcons name="information-outline" size={20} color="#666" />
                        <Text style={styles.footerText}>
                            Verifique se os dados estão corretos para garantir a entrega.
                        </Text>
                    </View>

                    <Button 
                        mode="contained" 
                        onPress={handleSave} 
                        loading={loading}
                        disabled={loading || !isFormValid || !!(editingAddressId && !hasChanges)} 
                        style={styles.saveButton}
                        contentStyle={{ height: 50 }}
                        labelStyle={{ fontSize: 16, fontWeight: 'bold', color: '#fff' }}
                    >
                        {editingAddressId ? 'Salvar alterações' : 'Salvar endereço'}
                    </Button>

                    <View style={{ height: 30 }} />

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

    headerTitle: { 
        fontSize: 18,
        color: '#333',
        fontWeight: '500' 
    },

    content: { 
        padding: 20 
    },

    sectionTitle: { 
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15 
    },

    input: { 
        backgroundColor: '#fff',
        fontSize: 16,
        marginBottom: 12,
    },

    lockedInput: {
        backgroundColor: '#f2f2f2',
        color: '#666'
    },

    row: { 
        flexDirection: 'row' 
    },

    footerInfo: { 
        flexDirection: 'row',
        backgroundColor: '#f5f5f5',
        padding: 15,
        borderRadius: 6,
        marginBottom: 20,
        alignItems: 'center',
        marginTop: 10
    },

    footerText: { 
        fontSize: 12,
        color: '#666',
        marginLeft: 10,
        flex: 1 
    },

    saveButton: { 
        backgroundColor: theme.colors.primary,
        borderRadius: 6 
    }
});