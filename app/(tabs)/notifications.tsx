import React, { useCallback } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, SafeAreaView, Platform, StatusBar } from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../../src/constants/theme';
import { useAndroidNavigationBar } from '../../src/hooks/useAndroidNavigationBar';

const MOCK_NOTIFICATIONS = [
  { id: '1', title: 'Seu pedido chegou!', body: 'O pacote com "Kit Camisetas" foi entregue.', read: false, time: 'Hoje' },
  { id: '2', title: 'Oferta relâmpago', body: 'Notebook Gamer com 20% OFF só hoje.', read: true, time: 'Ontem' },
  { id: '3', title: 'Prepare-se', body: 'A Black Friday do Mercado Souto está chegando.', read: true, time: '3 dias atrás' },
];

export default function Notifications() {
  const router = useRouter();
  
  useAndroidNavigationBar(true);

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
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.secondary} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 5 }}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Notificações</Text>

        <TouchableOpacity onPress={() => { /* Lógica de limpar */ }}>
          <Text style={styles.clearText}>Limpar</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={MOCK_NOTIFICATIONS}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListEmptyComponent={
            <View style={styles.emptyContainer}>
                <MaterialCommunityIcons name="bell-sleep-outline" size={60} color="#ccc" />
                <Text style={styles.emptyText}>Você não tem notificações.</Text>
            </View>
        }
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
    alignItems: 'center',
    elevation: 2,
  },

  headerTitle: { fontSize: 18, fontWeight: '500', color: '#333' },
  
  clearText: { color: '#333', fontSize: 14 },

  item: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 1,
    borderColor: '#f0f0f0',
    alignItems: 'center'
  },

  unread: { backgroundColor: '#fffdf0' },

  iconBox: { marginRight: 15 },

  title: { fontWeight: 'bold', fontSize: 14, marginBottom: 2, color: '#333' },
  body: { color: '#666', fontSize: 13 },
  time: { color: '#999', fontSize: 11, marginTop: 4 },

  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.primary,
    marginLeft: 10
  },

  emptyContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 100
  },
  emptyText: {
      marginTop: 15,
      color: '#999',
      fontSize: 16
  }
});