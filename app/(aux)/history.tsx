import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../../constants/theme';

type HistoryItem = {
  id: number;
  title: string;
  date: string;
};

export default function History() {
  const router = useRouter();

  const history: HistoryItem[] = [];

  const isEmpty = history.length === 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>

        <Text style={styles.title}>Histórico de Navegação</Text>

        <View style={styles.rightSpacer} />
      </View>

      {isEmpty ? (
        <View style={styles.center}>
          <MaterialCommunityIcons
            name="clock-alert-outline"
            size={60}
            color="#ccc"
          />
          <Text style={styles.emptyText}>
            Seu histórico aparecerá aqui.
          </Text>
        </View>
      ) : (
        <FlatList
          data={history}
          keyExtractor={item => String(item.id)}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <Text style={styles.itemTitle}>{item.title}</Text>
              <Text style={styles.itemDate}>{item.date}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: theme.colors.secondary,
    alignItems: 'center',
  },

  backButton: {
    padding: 5,
  },

  rightSpacer: {
    width: 34,
  },

  title: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  emptyText: {
    color: '#666',
    marginTop: 10,
  },

  listContent: {
    padding: 15,
  },

  item: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 6,
    marginBottom: 10,
  },

  itemTitle: {
    fontWeight: 'bold',
    color: '#333',
  },

  itemDate: {
    marginTop: 4,
    color: '#777',
    fontSize: 12,
  },
});
