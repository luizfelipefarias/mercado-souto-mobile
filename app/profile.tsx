import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as NavigationBar from 'expo-navigation-bar';
import React, { useEffect } from 'react';
import {
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { Text } from 'react-native-paper';
import { theme } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { useAndroidNavigationBar } from '../hooks/useAndroidNavigationBar';

export default function Profile() {
  const router = useRouter();
  const { user } = useAuth();
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

  const options = [
    { label: 'Meus dados', icon: 'account-cog-outline' },
    { label: 'Segurança', icon: 'shield-check-outline' },
    { label: 'Cartões', icon: 'credit-card-outline' },
    { label: 'Endereços', icon: 'map-marker-outline', route: '/address' },
    { label: 'Privacidade', icon: 'lock-outline' },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.secondary} />

      <View style={styles.header}>
        <SafeAreaView style={{ paddingTop: Platform.OS === 'android' ? 30 : 0 }}>
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
              <MaterialCommunityIcons name="account" size={40} color="#ccc" />
            </View>

            <View>
              <Text style={styles.userName}>{(user as any)?.name || 'Visitante'}</Text>
              <Text style={styles.userEmail}>
                {user?.email || 'Faça login para ver seus dados'}
              </Text>
            </View>
          </View>
        </SafeAreaView>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {options.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.optionItem}
            onPress={() => (item.route ? router.push(item.route as any) : null)}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <MaterialCommunityIcons
                name={item.icon as any}
                size={24}
                color="#666"
                style={{ marginRight: 15 }}
              />
              <Text style={styles.optionLabel}>{item.label}</Text>
            </View>

            <MaterialCommunityIcons name="chevron-right" size={20} color="#ccc" />
          </TouchableOpacity>
        ))}
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

  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    alignItems: 'center',
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: '500',
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

  content: { paddingTop: 20 },

  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },

  optionLabel: {
    fontSize: 16,
    color: '#333',
  },
});
