import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { 
    View, 
    StyleSheet, 
    ScrollView, 
    TouchableOpacity, 
    FlatList,
    StatusBar, 
    RefreshControl, 
    Platform,
    Image as RNImage, 
    useWindowDimensions, 
    ImageSourcePropType
} from 'react-native';
import { Text, Button, Badge } from 'react-native-paper';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient'; 
import { SafeAreaView } from 'react-native-safe-area-context';

import api from '../../src/services/api'; 
import { useAuth } from '../../src/context/AuthContext';
import { useCart } from '../../src/context/CartContext';
import { useHistory } from '../../src/context/HistoryContext'; 
import { useProduct } from '../../src/context/ProductContext'; 
import { useAndroidNavigationBar } from '../../src/hooks/useAndroidNavigationBar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Address } from '../../src/interfaces';

const ML_YELLOW = '#FFE600'; 
const BG_GRAY = '#F5F5F5';
const THEME_PRIMARY = '#3483fa'; 
const GREEN_FREE = '#00a650';

const SELECTED_ADDRESS_KEY = '@selected_address_id';
const GUEST_ADDRESS_KEY = '@guest_addresses';

const BANNER_IMAGES = [
    require('../../src/assets/img/ui/banner1.webp'),
    require('../../src/assets/img/ui/carousel0.webp'),
    require('../../src/assets/img/ui/carousel1.webp'),
    require('../../src/assets/img/ui/carousel2.webp'),
    require('../../src/assets/img/ui/carousel3.webp'),
    require('../../src/assets/img/ui/carousel4.webp'),
];

const VAN_LOGO = require('../../src/assets/img/ui/van-logo.png');

const SHORTCUTS = [
    { id: 1, label: 'Ofertas', icon: 'tag-outline', route: '/(aux)/shop/all-products' },
    { id: 2, label: 'Histórico', icon: 'clock-outline', route: '/(aux)/shop/history' },
    { id: 3, label: 'Minhas Compras', icon: 'shopping-outline', route: '/(aux)/shop/my-purchases/' }, 
    { id: 4, label: 'Endereços', icon: 'map-marker-outline', route: '/(aux)/account/address/' }, 
    { id: 5, label: 'Mais', icon: 'plus', route: '/(tabs)/menu' },
];

const CATEGORY_GRID = [
    { label: 'Celulares', icon: 'cellphone', query: 'Celulares' },
    { label: 'Informática', icon: 'laptop', query: 'Informatica' },
    { label: 'Casa', icon: 'sofa', query: 'Casa' },
    { label: 'Ferramentas', icon: 'tools', query: 'Ferramentas' },
    { label: 'Esportes', icon: 'soccer', query: 'Esportes' },
    { label: 'Ver mais', icon: 'view-grid-plus', route: '/(tabs)/categories' },
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

export default function Home() {
    const router = useRouter();
    const { width: screenWidth } = useWindowDimensions(); 
    const isTablet = screenWidth > 600; 

    const { user, isGuest } = useAuth();
    const { cartItems } = useCart();
    const { history } = useHistory(); 
    const { products, loading: productsLoading, loadProducts } = useProduct(); 

    const [activeAddressInfo, setActiveAddressInfo] = useState<ActiveAddressInfo | null>(null);
    const [addressLoading, setAddressLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeBanner, setActiveBanner] = useState(0);

    useAndroidNavigationBar(true);

    useEffect(() => {
        loadProducts();
    }, []);

    const fetchActiveAddress = useCallback(async () => {
        setAddressLoading(true);
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
                setActiveAddressInfo({
                    ...foundAddress,
                    neighborhood: foundAddress.additionalInfo || (foundAddress as any).neighborhood,
                });
            } else {
                setActiveAddressInfo(null);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setAddressLoading(false);
        }
    }, [isGuest, user?.id]);

    useFocusEffect(useCallback(() => { fetchActiveAddress(); }, [fetchActiveAddress]));

    const groupedProducts = useMemo(() => {
        const groups: Record<string, ProductUI[]> = { 'Ofertas do dia': [] };
        
        products.forEach((item: any) => {
            const catName = item.category?.name || 'Outros';
            const productUI: ProductUI = {
                id: item.id,
                title: item.title,
                price: Number(item.price) || 0,
                imageUri: (item.imageURL && item.imageURL.length > 0) ? item.imageURL[0] : null,
                stock: item.stock || 0,
                category: catName
            };
            groups['Ofertas do dia'].push(productUI);
            if (!groups[catName]) groups[catName] = [];
            groups[catName].push(productUI);
        });
        return groups;
    }, [products]);

    const categoriesKeys = useMemo(() => Object.keys(groupedProducts), [groupedProducts]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await Promise.all([loadProducts(), fetchActiveAddress()]);
        setRefreshing(false);
    }, [loadProducts, fetchActiveAddress]);


    const renderBanner = () => {
        const bannerHeight = isTablet ? 280 : 180;

        return (
            <View style={styles.bannerContainer}>
                <FlatList
                    data={BANNER_IMAGES}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    onMomentumScrollEnd={(event) => {
                        const index = Math.floor(event.nativeEvent.contentOffset.x / screenWidth);
                        setActiveBanner(index);
                    }}
                    keyExtractor={(_, index) => index.toString()}
                    renderItem={({ item }) => (
                        <View style={{ width: screenWidth, height: bannerHeight }}>
                            <RNImage 
                                source={item}
                                style={{ width: '100%', height: '100%' }} 
                                resizeMode="cover" 
                            />
                        </View>
                    )}
                />
                {/* Paginação */}
                <View style={styles.paginationContainer}>
                    {BANNER_IMAGES.map((_, i) => (
                        <View key={i} style={[styles.dot, activeBanner === i && styles.activeDot]} />
                    ))}
                </View>
                {/* Gradiente Fundo */}
                <LinearGradient 
                    colors={['rgba(245,245,245,0)', '#f5f5f5']} 
                    style={styles.bannerGradient} 
                />
            </View>
        );
    };
