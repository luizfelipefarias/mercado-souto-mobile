import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSequence, 
  withSpring, 
  withTiming 
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

// 1. Criamos uma interface para tipar as props
interface CartIconProps {
  itemCount: number;
}

// 2. Aplicamos a interface no componente
export default function CartIcon({ itemCount }: CartIconProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  useEffect(() => {
    if (itemCount > 0) {
      scale.value = withSequence(
        withTiming(1.5, { duration: 100 }),
        withSpring(1, { damping: 10 })
      );
    }
  // 3. Adicionamos 'scale' nas dependências para resolver o aviso do ESLint
  }, [itemCount, scale]); 

  return (
    <View style={styles.container}>
      <Animated.View style={[animatedStyle, styles.iconContainer]}>
        <Ionicons name="cart-outline" size={28} color="black" />
        
        {itemCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {itemCount > 99 ? '99+' : itemCount}
            </Text>
          </View>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 5,
  },
  iconContainer: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    right: -6,
    top: -4,
    backgroundColor: '#ff3e3e', // Vermelho mais vivo (estilo notificação)
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 1, // Opcional: borda branca para separar do ícone
    borderColor: 'white'
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
});