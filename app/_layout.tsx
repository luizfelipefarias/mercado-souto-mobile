import { Stack } from 'expo-router';
import { StatusBar } from 'react-native';
import "../global.css"; 

export default function RootLayout() {
  return (
    <>
      <StatusBar barStyle="dark-content" />
      <Stack
        screenOptions={{
          headerShown: false, // Esconde o cabeçalho em todas as telas
        }}
      >
        {/* A splash screen (index.tsx) */}
        <Stack.Screen name="index" /> 

        <Stack.Screen name="(tabs)" /> 
      </Stack>
    </>
  );
}