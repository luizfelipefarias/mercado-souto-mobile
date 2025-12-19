import { ProductUI } from "@/types/Product";
import { router } from "expo-router";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import { Text, Button, Badge } from 'react-native-paper';
import { StyleSheet, Image as RNImage, useWindowDimensions } from "react-native";


const { width: screenWidth } = useWindowDimensions();
const isTablet = screenWidth > 600;

export default function renderProductItem({ item }: { item: ProductUI }) {
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
                <Text style={styles.shipping}>Frete grátis <Text style={{ fontStyle: 'italic', color: '#00a650', fontWeight: '900' }}>⚡FULL</Text></Text>
            </View>
        </TouchableOpacity>
    );
};

const GREEN_FREE = '#00a650';

const styles = StyleSheet.create({
    productCard: {
        backgroundColor: '#fff', borderRadius: 6, marginHorizontal: 8,
        elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 3, shadowOffset: { width: 0, height: 1 },
        paddingBottom: 10, marginBottom: 5, height: 290
    },
    imageContainer: { height: 140, justifyContent: 'center', alignItems: 'center', padding: 10, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
    productImage: { width: '100%', height: '100%' },
    productInfo: { padding: 10, flex: 1, justifyContent: 'space-between' },
    productName: { fontSize: 14, color: '#333', marginBottom: 4, height: 38 },
    price: { fontSize: 20, color: '#333', fontWeight: '500' },
    installments: { fontSize: 12, color: GREEN_FREE },
    shipping: { fontSize: 12, color: GREEN_FREE, fontWeight: 'bold' }

});