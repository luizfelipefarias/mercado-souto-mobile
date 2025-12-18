import React, { useMemo } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    Platform,
    StatusBar,
    Alert
} from 'react-native';
import { Text, Divider } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../../src/constants/theme';
import { useAuth } from '../../src/context/AuthContext';
import { useAndroidNavigationBar } from '../../src/hooks/useAndroidNavigationBar';
import Toast from 'react-native-toast-message'; 

const ML_YELLOW = '#FFE600'; 
const PRIMARY_BLUE = '#3483fa';
const BG_COLOR = '#F5F5F5';

export default function Menu() {
    const router = useRouter();
    const { user, isGuest, signOut } = useAuth();

    useAndroidNavigationBar(true);

    const showUnavailable = () => {
        Toast.show({
            type: 'info',
            text1: 'Em breve',
            text2: 'Funcionalidade em desenvolvimento!',
        });
    };

    const handleNavigation = (route: string) => {
        if (!route) return;
        
        if (isGuest && (route.includes('account') || route.includes('my-purchases'))) {
            Alert.alert(
                'Faça login', 
                'Você precisa entrar na sua conta para acessar essa área.',
                [
                    { text: 'Cancelar', style: 'cancel' },
                    { text: 'Entrar', onPress: () => router.push('/(auth)/login' as any) }
                ]
            );
            return;
        }

        router.push(route as any);
    };

    const handleLogout = () => {
        Alert.alert(
            'Sair da conta',
            'Tem certeza que deseja sair?',
            [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Sair', style: 'destructive', onPress: () => signOut() }
            ]
        );
    };

    const menuSections = [
        {
            title: 'Minha Conta',
            show: !isGuest,
            items: [
                { label: 'Perfil', icon: 'account-circle-outline', route: '/(aux)/account/profile' },
                { label: 'Meus endereços', icon: 'map-marker-outline', route: '/(aux)/account/address' },
                { label: 'Segurança', icon: 'shield-check-outline', route: '/(aux)/account/profile/security' },
            ]
        },
        {
            title: 'Compras',
            show: true,
            items: [
                { label: 'Minhas compras', icon: 'shopping-outline', route: '/(aux)/shop/my-purchases' },
                { label: 'Favoritos', icon: 'heart-outline', route: '/(tabs)/favorites' }, 
                { label: 'Histórico', icon: 'clock-time-three-outline', route: '/(aux)/shop/history' },
            ]
        },
        {
            title: 'Categorias',
            show: true,
            items: [
                { label: 'Ver todas as categorias', icon: 'view-grid-outline', route: '/(tabs)/categories' },
                { label: 'Ofertas do dia', icon: 'tag-outline', route: '/(aux)/shop/all-products' },
                { label: 'Moda', icon: 'tshirt-crew-outline', route: '/(aux)/shop/all-products' }, 
            ]
        },
        {
            title: 'Geral',
            show: true,
            items: [
                { label: 'Ajuda', icon: 'help-circle-outline', route: '/(aux)/misc/help' },
            ]
        }
    ];
    
    const headerTitle = useMemo(() => isGuest ? 'Bem-vindo!' : `Olá, ${user?.name?.split(' ')[0]}`, [user, isGuest]);
    const headerSub = useMemo(() => isGuest ? 'Entre ou crie uma conta' : 'Mercado Souto Nível 1', [isGuest]);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={ML_YELLOW} />
            
            {/* --- HEADER AMARELO --- */}
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <Text style={styles.headerTitlePage}>Mais</Text>
                    <TouchableOpacity onPress={() => router.push('/(aux)/shop/cart' as any)}>
                        <MaterialCommunityIcons name="cart-outline" size={26} color="#333" />
                    </TouchableOpacity>
                </View>

                {/* Card de Perfil */}
                <TouchableOpacity 
                    style={styles.profileCard} 
                    onPress={() => isGuest ? router.push('/(auth)/login' as any) : router.push('/(aux)/account/profile' as any)}
                    activeOpacity={0.9}
                >
                    <View style={styles.avatarContainer}>
                        {isGuest ? (
                            <MaterialCommunityIcons name="account" size={32} color="#bbb" />
                        ) : (
                            <Text style={styles.avatarText}>{user?.name?.charAt(0).toUpperCase()}</Text>
                        )}
                    </View>
                    <View style={styles.profileInfo}>
                        <Text style={styles.profileName}>{headerTitle}</Text>
                        <Text style={styles.profileSub}>{headerSub}</Text>
                    </View>
                    <MaterialCommunityIcons name="chevron-right" size={24} color="#666" />
                </TouchableOpacity>
            </View>

            {/* --- CONTEÚDO SCROLL --- */}
            <ScrollView 
                showsVerticalScrollIndicator={false} 
                contentContainerStyle={styles.scrollContent}
                style={{ flex: 1 }}
            >
                {/* Banner para Visitante */}
                {isGuest && (
                    <TouchableOpacity style={styles.guestBanner} onPress={() => router.push('/(auth)/register' as any)}>
                        <MaterialCommunityIcons name="star-circle" size={40} color={PRIMARY_BLUE} />
                        <View style={{flex: 1, marginLeft: 15}}>
                            <Text style={{fontWeight: 'bold', fontSize: 15}}>Crie sua conta</Text>
                            <Text style={{fontSize: 13, color: '#666'}}>Aproveite ofertas e frete grátis</Text>
                        </View>
                        <MaterialCommunityIcons name="chevron-right" size={24} color="#ccc" />
                    </TouchableOpacity>
                )}

                {/* Renderização das Seções */}
                {menuSections.map((section, index) => {
                    if (!section.show) return null;
                    return (
                        <View key={index} style={styles.sectionContainer}>
                            {section.title && (
                                <Text style={styles.sectionTitle}>{section.title}</Text>
                            )}
                            <View style={styles.sectionCard}>
                                {section.items.map((item, idx) => (
                                    <React.Fragment key={idx}>
                                        <TouchableOpacity 
                                            style={styles.menuItem}
                                            onPress={() => item.route ? handleNavigation(item.route) : showUnavailable()}
                                        >
                                            <View style={styles.menuItemLeft}>
                                                <MaterialCommunityIcons name={item.icon as any} size={24} color="#666" />
                                                <Text style={styles.menuLabel}>{item.label}</Text>
                                            </View>
                                            <MaterialCommunityIcons name="chevron-right" size={20} color="#ddd" />
                                        </TouchableOpacity>
                                        {idx < section.items.length - 1 && <Divider style={styles.divider} />}
                                    </React.Fragment>
                                ))}
                            </View>
                        </View>
                    );
                })}

                {/* Botão Sair (Logout) */}
                {!isGuest && (
                    <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                        <Text style={styles.logoutText}>Sair da conta</Text>
                    </TouchableOpacity>
                )}
                
                <Text style={styles.versionText}>Versão 1.0.0 (Beta)</Text>
                <View style={{height: 30}} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: BG_COLOR },
    
    header: {
        backgroundColor: ML_YELLOW,
        paddingTop: Platform.OS === 'android' ? 30 : 50,
        paddingBottom: 20,
        paddingHorizontal: 15,
        borderBottomLeftRadius: 15,
        borderBottomRightRadius: 15,
        marginBottom: 10
    },
    headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    headerTitlePage: { fontSize: 18, fontWeight: '500', color: '#333' },
    
    profileCard: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
        padding: 12, borderRadius: 8, elevation: 3, shadowColor: '#000', shadowOpacity: 0.1
    },
    avatarContainer: {
        width: 50, height: 50, borderRadius: 25, backgroundColor: '#f0f0f0',
        justifyContent: 'center', alignItems: 'center', marginRight: 15,
        borderWidth: 1, borderColor: '#eee'
    },
    avatarText: { fontSize: 20, fontWeight: 'bold', color: PRIMARY_BLUE },
    profileInfo: { flex: 1 },
    profileName: { fontWeight: 'bold', fontSize: 16, color: '#333' },
    profileSub: { color: '#666', fontSize: 13, marginTop: 2 },

    scrollContent: { paddingHorizontal: 15, paddingBottom: 20 },

    guestBanner: {
        backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center',
        padding: 15, borderRadius: 8, marginTop: 10, elevation: 1
    },

    sectionContainer: { marginTop: 20 },
    sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#888', marginBottom: 8, marginLeft: 5, textTransform: 'uppercase' },
    sectionCard: { backgroundColor: '#fff', borderRadius: 8, overflow: 'hidden', elevation: 1 },
    
    menuItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
    menuItemLeft: { flexDirection: 'row', alignItems: 'center' },
    menuLabel: { fontSize: 15, color: '#333', marginLeft: 15 },
    divider: { backgroundColor: '#f0f0f0', marginLeft: 56 },

    logoutButton: {
        marginTop: 30, backgroundColor: '#fff', padding: 15, borderRadius: 8,
        alignItems: 'center', borderWidth: 1, borderColor: '#eee'
    },
    logoutText: { color: '#d63031', fontWeight: 'bold', fontSize: 15 },
    versionText: { textAlign: 'center', color: '#999', fontSize: 12, marginTop: 20 }
});