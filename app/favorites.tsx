import React from 'react';
import { View, StyleSheet, FlatList, Image, TouchableOpacity, SafeAreaView, Platform, StatusBar } from 'react-native';
import { Text, Divider } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../constants/theme';
import { useAndroidNavigationBar } from '../hooks/useAndroidNavigationBar';

const MOCK_FAVORITES = [
  { id: 1, name: 'Smart TV 50" 4K UHD', price: 2199.00, image: 'https://http2.mlstatic.com/D_NQ_NP_821636-MLA46604993138_072021-O.webp' },
  { id: 2, name: 'PlayStation 5', price: 3500.00, image: 'https://http2.mlstatic.com/D_NQ_NP_841787-MLA44484414455_012021-O.webp' },
];

export default function Favorites() {
  const router = useRouter();
useAndroidNavigationBar(true);
  const renderItem = ({ item }: any) => (
    <TouchableOpacity style={styles.itemContainer} onPress={() => router.push(`/product/${item.id}` as any)}>
      <Image source={{ uri: item.image }} style={styles.image} resizeMode="contain" />
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.price}>R$ {item.price.toFixed(2).replace('.', ',')}</Text>
        <Text style={styles.shipping}>Chega grátis amanhã</Text>
        <TouchableOpacity style={styles.deleteBtn}>
            <Text style={{color: theme.colors.primary}}>Excluir</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.secondary} />
      
      <SafeAreaView style={styles.header}>
        <View style={styles.headerContent}>
            <TouchableOpacity onPress={() => router.back()}>
                <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.title}>Favoritos</Text>
            <View style={{width: 24}}/>
        </View>
      </SafeAreaView>

      <FlatList
        data={MOCK_FAVORITES}
        keyExtractor={item => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={{padding: 15}}
        ItemSeparatorComponent={() => <Divider style={{marginVertical: 10}} />}
        ListEmptyComponent={<Text style={{textAlign: 'center', marginTop: 20, color: '#999'}}>Você não tem favoritos ainda.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { backgroundColor: theme.colors.secondary, paddingTop: Platform.OS === 'android' ? 30 : 0 },
  headerContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 15 },
  title: { fontSize: 18, fontWeight: '500', color: '#333' },
  itemContainer: { flexDirection: 'row', paddingVertical: 5 },
  image: { width: 80, height: 80, marginRight: 15 },
  info: { flex: 1, justifyContent: 'center' },
  name: { fontSize: 14, color: '#333' },
  price: { fontSize: 18, fontWeight: 'bold', color: '#333', marginTop: 4 },
  shipping: { fontSize: 12, color: '#00a650' },
  deleteBtn: { marginTop: 5 },
});