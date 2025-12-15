import React, { useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Platform,
  Alert
} from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '@/constants/theme';
import { useCart } from '@/context/CartContext'; 
import { useFavorites, FavoriteProduct } from '@/context/FavoritesContext';

export default function FavoritesScreen() {
  const router = useRouter();
  const { cartItems } = useCart(); 
  
  const { favorites, loadingFavorites, removeFavorite, refreshFavorites } = useFavorites();

  const handleOpenProduct = (id: number) => {
    router.push(`/(aux)/shop/product/${id}` as any);
  };

  const handleRemovePress = (id: number) => {
    if (Platform.OS === 'web') {
        if (window.confirm("Remover este item dos favoritos?")) {
            removeFavorite(id);
        }
    } else {
        Alert.alert(
            "Remover Favorito", 
            "Deseja remover este item da sua lista?", 
            [
                { text: "Cancelar", style: "cancel" },
                { text: "Sim, remover", style: "destructive", onPress: () => removeFavorite(id) }
            ]
        );
    }
  };

  const renderItem = ({ item }: { item: FavoriteProduct }) => {
    const imageUri = (item.imageURL && item.imageURL.length > 0) 
        ? item.imageURL[0] 
        : null;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => handleOpenProduct(item.id)}
        activeOpacity={0.9}
      >
        <View style={styles.imageContainer}>
            {imageUri ? (
                <Image
                  source={{ uri: imageUri }}
                  style={styles.image}
                  resizeMode="contain"
                />
            ) : (
                <MaterialCommunityIcons name="image-off-outline" size={30} color="#ccc" />
            )}
        </View>

        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={2}>
            {item.title}
          </Text>

          <Text style={styles.price}>
            R$ {item.price.toFixed(2).replace('.', ',')}
          </Text>

          <Text style={styles.shipping}>Frete grátis</Text>
        </View>

        <TouchableOpacity 
            style={styles.deleteBtn} 
            onPress={() => handleRemovePress(item.id)}
        >
          <MaterialCommunityIcons name="trash-can-outline" size={24} color={theme.colors.primary} />
          <Text style={styles.deleteText}>Excluir</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.secondary} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Favoritos</Text>

        <TouchableOpacity onPress={() => router.push('/(aux)/shop/cart/index' as any)} style={{ padding: 5 }}>
            <MaterialCommunityIcons name="cart-outline" size={24} color="#333" />
            {cartItemCount > 0 && (
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>{cartItemCount}</Text>
                </View>
            )}
        </TouchableOpacity>
      </View>

      {/* Lista de Produtos */}
      {loadingFavorites ? (
        <ActivityIndicator
          size="large"
          color={theme.colors.primary}
          style={{ marginTop: 50 }}
        />
      ) : (
        <FlatList
          data={favorites}
          renderItem={renderItem}
          keyExtractor={item => String(item.id)}
          contentContainerStyle={{ padding: 10, paddingBottom: 80 }}
          showsVerticalScrollIndicator={false}
          onRefresh={refreshFavorites}
          refreshing={loadingFavorites}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
                <MaterialCommunityIcons name="heart-broken" size={60} color="#ddd" />
                <Text style={styles.emptyText}>Você não tem favoritos ainda.</Text>
                <TouchableOpacity onPress={() => router.push('/(tabs)' as any)} style={{ marginTop: 15 }}>
                    <Text style={styles.linkText}>Descobrir produtos</Text>
                </TouchableOpacity>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
      flex: 1, 
      backgroundColor: '#f5f5f5',
      paddingTop: Platform.OS === 'android' ? 30 : 0 
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: theme.colors.secondary,
    alignItems: 'center',
    elevation: 2,
  },
  headerTitle: { fontSize: 20, fontWeight: '500', color: '#333' },
  
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginBottom: 2, 
    padding: 15,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    borderRadius: 4
  },
  imageContainer: {
      width: 80, 
      height: 80,
      backgroundColor: '#f9f9f9',
      borderRadius: 4,
      justifyContent: 'center',
      alignItems: 'center'
  },
  image: { 
      width: '100%', 
      height: '100%'
  },
  info: {
    flex: 1,
    marginLeft: 15,
    justifyContent: 'center',
  },
  title: { fontSize: 14, color: '#333', marginBottom: 5, lineHeight: 18 },
  price: { fontSize: 18, fontWeight: '500', color: '#333' },
  shipping: { fontSize: 12, color: '#00a650', fontWeight: 'bold', marginTop: 2 },
  
  deleteBtn: {
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteText: {
      color: theme.colors.primary,
      fontSize: 12,
      marginTop: 2
  },

  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#d63031',
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  
  emptyContainer: {
      alignItems: 'center',
      marginTop: 60
  },
  emptyText: {
      marginTop: 15,
      fontSize: 16,
      color: '#666'
  },
  linkText: {
      color: '#3483fa',
      fontWeight: 'bold',
      fontSize: 16
  }
});