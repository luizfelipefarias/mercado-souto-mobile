import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { useWindowDimensions, View } from "react-native";
import { StyleSheet, Image as RNImage } from "react-native";
import { Text } from "react-native-paper";

const VAN_LOGO = require('../../src/assets/img/ui/van-logo.png');

const { width: screenWidth } = useWindowDimensions();
const isTablet = screenWidth > 600;

export default function RenderShippingBanner(){

    return (
        <View style={[styles.shippingBanner, isTablet && styles.tabletSection]}>
            <View style={styles.shippingContent}>
                <RNImage source={VAN_LOGO} style={styles.vanIcon} resizeMode="contain" />
                <View style={{ marginLeft: 10, flex: 1 }}>
                    <Text style={{ fontSize: 12, color: '#00a650', fontWeight: 'bold' }}>Frete Grátis</Text>
                    <Text style={{ fontSize: 12, color: '#666' }}>Em milhões de produtos a partir de R$ 79</Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={20} color="#ccc" />
            </View>
        </View>
    )
};

const styles = StyleSheet.create({
        shippingBanner: { paddingHorizontal: 15, marginTop: 15, marginBottom: 5 },
    shippingContent: {
        backgroundColor: '#fff', padding: 10, borderRadius: 6, flexDirection: 'row', alignItems: 'center',
        elevation: 1, shadowColor: '#000', shadowOpacity: 0.05
    },
    vanIcon: { width: 50, height: 50 },

    tabletSection: { maxWidth: 900, alignSelf: 'center', width: '100%' },
});