import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Link } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      
      
      <View style={styles.content}>
        <View style={styles.innerContent}>
          <Image
            source={require('../../../assets/images/van.png')}
            style={styles.image}
            resizeMode="contain"
          />
          <Text style={styles.title}>
            Frete grátis e entrega em menos de 24 horas
          </Text>
          <Text style={styles.subtitle}>
            Aproveite a experiência de comprar com rapidez e segurança!
          </Text>
        </View>
      </View>

      
      <View style={[styles.footer, { paddingBottom: insets.bottom || 24 }]}>
        <Link href="/auth/login" asChild>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Iniciar sessão</Text>
          </TouchableOpacity>
        </Link>

        <Link href="/auth/cadastro" asChild>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Criar conta</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
  },

  innerContent: {
    alignItems: 'center',
  },

  image: {
    width: SCREEN_WIDTH * 0.6,  
    aspectRatio: 1.2,           
  },

  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },

  footer: {
    paddingHorizontal: 24,
    paddingTop: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#E5E7EB',
  },

  button: {
    width: '100%',
    backgroundColor: '#6366F1',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
  },

  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 18,
    textAlign: 'center',
  },
});
