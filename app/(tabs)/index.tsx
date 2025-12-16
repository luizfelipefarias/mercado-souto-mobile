import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { 
    View, 
    StyleSheet, 
    ScrollView, 
    TouchableOpacity, 
    FlatList,
    StatusBar, 
    ActivityIndicator, 
    RefreshControl, 
    Platform,
    Image as RNImage, 
    Dimensions
} from 'react-native';
import { Text, Button, Badge } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import api from '../../src/services/api'; // Verifique se o caminho é api ou clientApi
import { useAuth } from '../../src/context/AuthContext';
import { useCart } from '../../src/context/CartContext';
import { useHistory } from '../../src/context/HistoryContext'; 
import { useProduct } from '../../src/context/ProductContext'; 
import { useAndroidNavigationBar } from '../../src/hooks/useAndroidNavigationBar';
import { Colors } from '../../src/constants/theme'; // Ajuste conforme seu theme real
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Address } from '../../src/interfaces';

const { width } = Dimensions.get('window');
const ML_YELLOW = '#FFE600'; 
const SELECTED_ADDRESS_KEY = '@selected_address_id';
const GUEST_ADDRESS_KEY = '@guest_addresses';

// Se não tiver Colors definido, use um fallback
const THEME_PRIMARY = '#3483fa'; 

// --- CONFIGURAÇÃO DA GRADE DE CATEGORIAS ---
const CATEGORY_GRID = [
    { label: 'Celulares', icon: 'cellphone', query: 'Celulares' },
    { label: 'Roupas', icon: 'tshirt-crew', query: 'Roupas' },
    { label: 'Beleza', icon: 'lipstick', query: 'Beleza' },
    { label: 'Eletro', icon: 'washing-machine', query: 'Eletrodomesticos' },
    { label: 'Esportes', icon: 'soccer', query: 'Esportes' },
    { label: 'Ver mais', icon: 'plus', route: '/(tabs)/categories' },
];

// --- ATALHOS REDONDOS ---
const SHORTCUTS = [
    { id: 1, label: 'Ofertas', icon: 'tag-outline', route: '/(aux)/shop/all-products' },
    { id: 2, label: 'Categorias', icon: 'format-list-bulleted', route: '/(tabs)/categories' },
    { id: 3, label: 'Minhas Compras', icon: 'shopping-outline', route: '/(aux)/shop/my-purchases' },
    { id: 4, label: 'Histórico', icon: 'clock-time-three-outline', route: '/(aux)/shop/history' },
    { id: 5, label: 'Ajuda', icon: 'help-circle-outline', route: '/(aux)/misc/help' },
];

type ProductUI = {
    id: number;
    title: string;
    price: number;
    imageUri: string | null;
    stock: number;
    category: string; 
};

type ActiveAddressInfo = Address & {
    city?: string;
    state?: string;
    neighborhood?: string;
};

type GroupedProducts = {
    [categoryName: string]: ProductUI[];
};

// --- COMPONENTES AUXILIARES ---
const errorStyles = StyleSheet.create({
    errorContainer: {
        flex: 1, alignItems: 'center', padding: 40, backgroundColor: '#fff',
        borderRadius: 8, margin: 15, elevation: 2,
    },
    errorTextTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 15, color: '#d63031' },
    errorTextSub: { fontSize: 14, color: '#666', textAlign: 'center', marginTop: 5, marginBottom: 20 },
    retryButton: { backgroundColor: THEME_PRIMARY, marginTop: 10, width: '100%', maxWidth: 250 },
    retryButtonText: { color: '#fff', fontWeight: 'bold' }
});

const ListErrorComponent = ({ onRetry }: { onRetry: () => void }) => (
    <View style={errorStyles.errorContainer}>
        <MaterialCommunityIcons name="alert-circle-outline" size={50} color="#ccc" />
        <Text style={errorStyles.errorTextTitle}>Ops!</Text>
        <Text style={errorStyles.errorTextSub}>Não foi possível carregar os produtos.</Text>
        <Button mode="contained" onPress={onRetry} style={errorStyles.retryButton} labelStyle={errorStyles.retryButtonText}>
            TENTAR NOVAMENTE
        </Button>
    </View>
);

