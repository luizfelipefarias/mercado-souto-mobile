import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Platform, Image } from 'react-native';
import { Text, Divider } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../../../../src/constants/theme';

export default function OrderDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const steps = [
    { title: 'Compra aprovada', date: '10 nov 14:30', active: true },
    { title: 'Em preparação', date: '10 nov 16:00', active: true },
    { title: 'A caminho', date: '11 nov 08:00', active: true },
    { title: 'Entregue', date: 'Chegou em 12 nov', active: true },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#333"/>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Detalhe do envio</Text>

        <TouchableOpacity>
          <MaterialCommunityIcons name="help-circle-outline" size={24} color="#333"/>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <View style={styles.statusCard}>
          <MaterialCommunityIcons name="check-circle" size={30} color="#00a650" />
          <View style={{ marginLeft: 15 }}>
            <Text style={{ fontWeight: 'bold', fontSize: 16 }}>Entregue</Text>
            <Text style={{ color: '#666' }}>Chegou na segunda-feira 12 de novembro</Text>
          </View>
        </View>

        <View style={styles.timeline}>
          {steps.map((step, index) => (
            <View key={index} style={styles.stepRow}>
              <View style={styles.stepIndicator}>
                <View style={[styles.dot, step.active && styles.dotActive]} />
                {index < steps.length - 1 && (
                  <View style={[styles.line, step.active && styles.lineActive]} />
                )}
              </View>

              <View style={styles.stepContent}>
                <Text style={[styles.stepTitle, step.active && { color: '#00a650' }]}>
                  {step.title}
                </Text>
                <Text style={styles.stepDate}>{step.date}</Text>
              </View>
            </View>
          ))}
        </View>

        <Divider style={{ marginVertical: 20 }} />

        <View style={styles.addressInfo}>
          <MaterialCommunityIcons name="map-marker-outline" size={24} color="#ccc" />
          <View style={{ marginLeft: 15 }}>
            <Text style={{ color: '#666', fontSize: 12 }}>Rua Exemplo, 123 - Boa Viagem</Text>
            <Text style={{ fontWeight: 'bold' }}>Luiz Felipe</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.productCard}
          onPress={() => router.push(`/product/${id}` as any)}
        >
          <Image
            source={{ uri: 'https://via.placeholder.com/100' }}
            style={{ width: 50, height: 50, marginRight: 15 }}
          />

          <View style={{ flex: 1 }}>
            <Text numberOfLines={1}>Kit Camisetas Básicas Algodão</Text>
            <Text style={{ color: '#666' }}>1 unidade</Text>
          </View>

          <MaterialCommunityIcons name="chevron-right" size={20} color="#ccc" />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: Platform.OS === 'android' ? 30 : 0 },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    alignItems: 'center',
    backgroundColor: theme.colors.secondary
  },

  headerTitle: { fontSize: 18, fontWeight: '500' },

  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20
  },

  timeline: { marginLeft: 10 },
  stepRow: { flexDirection: 'row', height: 60 },
  stepIndicator: { alignItems: 'center', width: 20 },

  dot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#ddd', zIndex: 1 },
  dotActive: { backgroundColor: '#00a650' },

  line: { width: 2, flex: 1, backgroundColor: '#ddd', marginTop: -2 },
  lineActive: { backgroundColor: '#00a650' },

  stepContent: { marginLeft: 15, marginTop: -3 },
  stepTitle: { fontSize: 14, fontWeight: 'bold', color: '#ccc' },
  stepDate: { fontSize: 12, color: '#999' },

  addressInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },

  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: '#eee',
    paddingTop: 15
  }
});
