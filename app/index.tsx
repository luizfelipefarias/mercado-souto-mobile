import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Image } from 'react-native'; 
import { Redirect } from 'expo-router';

// Duração que a tela de carregamento deve ser exibida (em milissegundos)
const SPLASH_DURATION = 1500; // 1.5 segundos

export default function LoadingScreen() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simula o tempo de carregamento de dados ou inicialização
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, SPLASH_DURATION);

    return () => clearTimeout(timer); // Limpa o timer ao desmontar
  }, []);

  // Se o carregamento terminar, redireciona para a tela de boas-vindas
  if (!isLoading) {
    // Redireciona para o seu novo arquivo welcome.tsx
    return <Redirect href="/auth/boas-vindas" />;
  }


  return (
    <View style={styles.container}>
      
 
      <Image 
        source={require('../assets/images/logoMercadoSouto.png')} 
        style={styles.logoImage}
        resizeMode="contain"
      />
      
      <ActivityIndicator size="large" color="#6366F1" style={{ marginTop: 20 }} />
      <Text style={styles.loadingText}>Carregando...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  logoImage: {
    width: 150, 
    height: 150, 
    marginBottom: 20, 
  },
  logoText: { 
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111827',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 10,
  }
});