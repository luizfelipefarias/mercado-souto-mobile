import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  SafeAreaView,
  Platform,
  StatusBar,
  ActivityIndicator
} from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../../constants/theme';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function Privacy() {
  const router = useRouter();
  const { user, signOut } = useAuth();

  const [ads, setAds] = useState(true);
  const [location, setLocation] = useState(true);
  const [loading, setLoading] = useState(false);

  const confirmDeletion = async () => {
    const userId = user?.id;

    if (!userId) {
      Alert.alert('Erro', 'Usuário não identificado.');
      return;
    }

    setLoading(true);

    try {
      await api.delete(`/api/client/${userId}`);
      await signOut();

      Alert.alert(
        'Conta excluída',
        'Sua conta foi removida com sucesso.',
        [{ text: 'OK', onPress: () => router.replace('/login' as any) }]
      );
    } catch {
      Alert.alert(
        'Erro',
        'Não foi possível excluir a conta no momento. Tente novamente mais tarde.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Excluir conta',
      'Essa ação é irreversível. Você perderá seus dados e histórico. Deseja continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sim, excluir', style: 'destructive', onPress: confirmDeletion }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={theme.colors.secondary}
      />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 5 }}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Privacidade</Text>

        <View style={{ width: 34 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.infoBox}>
          <MaterialCommunityIcons
            name="shield-account-outline"
            size={40}
            color={theme.colors.primary}
          />
          <Text style={styles.infoText}>
            No Mercado Souto, levamos sua privacidade a sério. Controle aqui como
            usamos seus dados.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Preferências</Text>

        <View style={styles.item}>
          <View style={{ maxWidth: '80%' }}>
            <Text style={styles.itemTitle}>Anúncios personalizados</Text>
            <Text style={styles.itemSub}>
              Permitir uso dos dados de navegação para ofertas relevantes.
            </Text>
          </View>

          <Switch
            value={ads}
            onValueChange={setAds}
            trackColor={{ false: '#767577', true: theme.colors.primary }}
          />
        </View>

        <View style={styles.item}>
          <View style={{ maxWidth: '80%' }}>
            <Text style={styles.itemTitle}>Uso de localização</Text>
            <Text style={styles.itemSub}>
              Melhorar estimativa de frete e lojas próximas.
            </Text>
          </View>

          <Switch
            value={location}
            onValueChange={setLocation}
            trackColor={{ false: '#767577', true: theme.colors.primary }}
          />
        </View>

        <Text style={styles.sectionTitle}>Seus dados</Text>

        <TouchableOpacity
          style={styles.itemArrow}
          onPress={() =>
            Alert.alert('Solicitação enviada', 'Seus dados serão enviados em até 48h.')
          }
        >
          <Text style={styles.itemTitle}>Baixar meus dados</Text>
          <MaterialCommunityIcons name="download-outline" size={24} color="#666" />
        </TouchableOpacity>

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>Zona de Perigo</Text>

        <TouchableOpacity
          style={[styles.deleteButton, loading && { opacity: 0.7 }]}
          onPress={handleDeleteAccount}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <MaterialCommunityIcons
                name="alert-circle-outline"
                size={24}
                color="#fff"
                style={{ marginRight: 10 }}
              />
              <Text style={styles.deleteText}>Excluir minha conta</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: Platform.OS === 'android' ? 30 : 0
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: theme.colors.secondary
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: '500'
  },

  content: {
    padding: 20
  },

  infoBox: {
    alignItems: 'center',
    marginBottom: 20,
    padding: 10
  },

  infoText: {
    textAlign: 'center',
    marginTop: 10,
    color: '#666',
    lineHeight: 20
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 15,
    marginBottom: 10,
    textTransform: 'uppercase'
  },

  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 1
  },

  itemArrow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 1
  },

  itemTitle: {
    fontSize: 16,
    color: '#333'
  },

  itemSub: {
    fontSize: 12,
    color: '#888',
    marginTop: 4
  },

  divider: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 10
  },

  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ff3e3e',
    padding: 15,
    borderRadius: 8,
    marginTop: 5,
    height: 55
  },

  deleteText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16
  }
});
