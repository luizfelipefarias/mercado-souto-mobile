import React, { useState } from 'react';
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
import { Text, TextInput, Button, HelperText } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../../../../src/constants/theme';
import api from '../../../../src/services/api';
import { useAuth } from '../../../../src/context/AuthContext';

export default function ChangePassword() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const hasErrors = () => newPassword.length > 0 && newPassword.length < 6;
  const passwordsMatch = () => newPassword === confirmPassword;

  const handleUpdatePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Atenção', 'Preencha todos os campos.');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Senha fraca', 'A nova senha deve ter pelo menos 6 caracteres.');
      return;
    }

    if (!passwordsMatch()) {
      Alert.alert('Erro', 'A nova senha e a confirmação não conferem.');
      return;
    }

    setLoading(true);

    try {
      const userId = (user as any)?.id;

      const currentData = await api.get(`/api/client/${userId}`);
      
      const { name, email, cpf, phone } = currentData.data;

      await api.put(`/api/client/${userId}`, {
        name,
        email,
        cpf,
        phone,
        password: newPassword 
      });

      Alert.alert('Sucesso', 'Sua senha foi alterada com sucesso!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
      
    } catch (err: any) {
      console.error(err);
      const errorMessage =
        err.response?.data?.message ||
        'Não foi possível alterar a senha. Tente novamente.';

      Alert.alert('Erro', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={theme.colors.secondary}
      />

      <SafeAreaView style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Alterar senha</Text>

          <View style={{ width: 24 }} />
        </View>
      </SafeAreaView>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.description}>
            Para sua segurança, preencha os dados abaixo.
          </Text>

          <View style={styles.inputContainer}>
            <TextInput
              label="Senha atual"
              mode="outlined"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry={!showCurrent}
              activeOutlineColor={theme.colors.primary}
              right={
                <TextInput.Icon
                  icon={showCurrent ? 'eye-off' : 'eye'}
                  onPress={() => setShowCurrent(!showCurrent)}
                />
              }
              style={styles.input}
            />
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              label="Nova senha"
              mode="outlined"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry={!showNew}
              activeOutlineColor={theme.colors.primary}
              right={
                <TextInput.Icon
                  icon={showNew ? 'eye-off' : 'eye'}
                  onPress={() => setShowNew(!showNew)}
                />
              }
              style={styles.input}
            />
            <HelperText type="error" visible={hasErrors()}>
              A senha deve ter no mínimo 6 caracteres.
            </HelperText>
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              label="Confirmar nova senha"
              mode="outlined"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirm}
              activeOutlineColor={theme.colors.primary}
              error={newPassword !== '' && !passwordsMatch()}
              right={
                <TextInput.Icon
                  icon={showConfirm ? 'eye-off' : 'eye'}
                  onPress={() => setShowConfirm(!showConfirm)}
                />
              }
              style={styles.input}
            />
            {newPassword !== '' && !passwordsMatch() && (
              <HelperText type="error" visible>
                As senhas não coincidem.
              </HelperText>
            )}
          </View>

          <Button
            mode="contained"
            onPress={handleUpdatePassword}
            loading={loading}
            disabled={loading}
            style={styles.button}
            labelStyle={{ fontWeight: 'bold', fontSize: 16 }}
          >
            Salvar nova senha
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  header: {
    backgroundColor: theme.colors.secondary,
    paddingTop: Platform.OS === 'android' ? 30 : 0
  },

  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15
  },

  headerTitle: { fontSize: 18, color: '#333', fontWeight: '500' },

  content: { padding: 20 },

  description: {
    color: '#666',
    fontSize: 14,
    marginBottom: 20,
    lineHeight: 20
  },

  inputContainer: { marginBottom: 10 },

  input: { backgroundColor: '#fff' },

  button: {
    marginTop: 20,
    backgroundColor: theme.colors.primary,
    borderRadius: 6,
    paddingVertical: 6
  }
});