const handleNavigation = (item: any) => {
        if (item.route) {
            router.push(item.route);
        } else if (item.query) {
            router.push({
                pathname: '/(aux)/misc/search-results',
                params: { q: item.query }
            } as any);
        }
    };
    
    const renderShippingBanner = () => (
        <View style={[styles.shippingBanner, isTablet && styles.tabletSection]}>
            <View style={styles.shippingContent}>
                <RNImage source={VAN_LOGO} style={styles.vanIcon} resizeMode="contain" />
                <View style={{marginLeft: 10, flex: 1}}>
                    <Text style={{fontSize: 12, color: '#00a650', fontWeight: 'bold'}}>Frete Grátis</Text>
                    <Text style={{fontSize: 12, color: '#666'}}>Em milhões de produtos a partir de R$ 79</Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={20} color="#ccc" />
            </View>
        </View>
    );

    const renderShortcuts = () => (
        <View style={[styles.shortcutsContainer, { paddingHorizontal: isTablet ? 40 : 10 }]}>
            {SHORTCUTS.map((item, index) => (
                <TouchableOpacity 
                    key={index} 
                    style={styles.shortcutItem}
                    onPress={() => item.route && router.push(item.route as any)}
                >
                    <View style={styles.shortcutCircle}>
                        <MaterialCommunityIcons name={item.icon as any} size={26} color="#666" />
                    </View>
                    <Text style={styles.shortcutLabel}>{item.label}</Text>
                </TouchableOpacity>
            ))}
        </View>
    );

    const renderProductItem = ({ item }: { item: ProductUI }) => {
        const cardWidth = isTablet ? 180 : 145;
        return (
            <TouchableOpacity 
                style={[styles.productCard, { width: cardWidth }]}
                onPress={() => router.push(`/(aux)/shop/product/${item.id}` as any)}
                activeOpacity={0.9}
            >
                <View style={styles.imageContainer}>
                    <RNImage 
                        source={item.imageUri ? { uri: item.imageUri } : require('../../src/assets/icon/icon.png')}
                        style={styles.productImage} 
                        resizeMode="contain" 
                    />
                </View>
                <View style={styles.productInfo}>
                    <Text numberOfLines={2} style={styles.productName}>{item.title}</Text>
                    <Text style={styles.price}>R$ {item.price.toFixed(2).replace('.', ',')}</Text>
                    <Text style={styles.installments}>em 10x sem juros</Text>
                    <Text style={styles.shipping}>Frete grátis <Text style={{fontStyle: 'italic', color: '#00a650', fontWeight:'900'}}>⚡FULL</Text></Text>
                </View>
            </TouchableOpacity>
        );
    };

    const getAddressText = () => {
        if (addressLoading) return 'Carregando...';
        if (activeAddressInfo?.street) return `${activeAddressInfo.street}, ${activeAddressInfo.number}`;
        if (user?.name) return `Enviar para ${user.name.split(' ')[0]}`;
        return 'Informe seu CEP';
    };

    const handleSeeAll = (categoryName: string) => {
        if (categoryName === 'Ofertas do dia') {
            router.push('/(aux)/shop/all-products' as any);
        } else {
            router.push({
                pathname: '/(aux)/misc/search-results',
                params: { q: categoryName }
            } as any);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={ML_YELLOW}   />
            <SafeAreaView 
                edges={['top']} 
                style={{ backgroundColor: ML_YELLOW, zIndex: 100 }}
            >
            <View style={[styles.headerContainer, { paddingTop: Platform.OS === 'ios' ? 50 : 0 }]}>
                <View style={[styles.headerContent, { maxWidth: isTablet ? 700 : '100%', alignSelf: 'center', width: '90%' }]}>
                    <View style={styles.topRow}>
                        <TouchableOpacity style={styles.searchBar} onPress={() => router.push('/(aux)/misc/search/' as any)}>
                            <Ionicons name="search" size={20} color="#999" style={{ marginLeft: 20 }} />
                            <Text style={styles.searchText}>Buscar no Mercado Souto</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => router.push('/(aux)/shop/cart' as any)}>
                            <MaterialCommunityIcons name="cart-outline" size={28} color="#333" style={{marginLeft: 20}} />
                            {cartItems.length > 0 && <Badge size={16} style={styles.cartBadge}>{cartItems.length}</Badge>}
                        </TouchableOpacity>
                    </View>
                    
                    <TouchableOpacity style={styles.addressRow} onPress={() => router.push('/(aux)/account/address' as any)}>
                        <Ionicons name="location-outline" size={18} color="#333" />
                        <Text style={styles.addressText} numberOfLines={1}>{getAddressText()}</Text>
                        <Ionicons name="chevron-forward" size={18} color="#777" />
                    </TouchableOpacity>
                </View>
            </View>
            </SafeAreaView>
            <ScrollView 
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[THEME_PRIMARY]} />}
                contentContainerStyle={{ paddingBottom: 40 }}
            >

                {renderBanner()}
                {renderShortcuts()}
                {renderShippingBanner()}

                {/* 4. HISTÓRICO */}
                {history && history.length > 0 && (
                     <View style={[styles.sectionContainer, isTablet && styles.tabletSection]}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Visto recentemente</Text>
                            <TouchableOpacity onPress={() => router.push('/(aux)/shop/history' as any)}>
                                <Text style={styles.seeAll}>Ver histórico</Text>
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={history}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            keyExtractor={(item, index) => `hist-${item.id}-${index}`}
                            renderItem={({item}) => renderProductItem({ item: { ...item, price: Number(item.price) || 0, imageUri: item.image, stock: 1, category: 'Hist'} })}
                            contentContainerStyle={{ paddingHorizontal: 15 }}
                        />
                     </View>
                )}

                {/* 5. LISTAS DE PRODUTOS */}
                {categoriesKeys.map((cat) => (
                    <View key={cat} style={[styles.sectionContainer, isTablet && styles.tabletSection]}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>{cat}</Text>
                            <TouchableOpacity onPress={() => handleSeeAll(cat)}>
                                <Text style={styles.seeAll}>Ver tudo</Text>
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={groupedProducts[cat]}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            keyExtractor={(item) => String(item.id)}
                            renderItem={renderProductItem}
                            contentContainerStyle={{ paddingHorizontal: 15 }}
                        />
                    </View>
                ))}

                {/* 6. GRID CATEGORIAS */}
                <View style={[styles.gridSection, isTablet && styles.tabletSection]}>
                    <Text style={[styles.sectionTitle, { marginLeft: 15, marginBottom: 15 }]}>Categorias populares</Text>
                    <View style={styles.gridContainer}>
                        {CATEGORY_GRID.map((item, index) => {
                            const itemWidth = isTablet ? '30%' : '47%'; 
                            return (
                                <TouchableOpacity 
                                    key={index} 
                                    style={[styles.gridItem, { width: itemWidth }]} 
                                    onPress={() => handleNavigation(item)}
                                >
                                    <MaterialCommunityIcons name={item.icon as any} size={28} color={THEME_PRIMARY} />
                                    <Text style={styles.gridLabel}>{item.label}</Text>
                                </TouchableOpacity>
                            )
                        })}
                    </View>
                </View>
                
                {/* 7. LOGIN CARD */}
                {(!user || isGuest) && (
                     <View style={[styles.loginCardContainer, isTablet && styles.tabletSection]}>
                        <View style={styles.loginCard}>
                            <MaterialCommunityIcons name="account-circle-outline" size={40} color="#333" style={{marginBottom: 10}}/>
                            <Text style={styles.loginTitle}>Acesse sua conta para ver suas compras, favoritos e muito mais.</Text>
                            <Button 
                                mode="contained" 
                                onPress={() => router.push('/(auth)/login' as any)} 
                                buttonColor={THEME_PRIMARY}
                                style={styles.loginBtn}
                            >
                                Entrar na minha conta
                            </Button>
                            <Button 
                                mode="text" 
                                onPress={() => router.push('/(auth)/register' as any)} 
                                textColor={THEME_PRIMARY}
                            >
                                Criar conta
                            </Button>
                        </View>
                     </View>
                )}

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: BG_GRAY },
    
    headerContainer: { backgroundColor: ML_YELLOW, elevation: 2, zIndex: 10 },
    headerContent: { padding: 10, paddingBottom: 10 },
    topRow: { flexDirection: 'row', alignItems: 'center' },
    searchBar: { 
        flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', 
        height: 40, borderRadius: 30, elevation: 2, 
        shadowColor: '#000', shadowOpacity: 0.1, shadowOffset: { width:0, height:1 }
    },
    searchText: { color: '#bbb', marginLeft: 8 },
    cartBadge: { position: 'absolute', top: -4, right: -4, backgroundColor: '#d63031', fontSize: 10 },
    addressRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10, paddingLeft: 4 },
    addressText: { fontSize: 13, color: '#333', marginLeft: 5, flex: 1 },

    bannerContainer: { position: 'relative' },
    paginationContainer: { flexDirection: 'row', position: 'absolute', bottom: 15, alignSelf: 'center' },
    dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.5)', margin: 3 },
    activeDot: { backgroundColor: '#fff' },
    bannerGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 20 },

    shortcutsContainer: { 
        flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#fff', 
        paddingVertical: 20, marginTop: -10, borderTopLeftRadius: 20, borderTopRightRadius: 20,
        elevation: 1, zIndex: 2
    },
    shortcutItem: { alignItems: 'center', flex: 1 },
    shortcutCircle: { 
        width: 55, height: 55, borderRadius: 30, backgroundColor: '#fff', 
        borderWidth: 1, borderColor: '#eee', justifyContent: 'center', alignItems: 'center', marginBottom: 5,
        elevation: 2 
    },
    shortcutLabel: { fontSize: 11, color: '#666', textAlign: 'center' },

    shippingBanner: { paddingHorizontal: 15, marginTop: 15, marginBottom: 5 },
    shippingContent: { 
        backgroundColor: '#fff', padding: 10, borderRadius: 6, flexDirection: 'row', alignItems: 'center',
        elevation: 1, shadowColor: '#000', shadowOpacity: 0.05
    },
    vanIcon: { width: 50, height: 50 },

    sectionContainer: { marginTop: 20 },
    tabletSection: { maxWidth: 900, alignSelf: 'center', width: '100%' }, 
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 15, marginBottom: 10, alignItems: 'center' },
    sectionTitle: { fontSize: 18, color: '#333', fontWeight: '600' },
    seeAll: { color: THEME_PRIMARY, fontSize: 14 },

    productCard: { 
        backgroundColor: '#fff', borderRadius: 6, marginHorizontal: 8, 
        elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 3, shadowOffset: {width:0,height:1},
        paddingBottom: 10, marginBottom: 5, height: 290
    },
    imageContainer: { height: 140, justifyContent: 'center', alignItems: 'center', padding: 10, borderBottomWidth:1, borderBottomColor:'#f5f5f5' },
    productImage: { width: '100%', height: '100%' },
    productInfo: { padding: 10, flex: 1, justifyContent: 'space-between' },
    productName: { fontSize: 14, color: '#333', marginBottom: 4, height: 38 },
    price: { fontSize: 20, color: '#333', fontWeight: '500' },
    installments: { fontSize: 12, color: GREEN_FREE },
    shipping: { fontSize: 12, color: GREEN_FREE, fontWeight: 'bold' },

    gridSection: { marginTop: 20, marginBottom: 30 },
    gridContainer: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 10, justifyContent: 'space-between' },
    gridItem: { 
        backgroundColor: '#fff', borderRadius: 8, padding: 15, marginBottom: 10, 
        alignItems: 'center', flexDirection: 'row', elevation: 2 
    },
    gridLabel: { marginLeft: 20, fontSize: 13, color: '#333', flex: 1 },

    loginCardContainer: { paddingHorizontal: 10, marginBottom: 10 },
    loginCard: { backgroundColor: '#fff', padding: 100, borderRadius: 20, elevation: 1, alignItems: 'center',height: '100%' },
    loginTitle: { textAlign: 'center', marginBottom: 10, color: '#333', fontSize: 15 },
    loginBtn: { width: '100%', marginBottom: 2 },
}); 