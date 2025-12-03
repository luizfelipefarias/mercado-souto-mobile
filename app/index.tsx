import { useRouter } from 'expo-router';
import * as NavigationBar from 'expo-navigation-bar';
import React, { useEffect } from 'react';
import { Image, Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';
import { theme } from '../constants/theme';
import { useAndroidNavigationBar } from '../hooks/useAndroidNavigationBar';

export default function Welcome() {
  const router = useRouter();
useAndroidNavigationBar(true);
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

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.guestButton} onPress={() => router.push('/home')}>
        <Text style={styles.guestText}>Continuar como visitante</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        <Image
          source={require('../assets/img/van-logo.png')}
          style={styles.vanImage}
          resizeMode="contain"
        />

        <Text style={styles.title}>
          Frete grátis e entrega em menos de 24 horas
        </Text>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.btnSecondary} onPress={() => router.push('/login')}>
          <Text style={styles.btnTextBlue}>Iniciar sessão</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btnSecondary, { marginTop: 10 }]}
          onPress={() => router.push('/register')}
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

  guestButton: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 20,
  },

  guestText: {
    color: theme.colors.primary,
    fontWeight: '500',
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
    padding: 20,
    paddingBottom: 50,
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
