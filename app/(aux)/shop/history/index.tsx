import React from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert
} from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../../../../src/constants/theme';
import { useHistory } from '../../../../src/context/HistoryContext';

export default function History() {
  const router = useRouter();
  const { history, clearHistory } = useHistory();

  const handleClear = () => {
    Alert.alert('Limpar', 'Deseja apagar todo o histórico?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Apagar', style: 'destructive', onPress: clearHistory }
    ]);
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/(aux)/shop/product/${item.id}` as any)}
    >
      <View style={styles.imageContainer}>
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.image} resizeMode="contain" />
        ) : (
          <MaterialCommunityIcons name="image-off-outline" size={40} color="#ddd" />
        )}
      </View>
      
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.price}>R$ {item.price.toFixed(2).replace('.', ',')}</Text>
      </View>
      
      <MaterialCommunityIcons name="chevron-right" size={24} color="#ccc" />
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
          <Text style={styles.headerTitle}>Histórico</Text>
          {history.length > 0 ? (
            <TouchableOpacity onPress={handleClear}>
              <Text style={styles.clearText}>Limpar</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ width: 40 }} />
          )}
        </View>
      </SafeAreaView>

      <FlatList
        data={history}
        renderItem={renderItem}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ padding: 15 }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="clock-outline" size={60} color="#ddd" />
            <Text style={styles.emptyText}>Você ainda não viu nenhum produto.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { backgroundColor: theme.colors.secondary, paddingTop: 30, elevation: 2 },
  headerContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 15, paddingBottom: 12 },
  headerTitle: { fontSize: 18, fontWeight: '500', color: '#333' },
  clearText: { fontSize: 14, fontWeight: 'bold', color: '#333' },
  
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    alignItems: 'center',
    elevation: 2
  },
  imageContainer: { width: 70, height: 70, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9f9f9', borderRadius: 4, marginRight: 15 },
  image: { width: '100%', height: '100%' },
  info: { flex: 1 },
  title: { fontSize: 14, color: '#333', marginBottom: 5 },
  price: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  
  emptyContainer: { alignItems: 'center', marginTop: 80 },
  emptyText: { color: '#999', fontSize: 16, marginTop: 15 }
});