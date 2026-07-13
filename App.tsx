import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import GameScreen from '@/screens/GameScreen';

export default function App() {
  return (
    <SafeAreaProvider>
      <GameScreen />
    </SafeAreaProvider>
  );
}
