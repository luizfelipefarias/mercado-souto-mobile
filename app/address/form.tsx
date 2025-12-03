import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, Text, TextInput } from 'react-native-paper';
import { theme } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function AddressForm() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  
  const [form, setForm] = useState({
    zipCode: '',
    street: '',
    number: '',
    city: '',
    state: '',
    neighborhood: ''
  });

  const handleSave = async () => {
    if (!form.zipCode || !form.street || !form.number || !form.city || !form.state || !form.neighborhood) {
      return Alert.alert("Atenção", "Preencha todos os campos para continuar.");
    }

    setLoading(true);
    try {
      const userId = (user as any)?.id || 1; 

      await api.post(`/api/address/${userId}`, {
        street: form.street,
        number: form.number,
        city: form.city,
        state: form.state,
        zipCode: form.zipCode,
        neighborhood: form.neighborhood
      });

      Alert.alert("Sucesso", "Endereço cadastrado!");
      router.back(); 
      
    } catch (error) {
      console.log('Erro ao salvar endereço:', error);
      Alert.alert("Erro", "Não foi possível salvar o endereço. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.secondary} />
      
      {/* Header Amarelo */}
      <SafeAreaView style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialCommunityIcons name="close" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Adicionar endereço</Text>
          <View style={{width: 24}}/>
        </View>
      </SafeAreaView>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
        style={{flex: 1}}
      >
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          
          <Text style={styles.sectionTitle}>Dados do local</Text>

          <TextInput
            label="CEP"
            mode="outlined"
            value={form.zipCode}
            onChangeText={t => setForm({...form, zipCode: t})}
            style={styles.input}
            outlineColor="#ddd"
            activeOutlineColor={theme.colors.primary}
            placeholder="00000-000"
            keyboardType="numeric"
            maxLength={9}
          />

          <View style={styles.row}>
              <View style={{flex: 1, marginRight: 10}}>
                  <TextInput
                      label="Cidade"
                      mode="outlined"
                      value={form.city}
                      onChangeText={t => setForm({...form, city: t})}
                      style={styles.input}
                      outlineColor="#ddd"
                      activeOutlineColor={theme.colors.primary}
                  />
              </View>
              <View style={{width: 80}}>
                  <TextInput
                      label="UF"
                      mode="outlined"
                      value={form.state}
                      onChangeText={t => setForm({...form, state: t.toUpperCase()})}
                      style={styles.input}
                      outlineColor="#ddd"
                      activeOutlineColor={theme.colors.primary}
                      placeholder="PE"
                      maxLength={2}
                  />
              </View>
          </View>

          <TextInput
            label="Bairro"
            mode="outlined"
            value={form.neighborhood}
            onChangeText={t => setForm({...form, neighborhood: t})}
            style={styles.input}
            outlineColor="#ddd"
            activeOutlineColor={theme.colors.primary}
          />

          <TextInput
            label="Rua / Avenida"
            mode="outlined"
            value={form.street}
            onChangeText={t => setForm({...form, street: t})}
            style={styles.input}
            outlineColor="#ddd"
            activeOutlineColor={theme.colors.primary}
          />

          <TextInput
            label="Número"
            mode="outlined"
            value={form.number}
            onChangeText={t => setForm({...form, number: t})}
            style={styles.input}
            outlineColor="#ddd"
            activeOutlineColor={theme.colors.primary}
            keyboardType="numeric"
          />

          <View style={styles.footerInfo}>
             <MaterialCommunityIcons name="information-outline" size={20} color="#666" />
             <Text style={styles.footerText}>Verifique se os dados estão corretos para garantir a entrega.</Text>
          </View>

          <Button 
              mode="contained" 
              onPress={handleSave} 
              loading={loading}
              style={styles.saveButton}
              contentStyle={{height: 50}}
              labelStyle={{fontSize: 16, fontWeight: 'bold'}}
          >
              Salvar endereço
          </Button>
          
          <View style={{height: 30}}/>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  
  header: { backgroundColor: theme.colors.secondary, paddingTop: Platform.OS === 'android' ? 30 : 0 },
  headerContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 15 },
  headerTitle: { fontSize: 18, color: '#333', fontWeight: '500' },
  
  content: { padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 15 },
  
  input: { backgroundColor: '#fff', fontSize: 16, marginBottom: 15 },
  row: { flexDirection: 'row' },
  
  footerInfo: { 
    flexDirection: 'row', 
    backgroundColor: '#f5f5f5', 
    padding: 15, 
    borderRadius: 6, 
    marginBottom: 20, 
    alignItems: 'center' 
  },
  footerText: { fontSize: 12, color: '#666', marginLeft: 10, flex: 1 },

  saveButton: { 
    backgroundColor: theme.colors.primary, 
    borderRadius: 6 
  },
});