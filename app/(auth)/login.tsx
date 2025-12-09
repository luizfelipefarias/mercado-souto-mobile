import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import { TextInput, Button, Text, HelperText } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useAuth } from '@/context/AuthContext';
import { theme } from '@/constants/theme';
import { useAndroidNavigationBar } from '@/hooks/useAndroidNavigationBar';
import GoogleLogo from '@/assets/img/ui/logo-google.svg';

export default function Login() {
  const { signIn, loading } = useAuth();
  const router = useRouter();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [secureText, setSecureText] = useState(true);

  const [identifierError, setIdentifierError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useAndroidNavigationBar(true);

  function formatPhone(text: string) {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length <= 11) {
      return cleaned
        .replace(/^(\d{2})(\d)/g, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2');
    }
    return text;
  }

  function handleIdentifier(text: string) {
    setIdentifierError('');
    if (/^\d/.test(text) || text.includes('(')) {
      setIdentifier(formatPhone(text));
    } else {
      setIdentifier(text.trim());
    }
  }

  function isValidIdentifier() {
    const isEmail = identifier.includes('@') && identifier.includes('.');
    const isPhone = identifier.replace(/\D/g, '').length >= 10;
    return isEmail || isPhone;
  }

  function handleContinue() {
    if (!isValidIdentifier()) {
      setIdentifierError('Digite um e-mail válido.');
      return;
    }
    setExpanded(true);
  }

  function handlePassword(text: string) {
    setPassword(text);
    if (passwordError) setPasswordError('');
  }

  function handleEditIdentifier() {
    setExpanded(false);
    setPassword('');
    setPasswordError('');
  }

  async function handleLogin() {
    if (!password.trim()) {
      setPasswordError('Digite sua senha.');
      return;
    }

    try {
      const cleanIdentifier = identifier.includes('@')
        ? identifier.trim()
        : identifier.replace(/\D/g, '');

      const response: any = await signIn(cleanIdentifier, password);

      await AsyncStorage.setItem('@user_email', cleanIdentifier);

      if (response && response.token) {
        await AsyncStorage.setItem('@auth_token', response.token);
      }

      if (router.canDismiss()) router.dismissAll();

      setTimeout(() => {
        // CORREÇÃO: Redireciona para /(tabs) (o index), e não mais /(tabs)/home
        router.replace('/(tabs)');
      }, 100);

    } catch (error: any) {
      console.error(error);

      if (error?.response?.status === 401 || error?.response?.status === 403) {
        setPasswordError('Credenciais incorretas.');
        Toast.show({
          type: 'error',
          text1: 'Acesso negado',
          text2: 'E-mail ou senha inválidos.'
        });
        return;
      }

      Toast.show({
        type: 'error',
        text1: 'Erro de conexão',
        text2: 'Não foi possível conectar ao servidor.'
      });
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={router.back}>
              <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <Text style={styles.title}>
              {expanded
                ? 'Agora, digite sua senha'
                : 'Digite seu e-mail ou telefone'}
            </Text>

            <TextInput
              label="E-mail ou telefone"
              value={identifier}
              onChangeText={handleIdentifier}
              style={styles.input}
              mode="outlined"
              error={!!identifierError}
              outlineColor={expanded ? '#ddd' : theme.colors.primary}
              activeOutlineColor={theme.colors.primary}
              editable={!expanded}
              autoCapitalize="none"
              keyboardType={
                identifier.match(/^\d/) ? 'phone-pad' : 'email-address'
              }
              onSubmitEditing={handleContinue}
              right={
                expanded && (
                  <TextInput.Icon
                    icon="pencil"
                    onPress={handleEditIdentifier}
                  />
                )
              }
            />

            <HelperText type="error" visible={!!identifierError}>
              {identifierError}
            </HelperText>

            {expanded && (
              <>
                <TextInput
                  label="Senha"
                  value={password}
                  onChangeText={handlePassword}
                  secureTextEntry={secureText}
                  style={styles.input}
                  mode="outlined"
                  error={!!passwordError}
                  outlineColor={theme.colors.primary}
                  activeOutlineColor={theme.colors.primary}
                  autoFocus
                  onSubmitEditing={handleLogin}
                  right={
                    <TextInput.Icon
                      icon={secureText ? 'eye' : 'eye-off'}
                      onPress={() => setSecureText(!secureText)}
                    />
                  }
                />

                <HelperText type="error" visible={!!passwordError}>
                  {passwordError}
                </HelperText>
              </>
            )}

            <Button
              mode="contained"
              onPress={expanded ? handleLogin : handleContinue}
              loading={loading}
              disabled={loading}
              style={styles.mainBtn}
              contentStyle={{ height: 48 }}
              labelStyle={{ fontSize: 16, fontWeight: 'bold' }}
            >
              {expanded ? 'Entrar' : 'Continuar'}
            </Button>

            {!expanded && (
              <TouchableOpacity
                style={styles.createAccount}
                onPress={() => router.push('/(auth)/register')}
              >
                <Text style={styles.createAccountText}>Criar conta</Text>
              </TouchableOpacity>
            )}

            <View style={styles.divider}>
              <View style={styles.line} />
              <Text style={styles.or}>ou</Text>
              <View style={styles.line} />
            </View>

            <TouchableOpacity
              style={styles.googleBtn}
              onPress={() =>
                Toast.show({ type: 'info', text1: 'Em breve', text2: 'Login Social em desenvolvimento.' })
              }
            >
              <GoogleLogo width={20} height={20} style={{ marginRight: 10 }} />
              <Text style={styles.googleText}>Fazer login com Google</Text>
            </TouchableOpacity>

            {expanded && (
              <TouchableOpacity style={styles.forgot}>
                <Text style={styles.forgotText}>Esqueci minha senha</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.secondary,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scroll: {
    flexGrow: 1,
  },
  header: {
    backgroundColor: theme.colors.secondary,
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  content: {
    padding: 20,
    flex: 1,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 25,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#fff',
    fontSize: 16,
    marginBottom: 6,
  },
  mainBtn: {
    borderRadius: 6,
    backgroundColor: theme.colors.primary,
    marginTop: 10,
  },
  createAccount: {
    alignItems: 'center',
    marginTop: 20,
  },
  createAccountText: {
    fontSize: 15,
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 30,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#eee',
  },
  or: {
    marginHorizontal: 10,
    color: '#999',
    fontSize: 12,
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 6,
    paddingVertical: 12,
  },
  googleText: {
    color: '#333',
    fontWeight: 'bold',
    fontSize: 15,
  },
  forgot: {
    marginTop: 20,
    alignItems: 'center',
  },
  forgotText: {
    color: '#3483FA',
    fontSize: 14,
  },
});