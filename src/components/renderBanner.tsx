import React, { useState } from "react";
import { View, FlatList, StyleSheet, Image as RNImage, useWindowDimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";


const BANNER_IMAGES = [
    require('../../src/assets/img/ui/banner1.webp'),
    require('../../src/assets/img/ui/carousel0.webp'),
    require('../../src/assets/img/ui/carousel1.webp'),
    require('../../src/assets/img/ui/carousel2.webp'),
    require('../../src/assets/img/ui/carousel3.webp'),
    require('../../src/assets/img/ui/carousel4.webp'),
];

export default function renderBanner() {
    const [activeBanner, setActiveBanner] = useState(0);
    
    const { width: screenWidth } = useWindowDimensions();
    
    const isTablet = screenWidth > 600;
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


const styles = StyleSheet.create({
    paginationContainer: { flexDirection: 'row', position: 'absolute', bottom: 15, alignSelf: 'center' },
    dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.5)', margin: 3 },
    bannerGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 20 },
    bannerContainer: { position: 'relative' },

    activeDot: { backgroundColor: '#fff' },
});