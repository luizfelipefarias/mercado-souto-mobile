import React, { useCallback, useMemo, useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  StatusBar,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../../../src/context/AuthContext';
import api from '../../../../src/services/api';

type ActionItem = {
  label: string;
  icon: string;
};

const ACTIONS: ActionItem[] = [
  { label: 'Pix', icon: 'qrcode' },
  { label: 'Transferir', icon: 'bank-transfer' },
  { label: 'Sacar', icon: 'cash' },
  { label: 'Boletos', icon: 'barcode' },
];

export default function Wallet() {
  const router = useRouter();
  const { user } = useAuth();

  const [hideBalance, setHideBalance] = useState(false);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchBalance = useCallback(async () => {
    try {
      const userId = (user as any)?.id;
      if (!userId) return;

      const response = await api.get(`/api/client/${userId}`);
      
      const serverBalance = response.data?.seller?.balance || 0;
      setBalance(serverBalance);

    } catch (error) {
      console.log('Erro ao buscar saldo:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchBalance();
  }, [fetchBalance]);

  const formattedBalance = useMemo(
    () => `R$ ${balance.toFixed(2).replace('.', ',')}`,
    [balance]
  );

  const toggleBalanceVisibility = useCallback(() => {
    setHideBalance(prev => !prev);
  }, []);

  const handleActionPress = useCallback((label: string) => {
    console.log(`Ação clicada: ${label}`);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#009ee3" />

      <SafeAreaView style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Conta Mercado Souto</Text>

          <TouchableOpacity>
            <MaterialCommunityIcons
              name="help-circle-outline"
              size={24}
              color="#fff"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <Text style={styles.balanceLabel}>Saldo disponível</Text>

            <TouchableOpacity onPress={toggleBalanceVisibility}>
              <MaterialCommunityIcons
                name={hideBalance ? 'eye-off' : 'eye'}
                size={20}
                color="#fff"
              />
            </TouchableOpacity>
          </View>

          {loading ? (
             <ActivityIndicator color="#fff" style={{alignSelf: 'flex-start', marginTop: 10}} />
          ) : (
            <Text style={styles.balanceValue}>
              {hideBalance ? 'R$ ****' : formattedBalance}
            </Text>
          )}

          <TouchableOpacity style={styles.earningsLink}>
            <Text style={styles.earningsText}>Ver rendimento</Text>
            <MaterialCommunityIcons name="chevron-right" size={16} color="#fff" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView 
        contentContainerStyle={styles.content}
        refreshControl={
            <RefreshControl 
                refreshing={refreshing} 
                onRefresh={onRefresh} 
                colors={['#009ee3']} 
            />
        }
      >
        <View style={styles.actionsGrid}>
          {ACTIONS.map(action => (
            <TouchableOpacity
              key={action.label}
              style={styles.actionItem}
              onPress={() => handleActionPress(action.label)}
            >
              <View style={styles.actionIcon}>
                <MaterialCommunityIcons
                  name={action.icon as any}
                  size={28}
                  color="#009ee3"
                />
              </View>

              <Text style={styles.actionLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.cardSection}>
          <Text style={styles.sectionTitle}>Seus cartões</Text>

          <View style={styles.creditCard}>
            <MaterialCommunityIcons
              name="credit-card-chip"
              size={30}
              color="#fff"
            />

            <Text style={styles.cardNumber}>
              **** **** **** 1234
            </Text>

            <View style={styles.cardFooter}>
              <Text style={styles.cardName}>
                {(user as any)?.name?.toUpperCase() || 'USUÁRIO'}
              </Text>

              <Text style={styles.cardDate}>12/29</Text>
            </View>
          </View>
        </View>

        <Button
          mode="outlined"
          style={{ marginTop: 20, borderColor: '#009ee3' }}
          textColor="#009ee3"
          onPress={() => router.push('/(aux)/account/address' as any)}
        >
          Gerenciar endereços
        </Button>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },

  header: {
    backgroundColor: '#009ee3',
    paddingTop: Platform.OS === 'android' ? 30 : 0,
    paddingBottom: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },

  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    marginBottom: 20,
    alignItems: 'center',
  },

  headerTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  balanceCard: {
    paddingHorizontal: 20,
  },

  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  balanceLabel: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.9,
  },

  balanceValue: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 5,
  },

  earningsLink: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },

  earningsText: {
    color: '#fff',
    fontWeight: 'bold',
    marginRight: 5,
    fontSize: 12,
  },

  content: {
    padding: 15,
  },

  actionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    elevation: 2,
    marginTop: -30,
    marginBottom: 20,
  },

  actionItem: {
    alignItems: 'center',
  },

  actionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f8ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },

  actionLabel: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
  },

  cardSection: {
    marginTop: 10,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },

  creditCard: {
    backgroundColor: '#2c3e50',
    borderRadius: 12,
    padding: 20,
    height: 180,
    justifyContent: 'space-between',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
  },

  cardNumber: {
    color: '#fff',
    fontSize: 18,
    letterSpacing: 3,
    alignSelf: 'center',
  },

  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  cardName: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },

  cardDate: {
    color: '#fff',
    fontSize: 14,
  },
});