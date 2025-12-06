import React, { useState, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, StatusBar, SafeAreaView, Platform } from 'react-native';
import { Text, List, Divider } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { theme } from '../../constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type FAQItem = {
  q: string;
  a: string;
};

type FAQCategory = {
  id: number;
  title: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  questions: FAQItem[];
};

const FAQ_DATA: FAQCategory[] = [
  {
    id: 1,
    title: 'Compras',
    icon: 'shopping-outline',
    questions: [
      { q: 'Como rastrear meu pedido?', a: 'Vá em "Minhas Compras", selecione o produto e veja a linha do tempo de envio.' },
      { q: 'Como cancelar uma compra?', a: 'Se o envio estiver "Pendente", você pode cancelar direto no botão "Cancelar compra" nos detalhes do pedido.' },
      { q: 'Tenho frete grátis?', a: 'Em produtos selecionados acima de R$ 79,00 o frete é por nossa conta.' }
    ]
  },
  {
    id: 2,
    title: 'Vendas',
    icon: 'tag-outline',
    questions: [
      { q: 'Como vender um produto?', a: 'Acesse o menu "Vender", tire fotos do produto, descreva-o e defina o preço.' },
      { q: 'Quando recebo o dinheiro?', a: 'O dinheiro fica disponível no Mercado Pago 48h após o comprador confirmar o recebimento.' }
    ]
  },
  {
    id: 3,
    title: 'Configuração da conta',
    icon: 'account-cog-outline',
    questions: [
      { q: 'Como mudar minha senha?', a: 'Vá em Perfil > Segurança > Alterar senha.' },
      { q: 'Posso mudar meu e-mail?', a: 'Sim, em Perfil > Meus dados você pode atualizar seu e-mail e telefone.' }
    ]
  },
  {
    id: 4,
    title: 'Segurança',
    icon: 'shield-check-outline',
    questions: [
      { q: 'O que é verificação em duas etapas?', a: 'É uma camada extra de segurança que pede um código ao logar em dispositivos novos.' },
      { q: 'Não reconheço uma compra', a: 'Entre em contato imediatamente pelo chat de suporte ou cancele seu cartão cadastrado.' }
    ]
  }
];

export default function Help() {
  const router = useRouter();
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const handlePress = useCallback((id: number) => {
    setExpandedId(prev => (prev === id ? null : id));
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.secondary} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Ajuda</Text>

        <View style={styles.rightSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Com o que podemos ajudar?</Text>

        <List.Section>
          {FAQ_DATA.map(category => (
            <List.Accordion
              key={category.id}
              title={category.title}
              left={props => (
                <List.Icon {...props} icon={category.icon} color={theme.colors.primary} />
              )}
              expanded={expandedId === category.id}
              onPress={() => handlePress(category.id)}
              style={styles.accordion}
              titleStyle={styles.accordionTitle}
              theme={{ colors: { background: '#fff' } }}
            >
              {category.questions.map((item, index) => (
                <View key={index} style={styles.answerContainer}>
                  <Text style={styles.questionText}>• {item.q}</Text>
                  <Text style={styles.answerText}>{item.a}</Text>
                  {index < category.questions.length - 1 && (
                    <Divider style={styles.divider} />
                  )}
                </View>
              ))}
            </List.Accordion>
          ))}
        </List.Section>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: Platform.OS === 'android' ? 30 : 0,
  },

  header: {
    padding: 15,
    backgroundColor: theme.colors.secondary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  backButton: {
    padding: 5,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
  },

  rightSpacer: {
    width: 34,
  },

  content: {
    paddingBottom: 20,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 20,
    marginBottom: 10,
    marginTop: 20,
    color: '#333',
  },

  accordion: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },

  accordionTitle: {
    fontWeight: 'bold',
    color: '#333',
  },

  answerContainer: {
    padding: 15,
    backgroundColor: '#fafafa',
    paddingLeft: 60,
  },

  questionText: {
    fontWeight: 'bold',
    color: '#444',
    marginBottom: 4,
  },

  answerText: {
    color: '#666',
    lineHeight: 20,
  },

  divider: {
    marginVertical: 10,
  },

  bottomSpacing: {
    height: 40,
  },
});
