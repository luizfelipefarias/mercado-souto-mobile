import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { Image, Platform, StyleSheet, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { Text } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { theme } from '../src/constants/theme';
import { useAndroidNavigationBar } from '../src/hooks/useAndroidNavigationBar';
import { useAuth } from '../src/context/AuthContext'; 

export default function Welcome() {
  const router = useRouter();
  const { user, loading, loginAsGuest } = useAuth(); 

  useAndroidNavigationBar(true);


  useEffect(() => {
    if (!loading && user) {
      router.replace('/(tabs)');
    }
    
  }, [user, loading, router]);

  const handleGuestAccess = async () => {
    if (loginAsGuest) {
      await loginAsGuest(); 
    }
    

    router.replace('/(tabs)');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }


  return (
    <View style={styles.container}>

      <TouchableOpacity 
        style={styles.guestButton} 
        onPress={handleGuestAccess}
        activeOpacity={0.7}
      >
        <Text style={styles.guestText}>Continuar como visitante</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        <Image
          source={require('../src/assets/img/ui/van-logo.png')}
          style={styles.vanImage}
          resizeMode="contain"
        />

        <Text style={styles.title}>
          Frete grátis e entrega em menos de 24 horas
        </Text>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.btnSecondary} 
          onPress={() => router.push('/(auth)/login' as any)}
        >
          <Text style={styles.btnTextBlue}>Iniciar sessão</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btnSecondary, { marginTop: 10 }]}
          onPress={() => router.push('/(auth)/register' as any)}
        >
          <Text style={styles.btnTextBlue}>Criar conta</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  loadingContainer: {
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#fff'
  },
  guestButton: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 20,
    padding: 10, 
  },
  guestText: {
    color: theme.colors.primary,
    fontWeight: '500',
    fontSize: 16,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  vanImage: {
    width: 250,
    height: 180,
    marginBottom: 10,
  },
  title: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    fontWeight: '400',
    marginTop: 20,
  },
  footer: {
    padding: 30,
    paddingBottom: 90,
  },
  btnSecondary: {
    backgroundColor: '#e3edfb', 
    paddingVertical: 14,
    borderRadius: 6,
    alignItems: 'center',
  },
  btnTextBlue: {
    color: theme.colors.primary, 
    fontWeight: 'bold',
    fontSize: 15,
  },
});