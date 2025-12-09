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
  StatusBar
} from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../../../../src/constants/theme';

export default function Security() {
  const router = useRouter();

  const [biometrics, setBiometrics] = useState(true);
  const [twoFactor, setTwoFactor] = useState(false);

  const handleChangePassword = () => {
    router.push('/(aux)/account/change-password' as any);
  };

  const handleLogoutDevices = () => {
    Alert.alert(
      'Desconectar tudo',
      'Você precisará fazer login novamente em todos os dispositivos. Deseja continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Sim, desconectar', 
          style: 'destructive',
          onPress: () => Alert.alert('Sucesso', 'Todos os outros dispositivos foram desconectados.')
        }
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

        <Text style={styles.headerTitle}>Segurança</Text>

        <View style={{ width: 34 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Acesso</Text>

        <TouchableOpacity style={styles.item} onPress={handleChangePassword}>
          <View>
            <Text style={styles.itemTitle}>Alterar senha</Text>
            <Text style={styles.itemSub}>
              Recomendado trocar periodicamente
            </Text>
          </View>

          <MaterialCommunityIcons name="chevron-right" size={24} color="#ccc" />
        </TouchableOpacity>

        <View style={styles.item}>
          <View>
            <Text style={styles.itemTitle}>Biometria / FaceID</Text>
            <Text style={styles.itemSub}>Usar para entrar no app</Text>
          </View>

          <Switch
            value={biometrics}
            onValueChange={setBiometrics}
            trackColor={{ false: '#767577', true: theme.colors.primary }}
            thumbColor={Platform.OS === 'android' ? '#f4f3f4' : ''}
          />
        </View>

        <View style={styles.item}>
          <View style={{ maxWidth: '80%' }}>
            <Text style={styles.itemTitle}>Verificação em duas etapas</Text>
            <Text style={styles.itemSub}>
              Código extra ao entrar em novos dispositivos
            </Text>
          </View>

          <Switch
            value={twoFactor}
            onValueChange={setTwoFactor}
            trackColor={{ false: '#767577', true: theme.colors.primary }}
            thumbColor={Platform.OS === 'android' ? '#f4f3f4' : ''}
          />
        </View>

        <Text style={styles.sectionTitle}>Dispositivos Ativos</Text>

        <View style={styles.deviceCard}>
          <MaterialCommunityIcons name="cellphone" size={30} color="#333" />

          <View style={{ marginLeft: 15, flex: 1 }}>
            <Text style={{ fontWeight: 'bold' }}>Este dispositivo</Text>
            <Text style={{ color: '#666', fontSize: 12 }}>
              App Mobile • Atual
            </Text>
          </View>

          <Text style={{ color: '#00a650', fontSize: 12, fontWeight: 'bold' }}>
            Online
          </Text>
        </View>

        <View style={[styles.deviceCard, { opacity: 0.6 }]}>
          <MaterialCommunityIcons name="laptop" size={30} color="#333" />

          <View style={{ marginLeft: 15, flex: 1 }}>
            <Text style={{ fontWeight: 'bold' }}>Windows PC</Text>
            <Text style={{ color: '#666', fontSize: 12 }}>
              Chrome • São Paulo, BR
            </Text>
          </View>

          <Text style={{ color: '#666', fontSize: 12 }}>Há 2 dias</Text>
        </View>

        <TouchableOpacity
          style={styles.dangerButton}
          onPress={handleLogoutDevices}
        >
          <Text style={styles.dangerText}>
            Desconectar todos os dispositivos
          </Text>
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

  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginTop: 10,
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

  itemTitle: {
    fontSize: 16,
    color: '#333'
  },

  itemSub: {
    fontSize: 12,
    color: '#888',
    marginTop: 2
  },

  deviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderBottomWidth: 1,
    borderColor: '#eee',
    marginBottom: 5
  },

  dangerButton: {
    marginTop: 30,
    alignItems: 'center',
    padding: 15,
    borderWidth: 1,
    borderColor: '#ff3e3e',
    borderRadius: 8
  },

  dangerText: {
    color: '#ff3e3e',
    fontWeight: 'bold'
  }
});