export default function Home() {
    const router = useRouter();
    const { user, isGuest } = useAuth();
    const { cartItems } = useCart();
    
    // Contextos
    const { history } = useHistory(); 
    const { products, loading: productsLoading, loadProducts } = useProduct(); 

    // Estados Locais
    const [activeAddressInfo, setActiveAddressInfo] = useState<ActiveAddressInfo | null>(null);
    const [addressLoading, setAddressLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useAndroidNavigationBar(true);

    useEffect(() => {
        loadProducts();
    }, []);

    // --- Lógica de Endereço ---
    const fetchActiveAddress = useCallback(async () => {
        setAddressLoading(true);
        const timeout = setTimeout(() => setAddressLoading(false), 5000);

        try {
            let addresses: Address[] = [];
            let selectedId: number | null = null;

            const selectedIdString = await AsyncStorage.getItem(SELECTED_ADDRESS_KEY);
            selectedId = selectedIdString ? Number(selectedIdString) : null;

            if (isGuest) {
                const stored = await AsyncStorage.getItem(GUEST_ADDRESS_KEY);
                if (stored) addresses = JSON.parse(stored) as Address[]; 
            } else if (user?.id) {
                const res = await api.get<Address[]>(`/api/address/by-client/${user.id}`);
                addresses = res.data;
            }

            const foundAddress = addresses.find(addr => addr.id === selectedId);
            
            if (foundAddress) {
                const mappedInfo: ActiveAddressInfo = {
                    ...foundAddress,
                    city: (foundAddress as any).city || 'Cidade',
                    state: (foundAddress as any).state || 'UF',
                    neighborhood: (foundAddress as any).neighborhood || foundAddress.additionalInfo,
                };
                setActiveAddressInfo(mappedInfo);
            } else {
                setActiveAddressInfo(null);
            }
        } catch (e) {
            console.error("Erro endereço Home:", e);
            setActiveAddressInfo(null);
        } finally {
            clearTimeout(timeout);
            setAddressLoading(false);
        }
    }, [isGuest, user?.id]);

    useFocusEffect(
        useCallback(() => {
            fetchActiveAddress();
        }, [fetchActiveAddress])
    );

    // --- Agrupamento de Produtos ---
    const groupedProducts = useMemo(() => {
        const groups: GroupedProducts = {};

        if (products.length > 0) {
            groups['Todos'] = [];
        }

        products.forEach((item: any) => {
            const rawCatName = item.category?.name;
            const catName = (rawCatName && typeof rawCatName === 'string') ? rawCatName : 'Outros'; 

            const productUI: ProductUI = {
                id: item.id,
                title: item.title,
                price: Number(item.price) || 0,
                imageUri: (item.imageURL && item.imageURL.length > 0) ? item.imageURL[0] : null,
                stock: item.stock || 0,
                category: catName
            };

            groups['Todos'].push(productUI);

            if (!groups[catName]) {
                groups[catName] = [];
            }
            groups[catName].push(productUI);
        });

        return groups;
    }, [products]);

    // Ordenação das listas
    const categoriesKeys = useMemo(() => {
        return Object.keys(groupedProducts).sort((a, b) => {
            if (a === 'Todos') return -1;
            if (b === 'Todos') return 1;
            if (a === 'Outros') return 1;
            if (b === 'Outros') return -1;
            return a.localeCompare(b);
        });
    }, [groupedProducts]);

    // --- Ações ---
    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await Promise.all([loadProducts(), fetchActiveAddress()]);
        setRefreshing(false);
    }, [loadProducts, fetchActiveAddress]);

    const handleProductPress = (id: number) => {
        router.push(`/(aux)/shop/product/${id}` as any);
    };

    const handleNav = (route: string) => {
        if (route) router.push(route as any);
    };

    const handleGridPress = (item: typeof CATEGORY_GRID[0]) => {
        if (item.route) {
            router.push(item.route as any);
        } else if (item.query) {
            router.push({
                pathname: '/(aux)/misc/search-results',
                params: { q: item.query }
            } as any);
        }
    };

    const handleSeeAll = (categoryName: string) => {
        if (categoryName === 'Todos') {
            router.push('/(aux)/shop/all-products' as any);
        } else {
            router.push({
                pathname: '/(aux)/misc/search-results', 
                params: { q: categoryName } 
            } as any);
        }
    };

    const getAddressText = useCallback(() => {
        if (addressLoading) return 'Carregando...';
        if (activeAddressInfo && activeAddressInfo.street) {
            return `Enviar para ${activeAddressInfo.street}, ${activeAddressInfo.number} - ${activeAddressInfo.neighborhood || ''}`;
        }
        if (user && !(user as any).isGuest && user.name) {
            return `Enviar para ${user.name.split(' ')[0]}`;
        }
        return 'Enviar para Visitante - Informe seu CEP';
    }, [user, activeAddressInfo, addressLoading]);

    // --- Renderização de Itens ---
    // 🟢 CORREÇÃO APLICADA AQUI: Blindagem do preço
    const renderProductItem = ({ item }: { item: ProductUI }) => {
        // Garante que é número. Se vier null/undefined, assume 0.
        const safePrice = Number(item.price) || 0;

        return (
            <TouchableOpacity
                style={styles.productCard}
                onPress={() => handleProductPress(item.id)}
                activeOpacity={0.9}
            >
                <View style={styles.imageContainer}>
                    {item.imageUri ? (
                        <RNImage source={{ uri: item.imageUri }} style={styles.productImage} resizeMode="contain" />
                    ) : (
                        <MaterialCommunityIcons name="image-off-outline" size={40} color="#ddd" />
                    )}
                </View>
                <View style={styles.productInfo}>
                    <Text style={styles.productName} numberOfLines={2}>{item.title}</Text>
                    
                    {/* Usa safePrice em vez de item.price */}
                    <Text style={styles.oldPrice}>R$ {(safePrice * 1.2).toFixed(2).replace('.', ',')}</Text>
                    
                    <View style={styles.priceRow}>
                        <Text style={styles.price}>R$ {safePrice.toFixed(2).replace('.', ',')}</Text>
                        <Text style={styles.discount}>20% OFF</Text>
                    </View>
                    
                    <Text style={styles.installments}>6x R$ {(safePrice / 6).toFixed(2).replace('.', ',')} sem juros</Text>
                    
                    {item.stock > 0 && (
                        <Text style={styles.shipping}>Frete grátis <Text style={styles.fullText}>FULL</Text></Text>
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    const renderLoginCard = () => {
        if (!user || (user as any)?.isGuest) {
            return (
                <View style={styles.loginCardContainer}>
                    <Text style={styles.loginTitle}>Crie uma conta para melhorar sua experiência!</Text>
                    <Button mode="contained" onPress={() => router.push('/(auth)/register' as any)} style={styles.btnPrimary} labelStyle={{ fontWeight: 'bold' }}>Criar conta</Button>
                    <Button mode="text" onPress={() => router.push('/(auth)/login' as any)} style={styles.btnSecondary} labelStyle={{ color: THEME_PRIMARY, fontWeight: 'bold' }}>Entrar na minha conta</Button>
                </View>
            );
        }
        return null;
    };

    const isGlobalLoading = (productsLoading || addressLoading) && !refreshing;

    const renderMainContent = () => {
        if (isGlobalLoading) {
            return <ActivityIndicator size="large" color={THEME_PRIMARY} style={{ marginTop: 20 }} />;
        }

        if (Object.keys(groupedProducts).length === 0 && !productsLoading) {
             return <ListErrorComponent onRetry={loadProducts} />;
        }

        return (
            <>
                {/* 1. ATALHOS REDONDOS */}
                <View style={styles.shortcutsContainer}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                        {SHORTCUTS.map((item, index) => (
                            <TouchableOpacity 
                                key={index} 
                                style={styles.shortcutItem}
                                onPress={() => item.route && handleNav(item.route)}
                            >
                                <View style={styles.shortcutCircle}>
                                    <MaterialCommunityIcons name={item.icon as any} size={28} color="#666" />
                                </View>
                                <Text style={styles.shortcutLabel} numberOfLines={2}>{item.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* 2. VISTO RECENTEMENTE */}
                {history && history.length > 0 && (
                    <View style={styles.categorySection}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Visto recentemente</Text>
                            <TouchableOpacity onPress={() => router.push('/(aux)/shop/history' as any)}>
                                <Text style={styles.seeAll}>Ver histórico</Text>
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={history}
                            horizontal
                            renderItem={({ item }) => {
                                const histItem: ProductUI = {
                                    id: item.id,
                                    title: item.title,
                                    // 🟢 CORREÇÃO: Garante que price seja número no histórico também
                                    price: Number(item.price) || 0,
                                    imageUri: item.image,
                                    stock: 1, 
                                    category: 'Histórico'
                                };
                                return renderProductItem({ item: histItem });
                            }}
                            keyExtractor={(item, index) => String(item.id + '_' + index)}
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.productsList}
                        />
                    </View>
                )}

                {/* 3. LISTAS DE PRODUTOS */}
                {categoriesKeys.map((categoryName) => (
                    <View key={categoryName} style={styles.categorySection}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>{categoryName}</Text>
                            <TouchableOpacity onPress={() => handleSeeAll(categoryName)}>
                                <Text style={styles.seeAll}>Ver tudo</Text>
                                <MaterialCommunityIcons name="arrow-right" size={16} color={THEME_PRIMARY} />
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={groupedProducts[categoryName]}
                            horizontal
                            renderItem={renderProductItem}
                            keyExtractor={item => String(item.id)}
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.productsList}
                        />
                    </View>
                ))}

                {/* 4. GRADE DE CATEGORIAS (FIM DA TELA) */}
                <View style={styles.gridSection}>
                    <Text style={[styles.sectionTitle, { marginLeft: 15, marginBottom: 10 }]}>Categorias</Text>
                    <View style={styles.gridContainer}>
                        {CATEGORY_GRID.map((item, index) => (
                            <TouchableOpacity key={index} style={styles.gridItem} onPress={() => handleGridPress(item)}>
                                <View style={styles.gridIconCircle}>
                                    <MaterialCommunityIcons name={item.icon as any} size={28} color={item.label === 'Ver mais' ? THEME_PRIMARY : '#666'} />
                                </View>
                                <Text style={styles.gridLabel} numberOfLines={2}>{item.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {renderLoginCard()}
                <View style={{ height: 30 }} />
            </>
        );
    };
    
    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={ML_YELLOW} />

            <View style={styles.headerContainer}>
                <View style={styles.headerContent}>
                    {/* Top Row */}
                    <View style={styles.topRow}>
                        <TouchableOpacity style={styles.searchBar} onPress={() => router.push('/(aux)/misc/search' as any)} activeOpacity={0.9}>
                            <MaterialCommunityIcons name="magnify" size={22} color="#999" style={{ marginLeft: 10 }} />
                            <Text style={styles.searchText}>Buscar no Mercado Souto</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.cartButton} onPress={() => router.push('/(aux)/shop/cart' as any)}>
                            <MaterialCommunityIcons name="cart-outline" size={28} color="#333" />
                            {cartItems.length > 0 && <Badge size={16} style={styles.cartBadge}>{cartItems.length}</Badge>}
                        </TouchableOpacity>
                    </View>
                    {/* Endereço */}
                    <TouchableOpacity style={styles.addressRow} onPress={() => router.push('/(aux)/account/address' as any)}>
                        <MaterialCommunityIcons name="map-marker-outline" size={18} color="#333" />
                        <Text style={styles.addressText} numberOfLines={1}>{getAddressText()}</Text>
                        <MaterialCommunityIcons name="chevron-right" size={16} color="#777" />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled" 
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[ML_YELLOW]} />}
            >
                {/* Banner de Ofertas */}
                <View style={styles.bannerContainer}>
                    <TouchableOpacity style={styles.banner} onPress={() => router.push('/(aux)/shop/all-products' as any)} activeOpacity={0.9}>
                        <View>
                            <Text style={styles.bannerTitle}>OFERTAS</Text>
                            <Text style={styles.bannerSubtitle}>IMPERDÍVEIS</Text>
                            <View style={styles.bannerButton}><Text style={styles.bannerButtonText}>Ver mais</Text></View>
                        </View>
                        <MaterialCommunityIcons name="truck-delivery" size={80} color="#2d3277" style={{ marginRight: 10 }} />
                    </TouchableOpacity>
                </View>

                {renderMainContent()}

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    
    // Header
    headerContainer: { backgroundColor: ML_YELLOW, paddingTop: Platform.OS === 'android' ? 0 : 50, elevation: 4, zIndex: 10 },
    headerContent: { paddingHorizontal: 15, paddingBottom: 12 },
    topRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', height: 38, borderRadius: 30, marginRight: 12, elevation: 2, paddingHorizontal: 10 },
    searchText: { marginLeft: 8, color: '#bbb', fontSize: 14 },
    cartButton: { padding: 5 },
    cartBadge: { position: 'absolute', top: -2, right: -2, backgroundColor: '#d63031', fontSize: 10, fontWeight: 'bold' },
    addressRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 5 },
    addressText: { flex: 1, fontSize: 13, marginLeft: 6, marginRight: 5 },

    scrollContent: { paddingBottom: 100 },
    
    // Banner
    bannerContainer: { padding: 15 },
    banner: { backgroundColor: THEME_PRIMARY, height: 150, borderRadius: 8, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, justifyContent: 'space-between', elevation: 4 },
    bannerTitle: { color: '#FFE600', fontSize: 22, fontWeight: '900', fontStyle: 'italic' },
    bannerSubtitle: { color: '#FFF', fontSize: 20, fontWeight: 'bold', marginBottom: 12 },
    bannerButton: { backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
    bannerButtonText: { color: THEME_PRIMARY, fontWeight: 'bold', fontSize: 12 },

    // Atalhos
    shortcutsContainer: { height: 95 },
    shortcutItem: { alignItems: 'center', marginRight: 15, width: 72 },
    shortcutCircle: { width: 58, height: 58, backgroundColor: '#fff', borderRadius: 29, justifyContent: 'center', alignItems: 'center', marginBottom: 6, elevation: 2, borderWidth: 1, borderColor: '#f0f0f0' },
    shortcutLabel: { fontSize: 11, color: '#666', textAlign: 'center' },

    // Seções de Produtos
    categorySection: { marginTop: 15, marginBottom: 5 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 15, marginBottom: 10, alignItems: 'center' },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: '#333' },
    seeAll: { color: THEME_PRIMARY, fontSize: 14, marginRight: 4 },
    productsList: { paddingHorizontal: 10 },
    
    // Grade de Categorias
    gridSection: { marginTop: 25 },
    gridContainer: { 
        flexDirection: 'row', 
        flexWrap: 'wrap', 
        backgroundColor: '#f5f5f5', 
        justifyContent: 'space-between', 
        paddingHorizontal: 10 
    },
    gridItem: { 
        width: '31%', 
        aspectRatio: 1, 
        alignItems: 'center', 
        justifyContent: 'center',
        marginBottom: 10,
        backgroundColor: '#fff', 
        borderRadius: 8,
        elevation: 2, 
        padding: 5
    },
    gridIconCircle: { marginBottom: 5 },
    gridLabel: { fontSize: 12, color: '#666', textAlign: 'center', fontWeight: '500' },

    // Card de Produto
    productCard: { backgroundColor: '#fff', width: 160, height: 310, marginHorizontal: 6, borderRadius: 8, elevation: 3, overflow: 'hidden' },
    imageContainer: { height: 160, justifyContent: 'center', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#f5f5f5', padding: 10 },
    productImage: { width: '100%', height: '100%' },
    productInfo: { padding: 12, flex: 1 },
    productName: { fontSize: 13, marginBottom: 6, height: 32 },
    oldPrice: { fontSize: 11, color: '#aaa', textDecorationLine: 'line-through' },
    priceRow: { flexDirection: 'row', alignItems: 'center' },
    price: { fontSize: 20, fontWeight: '500', marginRight: 8 },
    discount: { fontSize: 12, color: '#00a650', fontWeight: 'bold' },
    installments: { fontSize: 11 },
    shipping: { fontSize: 11, color: '#00a650', marginTop: 4, fontWeight: '700' },
    fullText: { fontWeight: 'bold', fontStyle: 'italic' },

    loginCardContainer: { backgroundColor: '#fff', margin: 10, padding: 15, borderRadius: 8, elevation: 2, marginTop: 30 },
    loginTitle: { fontSize: 14, fontWeight: 'bold', textAlign: 'center', marginBottom: 15 },
    btnPrimary: { backgroundColor: THEME_PRIMARY, marginBottom: 10, borderRadius: 6 },
    btnSecondary: { borderRadius: 6 },
});