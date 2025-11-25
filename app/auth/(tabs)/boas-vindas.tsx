import React from 'react';
import { 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  StyleSheet, 
  Dimensions, 
  Platform, 
  ViewStyle  
} from 'react-native';
import { Link } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


const { width: SCREEN_WIDTH } = Dimensions.get('window');

const COLORS = {
  primary: '#4F46E5', 
  text: '#1F2937',    
  subtext: '#6B7280', 
  background: '#FFFFFF',
  border: '#E5E7EB',
};

const SPACING = 24;
const PADDING_HORIZONTAL = SPACING;

const containerHeight = (Platform.OS === 'web' 
    ? { minHeight: '100vh' } 
    : { flex: 1 }) as ViewStyle; 

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();

  return (

    <View style={[styles.container, containerHeight]}>
      
      <View style={[styles.contentWrapper, { paddingTop: insets.top }]}>
        <View style={styles.content}>
          <View style={styles.innerContent}>
            <Image
              source={require('../../../assets/images/van.png')}
              style={styles.image}
              resizeMode="contain"
            />
            <Text style={styles.title}>
              Frete grátis e
              entrega em menos de 24 horas
            </Text>
            <Text style={styles.subtitle}>
              Aproveite a experiência
              de comprar com rapidez e segurança!
            </Text>
          </View>
        </View>
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom || SPACING }]}>
        <Link href="/auth/login" asChild>
          <TouchableOpacity style={styles.buttonPrimary}>
            <Text style={styles.buttonTextPrimary}>Iniciar sessão</Text>
          </TouchableOpacity>
        </Link>

        <Link href="/auth/cadastro" asChild>
          <TouchableOpacity style={styles.buttonSecondary}>
            <Text style={styles.buttonTextSecondary}>Criar conta</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,
  },
  
  contentWrapper: {
      flex: 1, 
      paddingHorizontal: PADDING_HORIZONTAL,
  },

  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  innerContent: {
    alignItems: 'center',
    gap: 16, 
  },

  image: {
  width: SCREEN_WIDTH * 1.0, 
  height: 500, 
  marginVertical: SPACING * 0.5, 
},

  title: {
    fontSize: 26, 
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    lineHeight: 30, 
    paddingHorizontal: 3,
  },

  subtitle: {
    fontSize: 14,
    color: COLORS.subtext,
    textAlign: 'center',
  },

  footer: {
    paddingHorizontal: PADDING_HORIZONTAL,
    paddingTop: SPACING,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderColor: COLORS.border,
    gap: 12, 
  },

  buttonPrimary: {
    width: '100%',
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },

  buttonTextPrimary: {
    color: COLORS.background,
    fontWeight: '700',
    fontSize: 18,
  },

  buttonSecondary: {
    width: '100%',
    backgroundColor: 'transparent',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },

  buttonTextSecondary: {
    color: COLORS.primary, 
    fontWeight: '700',
    fontSize: 18,
  },
});