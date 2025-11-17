import { View, Text, TextInput, TouchableOpacity, ScrollView, Image } from 'react-native'; 
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function LoginEmailScreen() {
  const insets = useSafeAreaInsets();

  const handleContinuar = () => {
    router.push('/auth/(tabs)/login-senha');
  };

  const handleLoginGoogle = () => {
    console.log('Iniciando login com Google...');
    
  };
  
  
  const handleEsqueceuSenha = () => {
    
    router.push('/auth/(tabs)/esqueceu-senha');
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
          Digite seu e-mail para iniciar sessão
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
          }}
          onPress={handleContinuar}
        >
          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 18 }}>
            Continuar
          </Text>
        </TouchableOpacity>

       
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginVertical: 16 }}>
          <View style={{ flex: 1, height: 1, backgroundColor: '#D1D5DB' }} />
          <Text style={{ color: '#6B7280' }}>OU</Text>
          <View style={{ flex: 1, height: 1, backgroundColor: '#D1D5DB' }} />
        </View>

        
        <TouchableOpacity
          style={{
            width: '100%',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 12, 
            borderWidth: 1,
            borderColor: '#D1D5DB',
            paddingVertical: 12, 
            paddingHorizontal: 12,
            borderRadius: 12,
          }}
          onPress={handleLoginGoogle} 
        >
          
          <Image 
            source={require('../../../assets/images/google-icon.png')} 
            style={{ width: 24, height: 24 }} 
          />
          <Text style={{ fontSize: 16, fontWeight: '700', color: '#111827' }}>
            Fazer login com o Google
          </Text>
        </TouchableOpacity>

        
        <TouchableOpacity 
          style={{ marginTop: 16 }}
          onPress={handleEsqueceuSenha} 
        >
          <Text style={{ fontSize: 16, fontWeight: '700', color: '#6366F1', textAlign: 'center' }}>
            Esqueceu senha
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}