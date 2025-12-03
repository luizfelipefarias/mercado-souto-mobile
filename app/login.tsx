import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { theme } from '../constants/theme';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAndroidNavigationBar } from '../hooks/useAndroidNavigationBar';

import GoogleLogo from '../assets/img/logo-google.svg'; 

export default function Login() {
  const { signIn, loading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [secureText, setSecureText] = useState(true);
useAndroidNavigationBar(true);
  const handleContinue = () => {
    if (email.length > 3) setExpanded(true);
  };

  return (
    <View style={styles.container}>
       
     
       <View style={styles.statusBarBackground} />

      
       <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
       </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.title}>Digite seu e-mail ou telefone para iniciar sessão</Text>

        <TextInput
          label="E-mail ou telefone"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          mode="outlined"
          outlineColor={expanded ? '#ddd' : theme.colors.primary}
          activeOutlineColor={theme.colors.primary}
          disabled={expanded}
        />

        {expanded && (
          <TextInput
            label="Senha"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={secureText}
            style={styles.input}
            mode="outlined"
            outlineColor="#ddd"
            activeOutlineColor={theme.colors.primary}
            right={<TextInput.Icon icon={secureText ? "eye" : "eye-off"} onPress={() => setSecureText(!secureText)} />}
          />
        )}

        <Button 
          mode="contained" 
          onPress={expanded ? () => signIn(email, password) : handleContinue}
          loading={loading}
          style={styles.mainBtn}
        >
          {expanded ? "Entrar" : "Continuar"}
        </Button>
        
        {!expanded && (
           <TouchableOpacity style={{ alignItems: 'center', marginTop: 15 }}>
             <Text style={{ color: theme.colors.primary, fontWeight: 'bold' }}>Criar conta</Text>
           </TouchableOpacity>
        )}

        <View style={styles.divider}>
           <View style={styles.line} /><Text style={styles.orText}>ou</Text><View style={styles.line} />
        </View>
        
        <TouchableOpacity 
          style={styles.googleBtn} 
          onPress={() => console.log('Google')}
        >
          
          <GoogleLogo width={20} height={20} style={{ marginRight: 10 }} />
          <Text style={{ color: '#333', fontWeight: 'bold' }}>Fazer login com o Google</Text>
        </TouchableOpacity>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  
  statusBarBackground: {
    backgroundColor: theme.colors.secondary, 
    height: Platform.OS === 'ios' ? 50 : 40, 
    width: '100%',
  },
  
  backButton: {
    marginTop: 10, 
    marginLeft: 15,
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  
  content: { padding: 20, paddingTop: 10 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 30 },
  input: { marginBottom: 15, backgroundColor: '#fff' },
  mainBtn: { borderRadius: 6, paddingVertical: 5, backgroundColor: theme.colors.primary },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 30 },
  line: { flex: 1, height: 1, backgroundColor: '#eee' },
  orText: { marginHorizontal: 10, color: '#999', fontSize: 12 },
  
 
  googleBtn: { 
    flexDirection: 'row', 
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: '#ddd', 
    borderWidth: 1, 
    borderRadius: 6, 
    paddingVertical: 12, 
    backgroundColor: '#fff'
  },
});