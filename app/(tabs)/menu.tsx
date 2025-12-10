import React, { useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  StatusBar,
} from 'react-native';
import { Text, Divider } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../../src/constants/theme';
import { useAuth } from '../../src/context/AuthContext';
import { useAndroidNavigationBar } from '../../src/hooks/useAndroidNavigationBar';
import Toast from 'react-native-toast-message'; 

export default function Menu() {
  const router = useRouter();
  const { user, isGuest } = useAuth();

  useAndroidNavigationBar(true);

  const showUnavailable = () => {
    Toast.show({
        type: 'info',
        text1: 'Funcionalidade em Construção',
        text2: 'Em breve disponível!',
    });
  };

  const handleNavigation = (route: string) => {
    if (route === '/(aux)/account/wallet' || route === '/(aux)/misc/mercado-play') {
        showUnavailable();
    } else if (route) {
        router.push(route as any);
    }
  };

  const menuItems = [
    {
      title: 'Compras',
      items: [
        { label: 'Minhas compras', icon: 'shopping-outline', route: '/(aux)/shop/my-purchases' },
        { label: 'Favoritos', icon: 'heart-outline', route: '/(tabs)/favorites' }, 
        { label: 'Histórico', icon: 'clock-outline', route: '/(aux)/shop/history' },
      ]
    },
    {
      title: 'Configurações',
      items: [
        { label: 'Meu perfil', icon: 'account-outline', route: '/(aux)/account/profile' },
        { label: 'Endereços', icon: 'map-marker-outline', route: '/(aux)/account/address' },
        { label: 'Segurança', icon: 'shield-check-outline', route: '/(aux)/account/profile/security' },
        { label: 'Privacidade', icon: 'lock-outline', route: '/(aux)/account/profile/privacy' },
      ]
    },
    {
      title: 'Geral',
      items: [
        { label: 'Ajuda', icon: 'help-circle-outline', route: '/(aux)/misc/help' },
        { label: 'Ver Ofertas', icon: 'tag-multiple-outline', route: '/(aux)/shop/all-products' },
      ]
    }
  ];
  
  const profileName = useMemo(() => {
    if (user?.name) return user.name;
    return isGuest ? 'Olá, Visitante' : 'Entrar / Criar conta';
  }, [user, isGuest]);

  const profileSubText = useMemo(() => {
    if (user && user.name && !isGuest) {
        return 'Ver meu perfil';
    }
    return 'Clique para começar';
  }, [user, isGuest]);


  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.secondary} />
      
      {/* Header Amarelo */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Mais</Text>
            <TouchableOpacity onPress={() => router.push('/(aux)/shop/cart' as any)}>
                <MaterialCommunityIcons name="cart-outline" size={26} color="#333" />
            </TouchableOpacity>
        </View>

        {/* Card de Perfil Resumido */}
        <TouchableOpacity 
            style={styles.profileCard} 
            onPress={() => handleNavigation('/(aux)/account/profile')}
            activeOpacity={0.9}
        >
            <View style={styles.avatarContainer}>
                <MaterialCommunityIcons name="account" size={30} color={user ? theme.colors.primary : "#ccc"} />
            </View>
            <View style={styles.profileInfo}>
                <Text style={styles.profileName}>
                    {profileName}
                </Text>
                <Text style={styles.profileSub}>
                   {profileSubText}
                </Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      {/* ❌ REMOVIDO: shortcutsGrid e seu conteúdo. */}
      {/* O ScrollView agora começa logo após o profileCard. */}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {menuItems.map((section, index) => (
            <View key={index} style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>{section.title}</Text>
                </View>
                {section.items.map((item, idx) => (
                    <React.Fragment key={idx}>
                        <TouchableOpacity 
                            style={styles.menuItem}
                            onPress={() => item.route && handleNavigation(item.route)}
                        >
                            <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                <MaterialCommunityIcons name={item.icon as any} size={24} color="#666" style={{marginRight: 15}} />
                                <Text style={styles.menuLabel}>{item.label}</Text>
                            </View>
                            <MaterialCommunityIcons name="chevron-right" size={20} color="#ccc" />
                        </TouchableOpacity>
                        {idx < section.items.length - 1 && <Divider />}
                    </React.Fragment>
                ))}
            </View>
        ))}
        
        <View style={{height: 20}} />
      </ScrollView>
    </SafeAreaView>
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
      alignItems: 'center',
      paddingHorizontal: 15,
      marginBottom: 15
  },
  headerTitle: { fontSize: 18, fontWeight: '500', color: '#333' },
  
  profileCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#fff',
      marginHorizontal: 15,
      padding: 10,
      borderRadius: 6,
      elevation: 2
  },
  avatarContainer: {
      width: 45, height: 45, borderRadius: 22.5, backgroundColor: '#f5f5f5',
      justifyContent: 'center', alignItems: 'center', marginRight: 12,
      borderWidth: 1, borderColor: '#eee'
  },
  profileInfo: { flex: 1 },
  profileName: { fontWeight: 'bold', fontSize: 16, color: '#333' },
  profileSub: { color: '#666', fontSize: 12 },

  
  scrollContent: { paddingHorizontal: 15 },
  section: {
      backgroundColor: '#fff',
      borderRadius: 8,
      marginTop: 15, 
      marginBottom: 15,
      overflow: 'hidden',
      elevation: 1
  },
  sectionHeader: {
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 5
  },
  sectionTitle: {
      fontSize: 14,
      fontWeight: 'bold',
      color: theme.colors.primary,
      textTransform: 'uppercase'
  },
  menuItem: {
      flexDirection: 'row', 
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 16,
  },
  menuLabel: { fontSize: 15, color: '#333' }
});