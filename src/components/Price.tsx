import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

type PriceProps = {
  value: number | string | null | undefined;
};

export default function Price({ value }: PriceProps) {
  const { priceInt, priceCents } = useMemo(() => {
    let priceValue = 0;

    if (typeof value === 'number') {
      priceValue = value;
    } else if (typeof value === 'string') {
      priceValue = parseFloat(value.replace(',', '.'));
    }

    if (isNaN(priceValue)) priceValue = 0;

    const formatted = priceValue.toFixed(2);
    const [intPart, centsPart] = formatted.split('.');

    return {
      priceInt: intPart,
      priceCents: centsPart,
    };
  }, [value]);

  return (
    <View style={styles.container}>
      <Text style={styles.currency}>R$</Text>
      <Text style={styles.int}>{priceInt}</Text>
      <Text style={styles.cents}>{priceCents}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 4,
  },
  currency: {
    fontSize: 12,
    marginTop: 4,
    marginRight: 2,
    color: '#333',
  },
  int: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  cents: {
    fontSize: 12,
    marginTop: 2,
    color: '#333',
  },
});