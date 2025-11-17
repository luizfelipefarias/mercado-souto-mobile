import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function EsqueceuSenhaScreen() {
  const insets = useSafeAreaInsets();

  const handleEnviarEmail = () => {
   
    console.log('Enviando e-mail de recuperação...');
    
    
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      
      
      <View style={{
        backgroundColor: '#F4C947',
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: insets.top,
        paddingHorizontal: 16,
        height: 56 + insets.top,
      }}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 8 }}>
          <Ionicons name="arrow-back" size={28} color="#111827" />
        </TouchableOpacity>
      </View>

     
      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 24, gap: 24 }}>
        <Text style={{ fontSize: 24, fontWeight: '700', color: '#111827' }}>
          Recuperar Senha
        </Text>
        
        <Text style={{ fontSize: 16, color: '#374151', lineHeight: 24 }}>
          Digite o e-mail associado à sua conta e enviaremos um link para você redefinir sua senha.
        </Text>
        
        
        <View style={{ width: '100%' }}>
          <Text style={{ fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 4 }}>
            Seu E-mail
          </Text>
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: '#D1D5DB',
              borderRadius: 12,
              padding: 12,
              fontSize: 16,
              backgroundColor: '#FFFFFF',
              color: '#111827',
            }}
            placeholder="exemplo@email.com"
            keyboardType="email-address"
          />
        </View>

        
        <TouchableOpacity
          style={{
            width: '100%',
            backgroundColor: '#6366F1',
            paddingVertical: 16,
            borderRadius: 12,
            alignItems: 'center',
            marginTop: 16, 
          }}
          onPress={handleEnviarEmail}
        >
          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 18 }}>
            Enviar E-mail de Recuperação
          </Text>
        </TouchableOpacity>
        
        
        <TouchableOpacity style={{ marginTop: 24 }} onPress={() => router.back()}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: '#6366F1', textAlign: 'center' }}>
            Lembrou da senha? Voltar para o Login
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}