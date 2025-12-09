import React, { useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  Platform,
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView
} from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../../../../src/constants/theme';
import { useAuth } from '../../../../src/context/AuthContext';
import api from '../../../../src/services/api';

export default function EditProfile() {
  const router = useRouter();
  const { user, setUser } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim() || !email.trim()) {
      Alert.alert('Atenção', 'Preencha todos os campos.');
      return;
    }

    setLoading(true);

    try {
      const userId = (user as any)?.id;

      const currentDataResponse = await api.get(`/api/client/${userId}`);
      const currentData = currentDataResponse.data;

      const updatedData = {
        ...currentData,
        name: name,
        email: email
      };

      await api.put(`/api/client/${userId}`, updatedData);

      if (setUser) {
        setUser({
          ...user,
          name: name,
          email: email
        } as any);
      }

      Alert.alert('Sucesso', 'Dados atualizados com sucesso!', [
        { text: 'OK', onPress: () => router.back() }
      ]);

    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      Alert.alert('Erro', 'Não foi possível salvar os dados. Verifique sua conexão.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 10 }}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Meus dados</Text>

        <View style={{ width: 44 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.form}>
          <Text style={styles.label}>Nome completo</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Digite seu nome"
            placeholderTextColor="#ccc"
          />

          <Text style={styles.label}>E-mail</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder="Digite seu e-mail"
            placeholderTextColor="#ccc"
          />

          <View style={styles.infoBox}>
            <MaterialCommunityIcons name="information-outline" size={20} color="#666" style={{marginRight: 8}}/>
            <Text style={styles.infoText}>
              Para mudar o CPF ou Documento, entre em contato com o suporte.
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.saveBtn, loading && { opacity: 0.7 }]}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.saveText}>Salvar alterações</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? 30 : 0
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 5,
    paddingBottom: 10,
    backgroundColor: theme.colors.secondary,
    paddingTop: 10
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333'
  },

  form: {
    padding: 20
  },

  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    marginTop: 20
  },

  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    fontSize: 16,
    paddingVertical: 8,
    color: '#333'
  },

  infoBox: {
    flexDirection: 'row',
    marginTop: 30,
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center'
  },

  infoText: {
    color: '#666',
    fontSize: 12,
    flex: 1,
    lineHeight: 18
  },

  saveBtn: {
    marginTop: 40,
    backgroundColor: theme.colors.primary,
    padding: 15,
    borderRadius: 6,
    alignItems: 'center',
    height: 50,
    justifyContent: 'center'
  },

  saveText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  }
});