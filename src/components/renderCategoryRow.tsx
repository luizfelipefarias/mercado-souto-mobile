import { CategoryData } from "@/types/Category";
import { router } from "expo-router";
import { View, TouchableOpacity, FlatList } from "react-native";
import renderProductItem from "./renderProductItem";
import { Text, Button, Badge } from 'react-native-paper';
import { StyleSheet, Image as RNImage, useWindowDimensions } from "react-native";


const { width: screenWidth } = useWindowDimensions();
const isTablet = screenWidth > 600;

interface RenderCategoryRowProps {
    categoriesData: CategoryData[];
    loadProductsByCategory: (categoryId: number, currentOffset: number) => void;
    setCategoriesData: (data: any) => void;
}

export default function renderCategoryRow({ categoriesData, loadProductsByCategory, setCategoriesData }: RenderCategoryRowProps, category: CategoryData) {

        
        const handleLoadMore = (categoryId: number) => {
            const cat = categoriesData.find((c: { id: number; }) => c.id === categoryId);
            if (cat && cat.hasMore && !cat.loading) {
                // Marcar como carregando para evitar múltiplas chamadas
                setCategoriesData((prev: any[]) => prev.map((c: { id: number; }) => c.id === categoryId ? { ...c, loading: true } : c));
                loadProductsByCategory(categoryId, cat.offset);
            }
        };


    if (category.products.length === 0) return null;

    return (<View style={[styles.sectionContainer, isTablet && styles.tabletSection]} key={`category-row-${category.id}`}>
        <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{category.name}</Text>
            <TouchableOpacity onPress={() => router.push({ pathname: '/(aux)/misc/search-results', params: { q: category.name } } as any)}>
                <Text style={styles.seeAll}>Ver tudo --</Text>
            </TouchableOpacity>
        </View>

        <FlatList
            data={category.products}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => `cat-${category.id}-prod-${item.id}`}
            renderItem={renderProductItem}
            contentContainerStyle={{ paddingHorizontal: 15 }}
            onEndReached={() => handleLoadMore(category.id)}
            onEndReachedThreshold={0.5} // Carrega quando chegar em 50% do fim do scroll
            ListFooterComponent={() => category.loading ? (
                <View style={{ justifyContent: 'center', paddingHorizontal: 20 }}>
                    <Text style={{ color: '#999', fontSize: 12 }}>Carregando...</Text>
                </View>
            ) : null}
        />
    </View>)
};

const THEME_PRIMARY = '#3483fa';

const styles = StyleSheet.create({
    sectionContainer: { marginTop: 20 },
    tabletSection: { maxWidth: 900, alignSelf: 'center', width: '100%' },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 15, marginBottom: 10, alignItems: 'center' },
    sectionTitle: { fontSize: 18, color: '#333', fontWeight: '600' },
    seeAll: { color: THEME_PRIMARY, fontSize: 14 },
});