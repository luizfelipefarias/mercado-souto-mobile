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
  KeyboardAvoidingView 
} from 'react-native';
import { Text, TextInput, Button, ActivityIndicator } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { theme } from '../../../../src/constants/theme';
import { useAuth } from '../../../../src/context/AuthContext';
import api from '../../../../src/services/api';
import { Client } from '../../../../src/interfaces';

type AddressFormData = {
  zipCode: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
};

export default function AddressForm() {
  const router = useRouter();
  const { user, isGuest } = useAuth(); 

  const [loading, setLoading] = useState(false);
  const [loadingCep, setLoadingCep] = useState(false);

  const [form, setForm] = useState<AddressFormData>({
    zipCode: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: ''
  });

  const isFormValid = useMemo(() => {
    return (
      form.zipCode.replace(/\D/g, '').length === 8 &&
      form.street.trim() &&
      form.number.trim() &&
      form.city.trim() &&
      form.state.trim() &&
      form.neighborhood.trim()
    );
  }, [form]);

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
          city: data.localidade || '',
          state: data.uf || ''
        }));
      } else {
        Alert.alert('Aviso', 'CEP não encontrado.');
      }
    } catch {
      Alert.alert('Erro', 'Falha ao buscar CEP. Verifique sua conexão.');
    } finally {
      setLoadingCep(false);
    }
  }, [form.zipCode]);

  const handleSave = useCallback(async () => {
    if (!isFormValid) {
      Alert.alert('Atenção', 'Preencha todos os campos obrigatórios.');
      return;
    }


    const userId = user?.id;
    const userPhone = user?.phone;
    const userName = user?.name;

    if (!userId || isGuest) {
      Alert.alert('Erro', 'Você precisa estar logado com uma conta para salvar um endereço.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        cep: form.zipCode.replace(/\D/g, ''),
        street: form.street,
        number: form.number,
        complement: form.complement,
        additionalInfo: form.neighborhood, 
        
        home: true,
        contactName: userName || 'Cliente',
        contactPhone: userPhone || '' 
      };
      
      await api.post(`/api/address/${userId}`, payload);

      Alert.alert('Sucesso', 'Endereço cadastrado com sucesso!');
      
      
      router.back();
    } catch (error) {
      console.error("Erro ao salvar endereço:", error);
      Alert.alert('Erro', 'Não foi possível salvar o endereço. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }, [form, isFormValid, user, isGuest, router]); 

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.secondary} />

      <SafeAreaView style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
            <MaterialCommunityIcons name="close" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Adicionar endereço</Text>
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

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <TextInput
                label="Cidade"
                mode="outlined"
                value={form.city}
                style={[styles.input, styles.lockedInput]}
                outlineColor="#ddd"
                editable={false} 
              />
            </View>

            <View style={{ width: 80 }}>
              <TextInput
                label="UF"
                mode="outlined"
                value={form.state}
                style={[styles.input, styles.lockedInput]}
                outlineColor="#ddd"
                editable={false} 
              />
            </View>
          </View>

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
                label="Complemento (Opcional)"
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
            disabled={loading || !isFormValid}
            style={styles.saveButton}
            contentStyle={{ height: 50 }}
            labelStyle={{ fontSize: 16, fontWeight: 'bold', color: '#fff' }}
          >
            Salvar endereço
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