import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  StatusBar,
} from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

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

  const balance = useMemo(() => 1250, []);
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

          <Text style={styles.balanceValue}>
            {hideBalance ? 'R$ ****' : formattedBalance}
          </Text>

          <TouchableOpacity style={styles.earningsLink}>
            <Text style={styles.earningsText}>Ver rendimento</Text>
            <MaterialCommunityIcons name="chevron-right" size={16} color="#fff" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.content}>
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
          style={{ marginTop: 20 }}
          onPress={() => router.push('/address')}
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
    marginBottom: 5,
  },

  actionLabel: {
    fontSize: 12,
    color: '#333',
  },

  cardSection: {
    marginTop: 10,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },

  creditCard: {
    backgroundColor: '#2c3e50',
    borderRadius: 12,
    padding: 20,
    height: 160,
    justifyContent: 'space-between',
    elevation: 3,
  },

  cardNumber: {
    color: '#fff',
    marginTop: 15,
    fontSize: 16,
    letterSpacing: 2,
  },

  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  cardName: {
    color: '#fff',
    fontWeight: 'bold',
  },

  cardDate: {
    color: '#fff',
  },
});
