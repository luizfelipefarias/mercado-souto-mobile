import React, { useState, useEffect } from 'react';
import { 
    View, 
    StyleSheet, 
    ScrollView, 
    TouchableOpacity, 
    Platform,
    Image as RNImage, 
    useWindowDimensions,
    StatusBar,
    Alert,
    ActivityIndicator,
    Modal,
    TextInput,
    KeyboardAvoidingView
} from 'react-native';
import { Text, Button, Badge, Snackbar, Divider } from 'react-native-paper';
import { MaterialCommunityIcons, Ionicons, FontAwesome } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import api from '../../../../src/services/api'; 
import { useCart } from '../../../../src/context/CartContext';
import { useProduct } from '../../../../src/context/ProductContext';
import { useAuth } from '../../../../src/context/AuthContext'; 

const ML_YELLOW = '#FFE600'; 
const BG_GRAY = '#F5F5F5';
const THEME_PRIMARY = '#3483fa'; 
const GREEN_FREE = '#00a650';

interface Review {
    id: number;
    title: string;
    description: string;
    rating: number; 
    clientName?: string;
}

export default function ProductDetails() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const productId = Number(id);
    
    const { cartItems, addToCart } = useCart();
    const { products } = useProduct();
    // Importando token para garantir autenticação nas requisições manuais
    const { user, isGuest, token } = useAuth(); 

    const [product, setProduct] = useState<any>(null);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [isFavorite, setIsFavorite] = useState(false);
    
    const [loadingBuy, setLoadingBuy] = useState(false);
    const [loadingReview, setLoadingReview] = useState(false);
    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [snackbarMsg, setSnackbarMsg] = useState('');

    // Modal de Avaliação
    const [modalVisible, setModalVisible] = useState(false);
    const [newRating, setNewRating] = useState(0);
    const [newTitle, setNewTitle] = useState('');
    const [newDesc, setNewDesc] = useState('');

    // --- EFEITOS ---
    useEffect(() => {
        if (products && productId) {
            const found = products.find((p: any) => Number(p.id) === productId);
            setProduct(found);
            fetchReviews();
        }
    }, [productId, products]);

    useEffect(() => {
        if (user && product) {
            checkIfFavorite();
        }
    }, [user, product]);

    // --- FUNÇÕES DE BUSCA ---
    const fetchReviews = async () => {
        try {
            const res = await api.get(`/api/review/product/${productId}`);
            if (Array.isArray(res.data)) {
                setReviews(res.data);
            } else {
                setReviews([]);
            }
        } catch (error) {
            console.log("Erro ao buscar reviews", error);
            setReviews([]); 
        }
    };

    const checkIfFavorite = async () => {
        if (!user) return;
        try {
            const res = await api.get(`/api/client/${user.id}/favorite-products`);
            const favorites = Array.isArray(res.data) ? res.data : [];
            const isFav = favorites.some((fav: any) => fav.id === productId);
            setIsFavorite(isFav);
        } catch (error) {
            console.log("Erro ao checar favoritos");
        }
    };

    // --- AÇÕES DO USUÁRIO ---
    const toggleFavorite = async () => {
        if (!user || isGuest) {
            Alert.alert("Atenção", "Faça login para favoritar produtos.");
            return;
        }

        try {
            const config = { headers: { Authorization: token?.startsWith('Bearer') ? token : `Bearer ${token}` }};
            
            if (isFavorite) {
                await api.delete(`/api/client/${user.id}/favorite-product/${productId}`, config);
                setIsFavorite(false);
                setSnackbarMsg('Removido dos favoritos');
            } else {
                await api.post(`/api/client/${user.id}/favorite-product/${productId}`, {}, config);
                setIsFavorite(true);
                setSnackbarMsg('Adicionado aos favoritos');
            }
            setSnackbarVisible(true);
        } catch (error) {
            Alert.alert("Erro", "Não foi possível atualizar favoritos.");
        }
    };

    // --- COMPRAR AGORA (SEM REDIRECIONAR) ---
    const handleBuyNow = async () => {
        if (!user || isGuest) {
            router.push('/(auth)/login' as any);
            return;
        }

        setLoadingBuy(true);
        try {
            // 1. Busca endereço válido
            let addressId = null;
            
            // Tenta pegar do contexto local
            if (user.addresses && user.addresses.length > 0) {
                addressId = user.addresses[0].id;
            } else {
                // Tenta pegar da API se o contexto estiver desatualizado
                const resAddr = await api.get(`/api/address/by-client/${user.id}`);
                if (Array.isArray(resAddr.data) && resAddr.data.length > 0) {
                    addressId = resAddr.data[0].id;
                }
            }

            // Se não tiver endereço, obriga a cadastrar
            if (!addressId) {
                Alert.alert(
                    "Endereço necessário", 
                    "Para comprar com 1 clique, cadastre um endereço.",
                    [
                        { text: "Cancelar", style: "cancel" },
                        { text: "Cadastrar", onPress: () => router.push('/(aux)/account/address/create' as any) }
                    ]
                );
                setLoadingBuy(false);
                return;
            }

            // 2. Faz o pedido (Ordem Direta)
            const validToken = token?.startsWith('Bearer ') ? token : `Bearer ${token}`;
            
            await api.post(
                `/api/order/product/${productId}/address/${addressId}`, 
                { quantity: 1 }, 
                { headers: { Authorization: validToken } } // Header explícito
            );

            // 3. Sucesso (Mantém na tela)
            Alert.alert(
                "Compra Realizada! 🎉", 
                "Seu pedido foi processado e logo será enviado para seu endereço padrão.",
                [
                    { text: "Continuar Comprando" },
                    { text: "Ver Meus Pedidos", onPress: () => router.push('/(aux)/shop/orders' as any) }
                ]
            );

        } catch (error) {
            console.error(error);
            Alert.alert("Erro", "Não foi possível finalizar a compra. Tente adicionar ao carrinho.");
        } finally {
            setLoadingBuy(false);
        }
    };

    // --- ENVIAR AVALIAÇÃO ---
    const handleSubmitReview = async () => {
        if (!user) {
            Alert.alert("Erro", "Você precisa estar logado.");
            return;
        }
        if (newRating === 0) {
            Alert.alert("Avaliação", "Selecione as estrelas.");
            return;
        }
        if (!newTitle.trim() || !newDesc.trim()) {
            Alert.alert("Avaliação", "Preencha título e descrição.");
            return;
        }

        setLoadingReview(true);
        try {
            const validToken = token?.startsWith('Bearer ') ? token : `Bearer ${token}`;
            
            await api.post(
                `/api/review/client/${user.id}/product/${productId}`, 
                {
                    title: newTitle,
                    description: newDesc,
                    rating: newRating
                },
                { headers: { Authorization: validToken } }
            );

            setModalVisible(false);
            setNewRating(0);
            setNewTitle('');
            setNewDesc('');
            setSnackbarMsg("Avaliação enviada!");
            setSnackbarVisible(true);
            fetchReviews(); 

        } catch (error: any) {
            console.error("Erro review:", error.response?.status);
            if (error.response?.status === 403) {
                Alert.alert("Não permitido", "Você precisa ter comprado e recebido este produto para avaliar.");
            } else {
                Alert.alert("Erro", "Falha ao enviar avaliação.");
            }
        } finally {
            setLoadingReview(false);
        }
    };

    // --- HELPER DE INTERFACE ---
    const getHeaderAddress = () => {
        if (user && user.name) {
            const firstAddress = user.addresses && user.addresses.length > 0 ? user.addresses[0] : null;
            if (firstAddress) {
                // Tenta pegar cidade ou bairro, usando cast any se a tipagem estiver incompleta
                const location = (firstAddress as any).city || (firstAddress as any).neighborhood || 'seu endereço';
                return `Enviar para ${user.name.split(' ')[0]} - ${location}`;
            }
            return `Enviar para ${user.name.split(' ')[0]}`;
        }
        return 'Informe seu CEP';
    };

    // --- HELPER NOME VENDEDOR ---
    const getSellerName = () => {
        if (!product?.seller) return "Loja Oficial Souto";
        // Tenta pegar nome fantasia ou razão social, senão mostra ID
        return product.seller.tradeName || product.seller.name || product.seller.companyName || `Vendedor (ID: ${product.seller.id})`;
    };

    if (!product) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={THEME_PRIMARY} />
                <Text style={{marginTop: 10}}>Carregando produto...</Text>
            </View>
        );
    }

    const imageUri = (product.imageURL && product.imageURL.length > 0) ? product.imageURL[0] : null;
    const specifications = product.attributes || [
        { name: 'Especificação', value: product.specification || 'Padrão' },
        { name: 'Categoria', value: product.category?.name || 'Geral' },
    ];

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={ML_YELLOW} />
            
            {/* HEADER */}
            <SafeAreaView edges={['top']} style={{ backgroundColor: ML_YELLOW, zIndex: 100 }}>
                <View style={[styles.headerContainer, { paddingTop: Platform.OS === 'ios' ? 10 : 0 }]}>
                    <View style={styles.headerContent}>
                        <TouchableOpacity onPress={() => router.back()} style={{ paddingRight: 10 }}>
                            <Ionicons name="arrow-back" size={24} color="#333" />
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={styles.searchBar} 
                            onPress={() => router.push('/(aux)/misc/search/' as any)}
                            activeOpacity={0.9}
                        >
                            <Ionicons name="search" size={20} color="#999" style={{ marginLeft: 15 }} />
                            <Text style={styles.searchText} numberOfLines={1}>Buscar no Mercado Souto</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => router.push('/(aux)/shop/cart' as any)} style={{ paddingLeft: 15 }}>
                            <MaterialCommunityIcons name="cart-outline" size={28} color="#333" />
                            {cartItems.length > 0 && (
                                <Badge size={16} style={styles.cartBadge}>{cartItems.length}</Badge>
                            )}
                        </TouchableOpacity>
                        
                        <TouchableOpacity onPress={() => router.push('/(tabs)/menu' as any)} style={{ paddingLeft: 15 }}>
                            <Ionicons name="menu-outline" size={28} color="#333" />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity style={styles.addressRow} onPress={() => router.push('/(aux)/account/address' as any)}>
                        <Ionicons name="location-outline" size={16} color="#333" />
                        <Text style={styles.addressText} numberOfLines={1}>{getHeaderAddress()}</Text>
                        <Ionicons name="chevron-forward" size={14} color="#777" style={{ marginLeft: 2 }} />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false} style={{ backgroundColor: BG_GRAY }}>
                
                {/* 1. CARD PRINCIPAL */}
                <View style={styles.card}>
                    <Text style={styles.conditionText}>Novo  |  {product.totalReviews || 0} reviews</Text>
                    
                    <View style={styles.titleRow}>
                        <Text style={styles.productTitle}>{product.title}</Text>
                        <TouchableOpacity onPress={toggleFavorite}>
                            <MaterialCommunityIcons 
                                name={isFavorite ? "heart" : "heart-outline"} 
                                size={28} 
                                color={THEME_PRIMARY} 
                            />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.imageContainer}>
                         <RNImage 
                            source={imageUri ? { uri: imageUri } : require('../../../../src/assets/icon/icon.png')}
                            style={styles.productImage} 
                            resizeMode="contain" 
                        />
                    </View>

                    <View style={styles.priceContainer}>
                        <Text style={styles.oldPrice}>R$ {(Number(product.price) * 1.1).toFixed(2).replace('.', ',')}</Text>
                        <View style={{flexDirection:'row', alignItems: 'center'}}>
                            <Text style={styles.price}>R$ {Number(product.price).toFixed(2).replace('.', ',')}</Text>
                            <Text style={styles.discount}> 10% OFF</Text>
                        </View>
                        <Text style={styles.installments}>em 10x R$ {(Number(product.price)/10).toFixed(2).replace('.', ',')} sem juros</Text>
                    </View>
                    
                    <View style={styles.shippingContainer}>
                         <Text style={styles.shippingText}>Frete grátis <Text style={{fontStyle: 'italic', fontWeight:'900', color: GREEN_FREE}}>⚡FULL</Text></Text>
                         <Text style={styles.shippingSub}>Chegará grátis amanhã</Text>
                    </View>

                    <Text style={styles.stockText}>Estoque disponível ({product.stock || 0})</Text>

                    <Button 
                        mode="contained" 
                        buttonColor={THEME_PRIMARY} 
                        style={[styles.btnAction, { marginTop: 20 }]}
                        onPress={handleBuyNow} 
                        loading={loadingBuy}
                        labelStyle={{ fontWeight: 'bold' }}
                    >
                        Comprar agora
                    </Button>
                    <Button 
                        mode="contained" 
                        buttonColor="rgba(65, 137, 230, 0.15)" 
                        textColor={THEME_PRIMARY}
                        style={[styles.btnAction, { marginTop: 10 }]}
                        onPress={() => {
                            addToCart(product);
                            setSnackbarMsg('Adicionado ao carrinho!');
                            setSnackbarVisible(true);
                        }}
                        labelStyle={{ fontWeight: 'bold' }}
                    >
                        Adicionar ao carrinho
                    </Button>

                    <View style={styles.benefitsContainer}>
                        <View style={styles.benefitRow}>
                            <Ionicons name="return-down-back" size={20} color={GREEN_FREE} style={{marginRight:10}} />
                            <Text style={styles.benefitText}><Text style={{color: THEME_PRIMARY}}>Devolução grátis.</Text> Você tem 30 dias a partir da data de recebimento.</Text>
                        </View>
                        <View style={styles.benefitRow}>
                            <MaterialCommunityIcons name="shield-check-outline" size={20} color={GREEN_FREE} style={{marginRight:10}} />
                            <Text style={styles.benefitText}><Text style={{color: THEME_PRIMARY}}>Compra Garantida.</Text> Receba o produto que está esperando ou devolvemos o dinheiro.</Text>
                        </View>
                    </View>
                </View>

                {/* 2. CARD VENDEDOR */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Informações do vendedor</Text>
                    <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 15}}>
                        <MaterialCommunityIcons name="store" size={24} color="#333" style={{marginRight: 10}} />
                        <View>
                            {/* CORREÇÃO AQUI: Exibe o nome se existir, senão o ID */}
                            <Text style={{fontWeight: 'bold', fontSize: 16}}>
                                {getSellerName()}
                            </Text>
                            <Text style={{color: '#666', fontSize: 12}}>
                                {product.seller ? `Vendas: ${product.seller.sales}` : "MercadoLíder Platinum"}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.reputationContainer}>
                         <View style={[styles.reputationBar, {backgroundColor: '#fff0f0'}]} />
                         <View style={[styles.reputationBar, {backgroundColor: '#fff5e6'}]} />
                         <View style={[styles.reputationBar, {backgroundColor: '#ffffe6'}]} />
                         <View style={[styles.reputationBar, {backgroundColor: '#f0ffe6'}]} />
                         <View style={[styles.reputationBar, {backgroundColor: '#00a650', height: 8}]} />
                    </View>
                    <TouchableOpacity>
                        <Text style={{color: THEME_PRIMARY, fontSize: 14, marginTop: 15, fontWeight: '600'}}>Ver mais dados deste vendedor</Text>
                    </TouchableOpacity>
                </View>

                {/* 3. FICHA TÉCNICA */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Características do produto</Text>
                    <View style={styles.specsTable}>
                        {specifications.map((spec: any, index: number) => (
                            <View key={index} style={[ styles.specRow, { backgroundColor: index % 2 === 0 ? '#ebebeb' : '#fff' }]}>
                                <Text style={styles.specName}>{spec.name}</Text>
                                <Text style={styles.specValue}>{spec.value}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* 4. DESCRIÇÃO */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Descrição</Text>
                    <Text style={styles.description}>
                        {product.description || 'Produto sem descrição.'}
                    </Text>
                </View>

                {/* 5. AVALIAÇÕES */}
                <View style={styles.card}>
                    <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom: 15}}>
                        <Text style={[styles.sectionTitle, {marginBottom:0}]}>Opiniões</Text>
                        <TouchableOpacity onPress={() => {
                            if (!user || isGuest) {
                                Alert.alert("Login", "Entre para avaliar.", [
                                    { text: "Cancelar" },
                                    { text: "Entrar", onPress: () => router.push('/(auth)/login' as any) }
                                ]);
                            } else {
                                setModalVisible(true);
                            }
                        }}>
                            <Text style={{color: THEME_PRIMARY, fontWeight:'bold'}}>Avaliar produto</Text>
                        </TouchableOpacity>
                    </View>
                    
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
                        <Text style={{ fontSize: 36, color: '#333', fontWeight: 'bold' }}>{product.averageRating?.toFixed(1) || '0.0'}</Text>
                        <View style={{ marginLeft: 15 }}>
                             <View style={{ flexDirection: 'row' }}>
                                {[1,2,3,4,5].map((star) => (
                                    <FontAwesome 
                                        key={star} 
                                        name={star <= (product.averageRating || 0) ? "star" : "star-o"} 
                                        size={18} 
                                        color={THEME_PRIMARY} 
                                    />
                                ))}
                             </View>
                             <Text style={{ color: '#999', fontSize: 12 }}>{product.totalReviews || 0} classificações</Text>
                        </View>
                    </View>

                    {(!reviews || !Array.isArray(reviews) || reviews.length === 0) ? (
                        <Text style={{ color: '#999', fontStyle: 'italic' }}>Ainda não há opiniões sobre este produto.</Text>
                    ) : (
                        reviews.map((review, index) => (
                            <View key={index} style={{ marginBottom: 15, borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 10 }}>
                                <View style={{flexDirection:'row', justifyContent:'space-between'}}>
                                    <View style={{flexDirection:'row'}}>
                                        {[1,2,3,4,5].map((star) => (
                                            <FontAwesome key={star} name={star <= (review.rating || 0) ? "star" : "star-o"} size={12} color={THEME_PRIMARY} />
                                        ))}
                                    </View>
                                    <Text style={{fontSize: 12, color: '#999'}}>{review.clientName || 'Cliente'}</Text>
                                </View>
                                <Text style={{fontWeight:'bold', marginTop: 5, color:'#333'}}>{review.title}</Text>
                                <Text style={{ marginTop: 2, color: '#555' }}>{review.description}</Text>
                            </View>
                        ))
                    )}
                </View>

            </ScrollView>

            {/* MODAL */}
            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setModalVisible(false)}
            >
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{flex: 1}}>
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Escreva sua avaliação</Text>
                                <TouchableOpacity onPress={() => setModalVisible(false)}>
                                    <Ionicons name="close" size={24} color="#666" />
                                </TouchableOpacity>
                            </View>
                            
                            <View style={styles.starsContainer}>
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <TouchableOpacity key={star} onPress={() => setNewRating(star)}>
                                        <FontAwesome 
                                            name={star <= newRating ? "star" : "star-o"} 
                                            size={40} 
                                            color={THEME_PRIMARY} 
                                            style={{ marginHorizontal: 5 }}
                                        />
                                    </TouchableOpacity>
                                ))}
                            </View>
                            <Text style={{textAlign:'center', color: '#999', marginBottom: 15}}>
                                {newRating === 0 ? "Toque nas estrelas para avaliar" : `${newRating} estrelas selecionadas`}
                            </Text>

                            <TextInput
                                placeholder="Título (ex: Ótimo produto!)"
                                style={styles.input}
                                value={newTitle}
                                onChangeText={setNewTitle}
                            />

                            <TextInput
                                placeholder="Descreva sua experiência..."
                                style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
                                value={newDesc}
                                onChangeText={setNewDesc}
                                multiline
                            />

                            <Button 
                                mode="contained" 
                                onPress={handleSubmitReview} 
                                loading={loadingReview}
                                buttonColor={THEME_PRIMARY}
                                style={{ marginTop: 10 }}
                            >
                                Enviar Avaliação
                            </Button>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>

            <Snackbar
                visible={snackbarVisible}
                onDismiss={() => setSnackbarVisible(false)}
                duration={2000}
                style={{ backgroundColor: '#333', marginBottom: 20 }}
            >
                {snackbarMsg}
            </Snackbar>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: BG_GRAY },
    headerContainer: { backgroundColor: ML_YELLOW, paddingBottom: 10 },
    headerContent: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingTop: 5 },
    searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', height: 38, borderRadius: 30, elevation: 2 },
    searchText: { color: '#bbb', marginLeft: 8, fontSize: 13, flex: 1 },
    cartBadge: { position: 'absolute', top: -4, right: -4, backgroundColor: '#d63031', fontSize: 10 },
    addressRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, marginTop: 8 },
    addressText: { fontSize: 12, color: '#333', marginLeft: 5, opacity: 0.8 },
    
    card: { backgroundColor: '#fff', marginTop: 12, padding: 20, elevation: 1 },
    sectionTitle: { fontSize: 18, marginBottom: 15, color: '#333', fontWeight: '500' },
    conditionText: { fontSize: 12, color: '#999', marginBottom: 5 },
    titleRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    productTitle: { fontSize: 18, color: '#333', flex: 1, marginRight: 10, lineHeight: 22 },
    imageContainer: { height: 300, justifyContent: 'center', alignItems: 'center', marginVertical: 10 },
    productImage: { width: '100%', height: '100%' },
    
    priceContainer: { marginVertical: 10 },
    oldPrice: { fontSize: 14, color: '#999', textDecorationLine: 'line-through' },
    price: { fontSize: 32, color: '#333', fontWeight: '400' },
    discount: { fontSize: 16, color: GREEN_FREE, marginLeft: 10 },
    installments: { fontSize: 14, color: GREEN_FREE, marginTop: 5 },
    
    shippingContainer: { marginTop: 15 },
    shippingText: { color: GREEN_FREE, fontSize: 16, fontWeight: '600' },
    shippingSub: { color: '#666', fontSize: 13 },
    stockText: { fontSize: 14, fontWeight: 'bold', marginTop: 15, color: '#333' },

    btnAction: { borderRadius: 6, paddingVertical: 6 },
    benefitsContainer: { marginTop: 20 },
    benefitRow: { flexDirection: 'row', marginBottom: 10, alignItems: 'flex-start' },
    benefitText: { fontSize: 13, color: '#999', flex: 1, lineHeight: 18 },

    reputationContainer: { flexDirection: 'row', height: 6, borderRadius: 3, overflow: 'hidden', marginBottom: 10 },
    reputationBar: { flex: 1, height: '100%', marginHorizontal: 1 },
    
    specsTable: { borderWidth: 1, borderColor: '#ebebeb', borderRadius: 8, overflow: 'hidden' },
    specRow: { flexDirection: 'row', paddingVertical: 12, paddingHorizontal: 15 },
    specName: { flex: 1, fontSize: 14, fontWeight: '600', color: '#333' },
    specValue: { flex: 1.5, fontSize: 14, color: '#666' },

    description: { fontSize: 14, color: '#666', lineHeight: 22, textAlign: 'justify' },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
    modalContent: { backgroundColor: '#fff', borderRadius: 10, padding: 20, elevation: 5 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
    input: { backgroundColor: BG_GRAY, borderRadius: 8, padding: 12, marginBottom: 15, fontSize: 16 },
    starsContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 10 }
});