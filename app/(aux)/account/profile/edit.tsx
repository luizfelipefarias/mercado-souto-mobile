import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  Platform,
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView
} from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../../../../src/constants/theme';
import { useAuth } from '../../../../src/context/AuthContext';
import api from '../../../../src/services/api';
import { TextInput as RNTextInput } from 'react-native'; 
import Toast from 'react-native-toast-message';

export default function EditProfile() {
  const router = useRouter();
  const { user, refreshUserProfile, isGuest } = useAuth(); 
  
  const currentName = user?.name || '';
  const currentEmail = user?.email || '';

  const [name, setName] = useState(currentName);
  const [email, setEmail] = useState(currentEmail);
  const [loading, setLoading] = useState(false);

  const hasChanges = name !== currentName || email !== currentEmail;


  const handleSave = async () => {
    if (!name.trim() || !email.trim()) {
      Alert.alert('Atenção', 'Preencha todos os campos.');
      return;
    }
    
    if (!hasChanges) {
      Toast.show({ type: 'info', text1: 'Nenhuma alteração detectada.' });
      router.back();
      return;
    }

    setLoading(true);

    try {
      const userId = user?.id;

      if (!userId) {
        Alert.alert('Erro', 'Sessão inválida. Faça login novamente.');
        return;
      }
      
      const updatedData = {
        name: name,
        email: email,
        cpf: user?.cpf,
        phone: user?.phone,
      };

      await api.put(`/api/client/${userId}`, updatedData);
      
      
      Toast.show({ type: 'success', text1: 'Sucesso!', text2: 'Dados atualizados.' });
      
      router.back();

    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      Toast.show({ type: 'error', text1: 'Erro', text2: 'Não foi possível salvar os dados.' });
    } finally {
      setLoading(false);
    }
  };

  if (isGuest) {
      return (
          <SafeAreaView style={styles.container}>
              <View style={styles.header}>
                  <TouchableOpacity onPress={() => router.back()} style={{ padding: 10 }}>
                      <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
                  </TouchableOpacity>
                  <Text style={styles.headerTitle}>Meus dados</Text>
                  <View style={{ width: 44 }} />
              </View>
              <View style={styles.guestMessage}>
                  <MaterialCommunityIcons name="lock" size={60} color="#ccc" />
                  <Text style={styles.guestText}>Faça login para editar seus dados de perfil.</Text>
              </View>
          </SafeAreaView>
      );
  }


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
          <RNTextInput 
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Digite seu nome"
            placeholderTextColor="#999"
          />

          <Text style={styles.label}>E-mail</Text>
          <RNTextInput 
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder="Digite seu e-mail"
            placeholderTextColor="#999"
          />

          {/* Dados não editáveis */}
          <Text style={styles.label}>CPF</Text>
          <RNTextInput
            style={[styles.input, styles.disabledInput]}
            value={user?.cpf || 'Não informado'}
            editable={false}
          />
          
          <Text style={styles.label}>Telefone</Text>
          <RNTextInput
            style={[styles.input, styles.disabledInput]}
            value={user?.phone || 'Não informado'}
            editable={false}
          />


          <View style={styles.infoBox}>
            <MaterialCommunityIcons name="information-outline" size={20} color="#666" style={{marginRight: 8}}/>
            <Text style={styles.infoText}>
              Para mudar o CPF ou Telefone, entre em contato com o suporte.
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.saveBtn, loading || !hasChanges ? { opacity: 0.5, backgroundColor: theme.colors.primary } : {backgroundColor: theme.colors.primary}]}
            onPress={handleSave}
            disabled={loading || !hasChanges}
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
    paddingHorizontal: 15,
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
  
  disabledInput: {
      color: '#aaa',
      backgroundColor: '#f9f9f9',
      borderBottomWidth: 0,
      paddingVertical: 10
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
  },
  
  guestMessage: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 40,
      backgroundColor: '#fff'
  },
  guestText: {
      marginTop: 15,
      fontSize: 16,
      color: '#666',
      textAlign: 'center'
  }
});