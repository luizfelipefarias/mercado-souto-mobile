import { View, Text, Image, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';


const textInputStyle = "border border-outline-300 rounded-md p-3 text-base w-full bg-background-0 text-typography-900";

const PRIMARY_COLOR_TEXT = "text-[#6366F1]";
const PRIMARY_COLOR_BORDER = "border-[#6366F1]";

export default function CadastroScreen() {

  const handleGoogleRegister = () => {
      console.log('Iniciando cadastro com Google...');
    
  };

  const handleContinue = () => {
      console.log('Continuar cadastro...');
      
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      
      <View className="w-full h-1/4 bg-secondary-500 items-center justify-center p-6 rounded-b-3xl">
        <TouchableOpacity
          onPress={() => router.back()}
          className="absolute top-14 left-4 p-2"
        >
          <Ionicons name="arrow-back" size={28} color="#111827" />
        </TouchableOpacity>

        <Image
          source={require('../../../assets/images/logoMercadoSouto.png')}
          className="w-30 h-25"
          resizeMode="contain"
        />
        <Text className="text-xl font-bold text-typography-900 text-center mt-2">
          Crie sua conta e compre com frete grátis
        </Text>
      </View>


     
      <ScrollView
        className="flex-1 bg-white -mt-10 rounded-t-3xl p-6"
        showsVerticalScrollIndicator={false}
      >
        <View className="items-center space-y-5 pt-4">

          
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
        >
         
          <Image 
            source={require('../../../assets/images/google-icon.png')} 
            style={{ width: 24, height: 24 }} 
          />
          <Text style={{ fontSize: 16, fontWeight: '700', color: '#111827' }}>
            Fazer login com o Google
          </Text>
        </TouchableOpacity>


          <View className="w-full flex-row items-center space-x-3 my-2">
            <View className="flex-1 h-px bg-outline-300" />
            <Text className="text-sm text-typography-500">OU preencha seus dados</Text>
            <View className="flex-1 h-px bg-outline-300" />
          </View>

        
          <View className="w-full space-y-5">
            <View className="w-full">
              <Text className="text-sm font-medium text-typography-700 mb-1">E-mail</Text>
              <TextInput className={textInputStyle} placeholder="exemplo@email.com" keyboardType="email-address" />
            </View>
            <View className="w-full">
              <Text className="text-sm font-medium text-typography-700 mb-1">Telefone</Text>
              <TextInput className={textInputStyle} placeholder="+55 81 9..." keyboardType="phone-pad" />
            </View>
            <View className="w-full">
              <Text className="text-sm font-medium text-typography-700 mb-1">Nome</Text>
              <TextInput className={textInputStyle} placeholder="Seu nome completo" />
            </View>
            <View className="w-full">
              <Text className="text-sm font-medium text-typography-700 mb-1">Senha</Text>
              <TextInput className={textInputStyle} placeholder="Crie uma senha" secureTextEntry />
            </View>
          </View>

          <TouchableOpacity
            className="w-full bg-primary-500 p-4 rounded-lg shadow mt-4"
            onPress={handleContinue}
          >
            <Text className="text-white text-center font-bold text-lg">
              Continuar
            </Text>
          </TouchableOpacity>
        </View>
        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
}