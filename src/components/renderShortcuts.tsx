import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { View, TouchableOpacity } from "react-native";
import { Text } from "react-native-paper";
import { StyleSheet, useWindowDimensions } from "react-native";

const { width: screenWidth } = useWindowDimensions();
const isTablet = screenWidth > 600;

const SHORTCUTS = [
    { id: 1, label: 'Ofertas', icon: 'tag-outline', route: '/(aux)/shop/all-products' },
    { id: 2, label: 'Histórico', icon: 'clock-outline', route: '/(aux)/shop/history' },
    { id: 3, label: 'Minhas Compras', icon: 'shopping-outline', route: '/(aux)/shop/my-purchases/' },
    { id: 4, label: 'Endereços', icon: 'map-marker-outline', route: '/(aux)/account/address/' },
    { id: 5, label: 'Mais', icon: 'plus', route: '/(tabs)/menu' },
];

export default function RenderShortcuts(){
        return (<View style={[styles.shortcutsContainer, { paddingHorizontal: isTablet ? 40 : 10 }]}>
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
        </View>)
}

const styles = StyleSheet.create({
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
});