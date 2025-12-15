import React from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { Link, Stack, useRouter } from 'expo-router';
import { Text, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '@/constants/theme';

export default function NotFoundScreen() {
  const router = useRouter();

  return (
    <>
      <Stack.Screen options={{ title: 'Página não encontrada', headerShown: false }} />
      
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        
        <View style={styles.iconContainer}>
            <MaterialCommunityIcons 
                name="map-search-outline" 
                size={80} 
                color={theme.colors.primary} 
            />
        </View>

        <Text style={styles.title}>Ops! Tela não encontrada.</Text>
        
        <Text style={styles.subtitle}>
            Parece que o caminho que você tentou acessar não existe ou foi removido.
        </Text>

        <View style={styles.actions}>
            {/* Opção 1: Voltar para a Home (Tab) */}
            <Button 
                mode="contained" 
                onPress={() => router.replace('/(tabs)' as any)}
                style={styles.button}
                labelStyle={styles.buttonText}
                icon="home"
            >
                Ir para o Início
            </Button>

            {/* Opção 2: Voltar para a página anterior (se possível) */}
            {router.canGoBack() && (
                <Button 
                    mode="text" 
                    onPress={() => router.back()}
                    style={styles.textButton}
                    labelStyle={{ color: theme.colors.primary }}
                >
                    Voltar
                </Button>
            )}
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    backgroundColor: '#fff',
  },
  iconContainer: {
    marginBottom: 20,
    padding: 20,
    backgroundColor: '#f5f5f5',
    borderRadius: 100,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 22,
  },
  actions: {
    width: '100%',
    alignItems: 'center',
    gap: 10,
  },
  button: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 6,
    width: '100%',
    borderRadius: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  textButton: {
    width: '100%',
  }
});