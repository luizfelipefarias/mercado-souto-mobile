import React, { useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  Platform
} from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';

export default function EditProfile() {
  const router = useRouter();
  const { user, setUser } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [loading, setLoading] = useState(false);

  const handleSave = () => {
    if (!name.trim() || !email.trim()) {
      Alert.alert('Atenção', 'Preencha todos os campos.');
      return;
    }

    setLoading(true);

    try {
      const updatedUser = {
        ...user,
        name,
        email
      };

      setUser(updatedUser as any);

      Alert.alert('Sucesso', 'Dados atualizados com sucesso!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar os dados.');
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

      <View style={styles.form}>
        <Text style={styles.label}>Nome completo</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>E-mail</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.infoText}>
          Para mudar o CPF ou Documento, entre em contato com o suporte.
        </Text>

        <TouchableOpacity
          style={[styles.saveBtn, loading && { opacity: 0.6 }]}
          onPress={handleSave}
          disabled={loading}
        >
          <Text style={styles.saveText}>
            {loading ? 'Salvando...' : 'Salvar alterações'}
          </Text>
        </TouchableOpacity>
      </View>
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
    paddingHorizontal: 10,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: '500'
  },

  form: {
    padding: 20
  },

  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
    marginTop: 15
  },

  input: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.primary,
    fontSize: 16,
    paddingVertical: 5,
    color: '#333'
  },

  infoText: {
    marginTop: 20,
    color: '#999',
    fontSize: 12
  },

  saveBtn: {
    marginTop: 40,
    backgroundColor: '#3483fa',
    padding: 15,
    borderRadius: 6,
    alignItems: 'center'
  },

  saveText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  }
});
