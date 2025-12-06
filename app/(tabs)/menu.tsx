import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as NavigationBar from 'expo-navigation-bar';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo } from 'react';
import {
  Alert,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
  Image 
} from 'react-native';
import { Text } from 'react-native-paper';
import { theme } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { useAndroidNavigationBar } from '../../hooks/useAndroidNavigationBar';

export default function Menu() {
  const router = useRouter();
  const { signOut, user } = useAuth();

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

  const handleLogout = useCallback(() => {
    Alert.alert('Sair', 'Tem certeza que deseja sair?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut();
            router.replace('/login' as any);
          } catch {
            Alert.alert('Erro ao sair');
          }
        },
      },
    ]);
  }, [router, signOut]);

  const handleNavigate = useCallback(
    (route?: string) => {
      if (route) {
        router.push(route as any);
      } else {
        Alert.alert('Em breve');
      }
    },
    [router]
  );

  const menuOptions = useMemo(
    () => [
      { label: 'Início', icon: 'home-outline', route: '/home' },
      { label: 'Buscar', icon: 'magnify', route: '/search' },
      { label: 'Minhas compras', icon: 'shopping-outline', route: '/my-purchases' },
      { label: 'Favoritos', icon: 'heart-outline', route: '/favorites' },
      { label: 'Ofertas', icon: 'tag-outline', route: '/offers' },
      { label: 'Mercado Play', icon: 'play-box-outline', route: '/mercado-play' },
      { label: 'Histórico', icon: 'clock-outline', route: '/history' },
      { label: 'Minha conta', icon: 'account-outline', route: '/profile' },
      { label: 'Ajuda', icon: 'help-circle-outline', route: '/help' },
    ],
    []
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.secondary} />

      <SafeAreaView style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Menu</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialCommunityIcons name="close" size={26} color="#333" />
          </TouchableOpacity>
        </View>

        <View style={styles.userRow}>
          <View style={styles.avatar}>
            {(user as any)?.avatar ? (
              <Image 
                source={{ uri: (user as any).avatar }} 
                style={{ width: 50, height: 50, borderRadius: 25 }} 
              />
            ) : (
              <MaterialCommunityIcons name="account" size={30} color="#ccc" />
            )}
          </View>

          <View>
            <Text style={styles.userName}>{(user as any)?.name || 'Visitante'}</Text>
            <Text style={styles.userLevel}>Mercado Pontos</Text>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView style={{ flex: 1 }}>
        <View style={styles.grid}>
          {menuOptions.map((item) => (
            <TouchableOpacity
              key={item.label}
              style={styles.gridItem}
              onPress={() => handleNavigate(item.route)}
            >
              <MaterialCommunityIcons
                name={item.icon as any}
                size={28}
                color={theme.colors.primary}
              />
              <Text style={styles.gridLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 1, backgroundColor: '#ddd', marginVertical: 10 }} />

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Sair do aplicativo</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>Versão 1.0.0</Text>
        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: {
    backgroundColor: theme.colors.secondary,
    paddingTop: Platform.OS === 'android' ? 30 : 0,
    paddingBottom: 15,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  userRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 15,
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  userName: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
  },
  userLevel: {
    fontSize: 12,
    color: '#333',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
  },
  gridItem: {
    width: '31%',
    backgroundColor: '#fff',
    margin: '1%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    elevation: 1,
  },
  gridLabel: {
    marginTop: 10,
    fontSize: 12,
    textAlign: 'center',
    color: '#666',
  },
  logoutButton: {
    margin: 20,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee',
  },
  logoutText: {
    color: '#d63031',
    fontWeight: 'bold',
  },
  versionText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 12,
    marginBottom: 10,
  },
});
