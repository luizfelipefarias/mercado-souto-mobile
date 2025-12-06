import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as NavigationBar from 'expo-navigation-bar';
import React, { useCallback, useEffect, useMemo } from 'react';
import {
  Alert,
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { Text } from 'react-native-paper';
import { theme } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { useAndroidNavigationBar } from '../../hooks/useAndroidNavigationBar';

type ProfileOption = {
  label: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  route?: string;
};

export default function Profile() {
  const router = useRouter();
  const { user, signOut } = useAuth();

  useAndroidNavigationBar(true);

  useEffect(() => {
    if (Platform.OS !== 'android') return;

    NavigationBar.setVisibilityAsync('hidden');
    NavigationBar.setBehaviorAsync('overlay-swipe');

    return () => {
      NavigationBar.setVisibilityAsync('visible');
    };
  }, []);

  const options: ProfileOption[] = useMemo(
    () => [
      { label: 'Meus dados', icon: 'account-cog-outline', route: '/profile/edit' },
      { label: 'Segurança', icon: 'shield-check-outline', route: '/profile/security' },
      { label: 'Cartões', icon: 'credit-card-outline', route: '/wallet' },
      { label: 'Endereços', icon: 'map-marker-outline', route: '/address' },
      { label: 'Privacidade', icon: 'lock-outline', route: '/profile/privacy' },
    ],
    []
  );

  const handleLogout = useCallback(() => {
    Alert.alert(
      'Sair da conta',
      'Tem certeza que deseja sair do Mercado Souto?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/login' as any);
          },
        },
      ]
    );
  }, [router, signOut]);

  const handleNavigation = useCallback(
    (item: ProfileOption) => {
      if (!item.route) {
        Alert.alert(
          'Em breve',
          `A funcionalidade "${item.label}" estará disponível na próxima atualização.`
        );
        return;
      }

      router.push(item.route as any);
    },
    [router]
  );

  const userName = (user as any)?.name || 'Visitante';
  const userEmail = user?.email || 'Faça login para ver seus dados';
  const userAvatar = (user as any)?.avatar;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.secondary} />

      <View style={styles.header}>
        <SafeAreaView style={styles.safe}>
          <View style={styles.headerTop}>
            <TouchableOpacity onPress={() => router.back()}>
              <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>Meu perfil</Text>

            <TouchableOpacity onPress={() => router.push('/home' as any)}>
              <MaterialCommunityIcons name="home-outline" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <View style={styles.profileCard}>
            <View style={styles.avatar}>
              {userAvatar ? (
                <Image source={{ uri: userAvatar }} style={styles.avatarImage} />
              ) : (
                <MaterialCommunityIcons name="account" size={40} color="#ccc" />
              )}
            </View>

            <View style={styles.userInfo}>
              <Text style={styles.userName} numberOfLines={1}>
                {userName}
              </Text>
              <Text style={styles.userEmail} numberOfLines={1}>
                {userEmail}
              </Text>
            </View>
          </View>
        </SafeAreaView>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {options.map(item => (
          <TouchableOpacity
            key={item.label}
            style={styles.optionItem}
            onPress={() => handleNavigation(item)}
          >
            <View style={styles.optionLeft}>
              <MaterialCommunityIcons
                name={item.icon}
                size={24}
                color="#666"
                style={styles.optionIcon}
              />
              <Text style={styles.optionLabel}>{item.label}</Text>
            </View>

            <MaterialCommunityIcons name="chevron-right" size={20} color="#ccc" />
          </TouchableOpacity>
        ))}

        {user && (
          <View style={styles.logoutContainer}>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutText}>Sair da conta</Text>
            </TouchableOpacity>

            <Text style={styles.versionText}>Versão 1.0.0 - Mercado Souto</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },

  header: {
    backgroundColor: theme.colors.secondary,
    paddingBottom: 20,
  },

  safe: {
    paddingTop: Platform.OS === 'android' ? 30 : 0,
  },

  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    alignItems: 'center',
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
  },

  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 10,
  },

  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    overflow: 'hidden',
  },

  avatarImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },

  userInfo: {
    flex: 1,
  },

  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },

  userEmail: {
    fontSize: 14,
    color: '#333',
  },

  content: {
    paddingTop: 20,
    paddingBottom: 40,
  },

  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },

  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  optionIcon: {
    marginRight: 15,
  },

  optionLabel: {
    fontSize: 16,
    color: '#333',
  },

  logoutContainer: {
    marginTop: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
  },

  logoutButton: {
    backgroundColor: 'rgba(255, 62, 62, 0.1)',
    paddingVertical: 12,
    width: '100%',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 62, 62, 0.3)',
  },

  logoutText: {
    color: '#ff3e3e',
    fontWeight: 'bold',
    fontSize: 16,
  },

  versionText: {
    marginTop: 20,
    color: '#aaa',
    fontSize: 12,
  },
});
