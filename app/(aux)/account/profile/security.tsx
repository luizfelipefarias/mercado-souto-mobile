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
} from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../../../../src/constants/theme';
import Toast from 'react-native-toast-message';

import { useAuth } from '../../../../src/context/AuthContext';

export default function Security() {
  const router = useRouter();
  const { signOut } = useAuth();

  const [biometrics, setBiometrics] = useState(true);
  const [twoFactor, setTwoFactor] = useState(false);

  const isWeb = Platform.OS === 'web';
  const currentDeviceIcon = isWeb ? 'monitor' : 'cellphone'; 
  const currentDeviceName = isWeb ? 'Navegador Web' : `App ${Platform.OS === 'ios' ? 'iOS' : 'Android'}`;

  const handleChangePassword = () => {
    router.push('/(aux)/account/profile/change-password' as any);
  };

  const handleLogoutDevices = () => {
    const message = 'Você será desconectado da sua conta. Deseja continuar?';
    
    const performLogoutAction = async () => {
        try {
            await signOut();
            Toast.show({ 
                type: 'success', 
                text1: 'Desconectado', 
                text2: 'Saindo da conta...',
                visibilityTime: 2000
            });
        } catch (error) {
            console.log("Erro ao sair", error);
        }
    };

    if (isWeb) {
        if (window.confirm(message)) {
            performLogoutAction();
        }
    } else {
        Alert.alert(
          'Desconectar',
          message,
          [
            { text: 'Cancelar', style: 'cancel' },
            { 
              text: 'Sim, sair agora', 
              style: 'destructive',
              onPress: performLogoutAction
            }
          ]
        );
    }
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

        {/* Biometria só faz sentido em Mobile, podemos esconder na Web se quiser */}
        {!isWeb && (
            <View style={styles.item}>
            <View>
                <Text style={styles.itemTitle}>Biometria / FaceID</Text>
                <Text style={styles.itemSub}>Usar para entrar no app</Text>
            </View>

            <Switch
                value={biometrics}
                onValueChange={(value) => {
                setBiometrics(value);
                Toast.show({
                    type: 'info',
                    text1: 'Preferência Salva',
                    text2: value ? 'Biometria ativada.' : 'Biometria desativada.',
                    visibilityTime: 2000
                });
                }}
                trackColor={{ false: '#767577', true: theme.colors.primary }}
                thumbColor={Platform.OS === 'android' ? '#f4f3f4' : ''}
            />
            </View>
        )}

        <View style={styles.item}>
          <View style={{ maxWidth: '80%' }}>
            <Text style={styles.itemTitle}>Verificação em duas etapas</Text>
            <Text style={styles.itemSub}>
              Código extra ao entrar em novos dispositivos
            </Text>
          </View>

          <Switch
            value={twoFactor}
            onValueChange={(value) => {
                setTwoFactor(value);
                Toast.show({
                    type: 'info',
                    text1: 'Preferência Salva',
                    text2: value ? 'Verificação em 2 etapas ativada.' : 'Verificação em 2 etapas desativada.',
                    visibilityTime: 2000
                });
            }}
            trackColor={{ false: '#767577', true: theme.colors.primary }}
            thumbColor={Platform.OS === 'android' ? '#f4f3f4' : ''}
          />
        </View>

        <Text style={styles.sectionTitle}>Dispositivos Ativos</Text>

        {/* --- CARD DINÂMICO DO DISPOSITIVO ATUAL --- */}
        <View style={styles.deviceCard}>
          <MaterialCommunityIcons name={currentDeviceIcon as any} size={30} color="#333" />

          <View style={{ marginLeft: 15, flex: 1 }}>
            <Text style={{ fontWeight: 'bold' }}>Este dispositivo</Text>
            <Text style={{ color: '#666', fontSize: 12 }}>
              {currentDeviceName} • Atual
            </Text>
          </View>

          <Text style={{ color: '#00a650', fontSize: 12, fontWeight: 'bold' }}>
            Online
          </Text>
        </View>

        {/* --- CARD ESTÁTICO DE EXEMPLO (Oposto ao atual) --- */}
        <View style={[styles.deviceCard, { opacity: 0.6 }]}>
          <MaterialCommunityIcons name={isWeb ? "cellphone" : "laptop"} size={30} color="#333" />

          <View style={{ marginLeft: 15, flex: 1 }}>
            <Text style={{ fontWeight: 'bold' }}>{isWeb ? "iPhone 13" : "Windows PC"}</Text>
            <Text style={{ color: '#666', fontSize: 12 }}>
              {isWeb ? "App Mobile" : "Chrome"} • São Paulo, BR
            </Text>
          </View>

          <Text style={{ color: '#666', fontSize: 12 }}>Há 2 dias</Text>
        </View>

        <TouchableOpacity
          style={styles.dangerButton}
          onPress={handleLogoutDevices}
        >
          <Text style={styles.dangerText}>
            Sair da conta
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
    borderRadius: 8,
    backgroundColor: '#fff'
  },
  dangerText: {
    color: '#ff3e3e',
    fontWeight: 'bold'
  }
});