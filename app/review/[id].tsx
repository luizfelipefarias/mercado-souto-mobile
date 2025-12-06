import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Platform,
  Alert
} from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../../constants/theme';

export default function Review() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const handleSubmit = () => {
    if (!id) {
      Alert.alert('Erro', 'Produto não identificado.');
      return;
    }

    if (!rating) {
      Alert.alert('Atenção', 'Selecione uma nota.');
      return;
    }

    console.log(`Avaliação enviada para o produto ${id}`, {
      rating,
      comment
    });

    Alert.alert('Obrigado!', 'Sua avaliação foi enviada.');
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons name="close" size={24} />
        </TouchableOpacity>

        <Text style={styles.title}>Avaliar Produto</Text>

        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.question}>O que você achou?</Text>

        <View style={styles.stars}>
          {[1, 2, 3, 4, 5].map(star => (
            <TouchableOpacity key={star} onPress={() => setRating(star)}>
              <MaterialCommunityIcons
                name={star <= rating ? 'star' : 'star-outline'}
                size={40}
                color={theme.colors.primary}
                style={{ marginHorizontal: 5 }}
              />
            </TouchableOpacity>
          ))}
        </View>

        <TextInput
          style={styles.input}
          placeholder="Escreva sua opinião..."
          multiline
          numberOfLines={4}
          value={comment}
          onChangeText={setComment}
        />

        <Button
          mode="contained"
          onPress={handleSubmit}
          style={styles.btn}
          disabled={!rating}
        >
          Enviar Avaliação
        </Button>
      </View>
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
    fontWeight: '500'
  },

  content: {
    padding: 20,
    alignItems: 'center'
  },

  question: {
    fontSize: 18,
    marginBottom: 20
  },

  stars: {
    flexDirection: 'row',
    marginBottom: 30
  },

  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    textAlignVertical: 'top',
    height: 100
  },

  btn: {
    marginTop: 20,
    width: '100%',
    backgroundColor: '#3483fa',
    borderRadius: 6
  }
});
