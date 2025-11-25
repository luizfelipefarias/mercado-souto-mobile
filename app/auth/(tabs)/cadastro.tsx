import React, { useState } from 'react';
import { View, Text, Image, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';


const textInputStyle = "border border-outline-300 rounded-lg p-3 text-base w-full bg-background-0 text-typography-900 focus:border-primary-500 transition duration-150";

const PRIMARY_COLOR_TEXT = "text-primary-500";
const PRIMARY_COLOR_BORDER = "border-primary-500";

export default function CadastroScreen() {
  // 1. Estado para gerenciar os campos do formulário
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Para feedback visual

  const handleGoogleRegister = () => {
      console.log('Iniciando cadastro com Google...');
    
  };

  const handleContinue = () => {
      // 2. Lógica de validação e envio
      if (!email || !phone || !name || !password) {
        console.error('Por favor, preencha todos os campos.');
        // Em um app real, você mostraria uma mensagem de erro na UI
        return;
      }

      setIsLoading(true);
      console.log('Tentativa de Cadastro com os seguintes dados:', {
        email,
        phone,
        name,
        password,
      });

      // Lógica de API/Autenticação iria aqui...
      // Por exemplo:
      // try {
      //   await api.registerUser({ email, phone, name, password });
      //   router.replace('/home');
      // } catch (error) {
      //   console.error(error);
      // } finally {
      //   setIsLoading(false);
      // }
      
      // Simulação de delay
      setTimeout(() => {
        setIsLoading(false);
        // Em um app real, navegaria para a próxima tela
        console.log('Cadastro simulado concluído.');
      }, 2000);

  };

  return (

    <SafeAreaView className="flex-1 bg-background-0">

      {/* HEADER AJUSTADO */}
      <View className="w-full bg-secondary-500 items-center justify-center p-6 pt-12 rounded-b-3xl"> 
        <TouchableOpacity
          onPress={() => router.back()}
          className="absolute top-6 left-4 p-2 z-10" 
        >
          <Ionicons name="arrow-back" size={28} color="rgb(var(--color-typography-900))" />
        </TouchableOpacity>

        <Image
          source={require('../../../assets/images/logoMercadoSouto.png')}
          // AJUSTE NA LARGURA E ALTURA (w-20 h-20) E MARGENS (mt-4 mb-2)
          className="w-20 h-20 mt-4 mb-2" 
          resizeMode="contain"
        />
        <Text className="text-xl font-bold text-typography-900 text-center mb-4">
          Crie sua conta e compre com frete grátis
        </Text>
      </View>


     
      <ScrollView
        className={`flex-1 bg-background-0 -mt-8 rounded-t-3xl p-6 shadow-xl shadow-typography-400`} 
        showsVerticalScrollIndicator={false}
      >
        <View className="items-center space-y-6 pt-4">

          
          <TouchableOpacity
          onPress={handleGoogleRegister}
          style={{
            width: '100%',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 12, 
            borderWidth: 1.5,
            borderColor: 'rgb(var(--color-outline-300))', // Borda
            paddingVertical: 14, 
            borderRadius: 12,
          }}
          className="bg-background-0"
        >
         
          <Image 
            source={require('../../../assets/images/google-icon.png')} 
            style={{ width: 20, height: 20 }} 
          />
          <Text 
            style={{ fontSize: 16, fontWeight: '700' }} 
            className="text-typography-900"
          >
            Cadastrar-se com o Google
          </Text>
        </TouchableOpacity>

          <View className="w-full flex-row items-center space-x-3 my-4">
            <View className="flex-1 h-px bg-outline-300" />
            <Text className="text-sm text-typography-500">OU preencha seus dados</Text>
            <View className="flex-1 h-px bg-outline-300" />
          </View>


          <View className="w-full space-y-5">
            <View className="w-full">
              <Text className="text-sm font-medium text-typography-700 mb-1">E-mail</Text>
              {/* Adicionado value e onChangeText para o estado do email */}
              <TextInput 
                className={textInputStyle} 
                placeholder="exemplo@email.com" 
                keyboardType="email-address" 
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
              />
            </View>
            <View className="w-full">
              <Text className="text-sm font-medium text-typography-700 mb-1">Telefone</Text>
              {/* Adicionado value e onChangeText para o estado do telefone */}
              <TextInput 
                className={textInputStyle} 
                placeholder="+55 81 9..." 
                keyboardType="phone-pad" 
                value={phone}
                onChangeText={setPhone}
              />
            </View>
            <View className="w-full">
              <Text className="text-sm font-medium text-typography-700 mb-1">Nome</Text>
              {/* Adicionado value e onChangeText para o estado do nome */}
              <TextInput 
                className={textInputStyle} 
                placeholder="Seu nome completo" 
                value={name}
                onChangeText={setName}
              />
            </View>
            <View className="w-full">
              <Text className="text-sm font-medium text-typography-700 mb-1">Senha</Text>
              {/* Adicionado value e onChangeText para o estado da senha */}
              <TextInput 
                className={textInputStyle} 
                placeholder="Crie uma senha" 
                secureTextEntry 
                value={password}
                onChangeText={setPassword}
              />
            </View>
          </View>

          {/* BOTÃO CONTINUAR (desabilitado se estiver carregando) */}
          <TouchableOpacity
            className={`w-full p-4 rounded-lg shadow-md mt-4 active:opacity-80 ${isLoading ? 'bg-primary-300' : 'bg-primary-500'}`}
            onPress={handleContinue}
            disabled={isLoading}
          >
            <Text className="text-white text-center font-bold text-lg">
              {isLoading ? 'Cadastrando...' : 'Continuar'}
            </Text>
          </TouchableOpacity>
        </View>
        <View className="h-12" />
      </ScrollView>
    </SafeAreaView>
  );
}