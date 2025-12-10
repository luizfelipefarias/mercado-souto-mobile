import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Platform,
  Alert,
  KeyboardAvoidingView,
  StatusBar
} from 'react-native';
import { Text, Button, ActivityIndicator } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../../../../src/constants/theme';
import { useAuth } from '../../../../src/context/AuthContext';
import api from '../../../../src/services/api';
import Toast from 'react-native-toast-message';

export default function Review() {
  const router = useRouter();
  const { id: productId } = useLocalSearchParams();
  const { user } = useAuth();

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!productId) {
      Toast.show({ type: 'error', text1: 'Erro', text2: 'Produto não identificado.' });
      return;
    }

    if (!rating) {
      Toast.show({ type: 'info', text1: 'Atenção', text2: 'Selecione uma nota de 1 a 5 estrelas.' });
      return;
    }

    setLoading(true);

    try {
      const userId = user?.id;

      if (!userId) {
         Toast.show({ type: 'error', text1: 'Erro', text2: 'Faça login para avaliar.' });
         return;
      }

      const payload = {
        productId: productId,
        clientId: userId,
        rating: rating,
        comment: comment.trim(),
        date: new Date().toISOString()
      };

      
      console.log("AVALIAÇÃO ENVIADA:", payload);
      await new Promise(resolve => setTimeout(resolve, 800));

      Toast.show({ 
        type: 'success', 
        text1: 'Obrigado!', 
        text2: 'Sua avaliação ajuda outros compradores.',
        onHide: () => router.back()
      });
      
    } catch (error) {
      console.error(error);
      Toast.show({ type: 'error', text1: 'Erro', text2: 'Não foi possível enviar a avaliação.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.secondary} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={{padding: 5}}>
          <MaterialCommunityIcons name="close" size={24} color="#333" />
        </TouchableOpacity>

        <Text style={styles.title}>Avaliar Produto</Text>

        <View style={{ width: 34 }} />
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
        style={{ flex: 1 }}
      >
        <View style={styles.content}>
          <Text style={styles.question}>O que você achou deste produto?</Text>

          <View style={styles.stars}>
            {[1, 2, 3, 4, 5].map(star => (
              <TouchableOpacity 
                key={star} 
                onPress={() => setRating(star)}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons
                  name={star <= rating ? 'star' : 'star-outline'}
                  size={42}
                  color={star <= rating ? theme.colors.primary : '#ccc'}
                  style={{ marginHorizontal: 8 }}
                />
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Escreva sua opinião (opcional)</Text>
          <TextInput
            style={styles.input}
            placeholder="Conte mais sobre sua experiência..."
            placeholderTextColor="#999"
            multiline
            numberOfLines={4}
            value={comment}
            onChangeText={setComment}
            textAlignVertical="top"
          />

          <Button
            mode="contained"
            onPress={handleSubmit}
            style={styles.btn}
            contentStyle={{ height: 50 }}
            labelStyle={{ fontWeight: 'bold', fontSize: 16 }}
            disabled={loading || !rating}
          >
            {loading ? <ActivityIndicator color="#fff" /> : 'Enviar Avaliação'}
          </Button>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? 30 : 0
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    alignItems: 'center',
    backgroundColor: theme.colors.secondary
  },

  title: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333'
  },

  content: {
    padding: 20,
    alignItems: 'center',
    flex: 1,
  },

  question: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 30,
    marginTop: 20,
    textAlign: 'center',
    color: '#333'
  },

  stars: {
    flexDirection: 'row',
    marginBottom: 40
  },

  label: {
    alignSelf: 'flex-start',
    marginBottom: 10,
    color: '#666',
    fontWeight: '500'
  },

  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    height: 120,
    backgroundColor: '#f9f9f9'
  },

  btn: {
    marginTop: 30,
    width: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 6
  }
});