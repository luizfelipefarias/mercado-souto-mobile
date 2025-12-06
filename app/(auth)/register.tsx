import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  Alert
} from 'react-native';

import { Button, Text, TextInput, HelperText } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as NavigationBar from 'expo-navigation-bar';
import { useRouter } from 'expo-router';

import GoogleLogo from '../../assets/img/ui/logo-google.svg';
import { theme } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';

export default function Register() {
  const { signUp, loading } = useAuth();
  const router = useRouter();

  const [expanded, setExpanded] = useState(false);
  const [secureText, setSecureText] = useState(true);

  const [form, setForm] = useState({
    nome: '',
    email: '',
    cpf: '',
    password: '',
    telefone: '',
  });

  const [errors, setErrors] = useState({
    nome: '',
    email: '',
    cpf: '',
    password: '',
    telefone: '',
  });

  useEffect(() => {
    if (Platform.OS === 'android') {
      NavigationBar.setVisibilityAsync('hidden');
      NavigationBar.setBehaviorAsync('overlay-swipe');
    }
    return () => {
      if (Platform.OS === 'android') {
        NavigationBar.setVisibilityAsync('visible');
      }
    };
  }, []);

  // --- Funções de Máscara ---
  const formatPhone = (value: string) => {
    value = value.replace(/\D/g, '');
    value = value.replace(/^(\d{2})(\d)/g, '($1) $2');
    value = value.replace(/(\d)(\d{4})$/, '$1-$2');
    return value;
  };

  const formatCPF = (value: string) => {
    value = value.replace(/\D/g, '');
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    return value;
  };

 
  const handleChange = (field: string, value: string) => {
    if (errors[field as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const validateEmail = (email: string) => /\S+@\S+\.\S+/.test(email);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  const handleRegister = async () => {
    let currentErrors = { nome: '', email: '', cpf: '', password: '', telefone: '' };
    let hasError = false;

    if (!form.email || !validateEmail(form.email)) {
      currentErrors.email = 'Digite um e-mail válido.';
      hasError = true;
    }
    if (!form.nome) {
      currentErrors.nome = 'Nome é obrigatório.';
      hasError = true;
    }
    if (!form.telefone || form.telefone.length < 14) {
      currentErrors.telefone = 'Telefone incompleto.';
      hasError = true;
    }
    if (!form.cpf || form.cpf.length < 14) {
      currentErrors.cpf = 'CPF incompleto.';
      hasError = true;
    }
    if (!form.password || form.password.length < 6) {
      currentErrors.password = 'A senha deve ter no mínimo 6 caracteres.';
      hasError = true;
    }

    if (hasError) {
      setErrors(currentErrors);
      return;
    }

    try {
      const cleanCPF = form.cpf.replace(/\D/g, '');
      const cleanPhone = form.telefone.replace(/\D/g, '');

      await signUp({
        name: form.nome,
        email: form.email,
        cpf: cleanCPF,
        password: form.password,
        phone: cleanPhone,
      });
      
    } catch (error: any) {
      console.log('Erro no cadastro:', error);
      Alert.alert("Erro", "Não foi possível criar a conta. Verifique os dados ou tente mais tarde.");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.yellowHeader}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>

        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/img/ui/logo-img.png')}
            style={styles.logoImage}
          />
          <Text style={styles.headerTitle}>
            Crie sua conta e compre com frete grátis
          </Text>
        </View>
      </View>


      <View style={styles.whiteCard}>
        <KeyboardAvoidingView 
           behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
           style={{ flex: 1 }}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContent} 
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled" 
          >
            <TouchableOpacity 
              style={styles.googleBtn}
              onPress={() => Alert.alert("Em breve", "Cadastro com Google indisponível no momento.")}
            >
              <GoogleLogo width={24} height={24} style={{ marginRight: 15 }} />
              <Text style={styles.googleText}>Cadastrar-se com Google</Text>
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.line} />
              <Text style={styles.orText}>OU preencha seus dados</Text>
              <View style={styles.line} />
            </View>

            <TextInput
              label="E-mail"
              value={form.email}
              onChangeText={(t) => handleChange('email', t.toLowerCase().replace(/\s/g, ''))}
              onFocus={() => setExpanded(true)}
              style={styles.input}
              mode="outlined"
              error={!!errors.email}
              outlineColor={expanded ? '#ddd' : theme.colors.primary}
              activeOutlineColor={theme.colors.primary}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <HelperText type="error" visible={!!errors.email}>{errors.email}</HelperText>

            {expanded && (
              <View>
          
                <TextInput
                  label="Telefone"
                  placeholder="(99) 99999-9999"
                  value={form.telefone}
                  onChangeText={(t) => handleChange('telefone', formatPhone(t))}
                  style={styles.input}
                  mode="outlined"
                  error={!!errors.telefone}
                  outlineColor="#ddd"
                  activeOutlineColor={theme.colors.primary}
                  keyboardType="phone-pad"
                  maxLength={15}
                />
                <HelperText type="error" visible={!!errors.telefone}>{errors.telefone}</HelperText>

                <TextInput
                  label="Nome completo"
                  value={form.nome}
                  onChangeText={(t) => handleChange('nome', t)}
                  style={styles.input}
                  mode="outlined"
                  error={!!errors.nome}
                  outlineColor="#ddd"
                  activeOutlineColor={theme.colors.primary}
                  autoCapitalize="words"
                />
                <HelperText type="error" visible={!!errors.nome}>{errors.nome}</HelperText>


                <TextInput
                  label="CPF"
                  value={form.cpf}
                  onChangeText={(t) => handleChange('cpf', formatCPF(t))}
                  style={styles.input}
                  mode="outlined"
                  error={!!errors.cpf}
                  keyboardType="numeric"
                  outlineColor="#ddd"
                  activeOutlineColor={theme.colors.primary}
                  maxLength={14}
                />
                <HelperText type="error" visible={!!errors.cpf}>{errors.cpf}</HelperText>

            
                <TextInput
                  label="Senha"
                  value={form.password}
                  onChangeText={(t) => handleChange('password', t)}
                  style={styles.input}
                  mode="outlined"
                  error={!!errors.password}
                  secureTextEntry={secureText}
                  outlineColor="#ddd"
                  activeOutlineColor={theme.colors.primary}
                  right={
                    <TextInput.Icon
                      icon={secureText ? 'eye-off' : 'eye'}
                      onPress={() => setSecureText(!secureText)}
                      forceTextInputFocus={false}
                    />
                  }
                />
                <HelperText type="error" visible={!!errors.password}>{errors.password}</HelperText>

                <View style={{ height: 20 }} />
          
                <Button
                  mode="contained"
                  onPress={handleRegister}
                  loading={loading}
                  disabled={loading}
                  style={styles.mainBtn}
                  contentStyle={{ height: 50 }}
                  labelStyle={{ fontSize: 18, fontWeight: 'bold' }}
                >
                  Continuar
                </Button>
                <View style={{ height: 40 }} />
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.secondary },

  yellowHeader: {
    height: 190,
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 35,
  },

  backButton: { marginBottom: 10, width: 40 },

  logoContainer: { alignItems: 'center', justifyContent: 'center' },

  logoImage: {
    width: 200,
    height: 80,
    resizeMode: 'contain',
    marginBottom: 10,
  },

  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
    paddingHorizontal: 20,
  },

  whiteCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 20,
    overflow: 'hidden',
  },

  scrollContent: { paddingHorizontal: 25, paddingBottom: 20 },

  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: '#E0E0E0',
    borderWidth: 1.5,
    marginBottom: 25,
    borderRadius: 8,
    paddingVertical: 14,
    backgroundColor: '#fff',
  },

  googleText: { color: '#333', fontWeight: 'bold', fontSize: 16 },

  divider: { flexDirection: 'row', alignItems: 'center', marginBottom: 25 },

  line: { flex: 1, height: 1, backgroundColor: '#E0E0E0' },

  orText: { marginHorizontal: 15, color: '#888', fontSize: 14, fontWeight: '500' },

  input: { marginBottom: 2, backgroundColor: '#fff', fontSize: 16 }, 

  mainBtn: {
    borderRadius: 8,
    backgroundColor: theme.colors.primary,
    marginTop: 10
  },
});