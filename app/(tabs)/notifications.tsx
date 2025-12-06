import React, { useCallback } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, SafeAreaView, Platform } from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../../constants/theme';

const MOCK_NOTIFICATIONS = [
  { id: '1', title: 'Seu pedido chegou!', body: 'O pacote com "Kit Camisetas" foi entregue.', read: false, time: 'Hoje' },
  { id: '2', title: 'Oferta relâmpago', body: 'Notebook Gamer com 20% OFF só hoje.', read: true, time: 'Ontem' },
  { id: '3', title: 'Prepare-se', body: 'A Black Friday do Mercado Souto está chegando.', read: true, time: '3 dias atrás' },
];

export default function Notifications() {
  const router = useRouter();

  const renderItem = useCallback(({ item }: any) => (
    <TouchableOpacity style={[styles.item, !item.read && styles.unread]}>
      <View style={styles.iconBox}>
        <MaterialCommunityIcons
          name={item.read ? 'bell-outline' : 'bell-ring'}
          size={24}
          color={item.read ? '#666' : theme.colors.primary}
        />
      </View>

      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.body} numberOfLines={2}>{item.body}</Text>
        <Text style={styles.time}>{item.time}</Text>
      </View>

      {!item.read && <View style={styles.dot} />}
    </TouchableOpacity>
  ), []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Notificações</Text>

        <TouchableOpacity>
          <Text style={{ color: '#333' }}>Limpar</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={MOCK_NOTIFICATIONS}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: Platform.OS === 'android' ? 30 : 0 },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: theme.colors.secondary,
    alignItems: 'center'
  },

  headerTitle: { fontSize: 18, fontWeight: '500' },

  item: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 1,
    borderColor: '#f0f0f0',
    alignItems: 'center'
  },

  unread: { backgroundColor: '#fdfbe7' },

  iconBox: { marginRight: 15 },

  title: { fontWeight: 'bold', fontSize: 14, marginBottom: 2 },
  body: { color: '#666', fontSize: 13 },
  time: { color: '#999', fontSize: 11, marginTop: 4 },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3483fa',
    marginLeft: 10
  }
});
