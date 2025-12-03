import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as NavigationBar from 'expo-navigation-bar';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import { Button, Text, TextInput } from 'react-native-paper';
import GoogleLogo from '../assets/img/logo-google.svg';
import { theme } from '../constants/theme';
import { useAuth } from '../context/AuthContext';

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

  const validateEmail = (email: string) => /\S+@\S+\.\S+/.test(email);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  const handleRegister = async () => {
    if (!form.nome || !form.email || !form.cpf || !form.password || !form.telefone) {
      return Alert.alert('Atenção', 'Preencha todos os campos.');
    }

    if (!validateEmail(form.email)) {
      return Alert.alert('E-mail Inválido', 'Verifique o e-mail.');
    }

    if (form.cpf.length < 14) {
      return Alert.alert('CPF Inválido', 'CPF incompleto.');
    }

    const cleanCPF = form.cpf.replace(/\D/g, '');
    const cleanPhone = form.telefone.replace(/\D/g, '');

    await signUp({
      name: form.nome,
      email: form.email,
      cpf: cleanCPF,
      password: form.password,
      phone: cleanPhone,
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.yellowHeader}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>

        <View style={styles.logoContainer}>
          <Image
            source={require('../assets/img/logo-img.png')}
            style={styles.logoImage}
          />

          <Text style={styles.headerTitle}>
            Crie sua conta e compre com frete grátis
          </Text>
        </View>
      </View>

      <View style={styles.whiteCard}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <TouchableOpacity style={styles.googleBtn}>
            <GoogleLogo width={24} height={24} style={{ marginRight: 15 }} />
            <Text style={styles.googleText}>Cadastra-se com Google</Text>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.line} />
            <Text style={styles.orText}>OU preencha seus dados</Text>
            <View style={styles.line} />
          </View>

          <TextInput
            label="E-mail"
            value={form.email}
            onChangeText={(t) =>
              setForm({ ...form, email: t.toLowerCase().replace(/\s/g, '') })
            }
            onFocus={() => setExpanded(true)}
            style={styles.input}
            mode="outlined"
            outlineColor={expanded ? '#ddd' : theme.colors.primary}
            activeOutlineColor={theme.colors.primary}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          {expanded && (
            <View>
              <TextInput
                label="Telefone"
                placeholder="(99) 99999-9999"
                value={form.telefone}
                onChangeText={(t) => setForm({ ...form, telefone: formatPhone(t) })}
                style={styles.input}
                mode="outlined"
                outlineColor="#ddd"
                activeOutlineColor={theme.colors.primary}
                keyboardType="phone-pad"
                maxLength={15}
              />

              <TextInput
                label="Nome completo"
                value={form.nome}
                onChangeText={(t) => setForm({ ...form, nome: t })}
                style={styles.input}
                mode="outlined"
                outlineColor="#ddd"
                activeOutlineColor={theme.colors.primary}
              />

              <TextInput
                label="CPF"
                value={form.cpf}
                onChangeText={(t) => setForm({ ...form, cpf: formatCPF(t) })}
                style={styles.input}
                mode="outlined"
                keyboardType="numeric"
                outlineColor="#ddd"
                activeOutlineColor={theme.colors.primary}
                maxLength={14}
              />

              <TextInput
                label="Senha"
                value={form.password}
                onChangeText={(t) => setForm({ ...form, password: t })}
                style={styles.input}
                mode="outlined"
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

              <View style={{ height: 20 }} />
            </View>
          )}
        </ScrollView>

        {expanded && (
          <View style={styles.footerContainer}>
            <Button
              mode="contained"
              onPress={handleRegister}
              loading={loading}
              style={styles.mainBtn}
              contentStyle={{ height: 50 }}
              labelStyle={{ fontSize: 18, fontWeight: 'bold' }}
            >
              Continuar
            </Button>
          </View>
        )}
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

  input: { marginBottom: 15, backgroundColor: '#fff', fontSize: 16 },

  footerContainer: {
    paddingHorizontal: 25,
    paddingTop: 10,
    paddingBottom: 30,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },

  mainBtn: {
    borderRadius: 8,
    backgroundColor: theme.colors.primary,
  },
});
