import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LetterStatus } from '../store/types';

interface TileProps {
  char: string;
  status: LetterStatus;
  isRevealed: boolean;
  delay: number;
}

const STATUS_COLORS: Record<LetterStatus, string> = {
  correct: '#538d4e',
  present: '#b59f3b',
  absent:  '#3a3a3c',
  empty:   '#121213',
};

const STATUS_BORDER: Record<LetterStatus, string> = {
  correct: '#538d4e',
  present: '#b59f3b',
  absent:  '#3a3a3c',
  empty:   '#3a3a3c',
};

export const Tile = React.memo(({ char, status, isRevealed, delay }: TileProps) => {
  const flipAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isRevealed && char) {
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(flipAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isRevealed]);

  // 输入时弹跳效果
  useEffect(() => {
    if (char && !isRevealed) {
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 1.12, duration: 60, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1, duration: 60, useNativeDriver: true }),
      ]).start();
    }
  }, [char]);

  const rotateY = flipAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['0deg', '90deg', '0deg'],
  });

  const bgColor = flipAnim.interpolate({
    inputRange: [0, 0.5, 0.501, 1],
    outputRange: ['#121213', '#121213', STATUS_COLORS[status], STATUS_COLORS[status]],
  });

  const borderColor = isRevealed ? STATUS_BORDER[status] : char ? '#565758' : '#3a3a3c';

  return (
    <Animated.View
      style={[
        styles.tile,
        {
          borderColor,
          backgroundColor: bgColor as any,
          transform: [{ rotateY }, { scale: scaleAnim }],
        },
      ]}
    >
      <Text style={styles.char}>{char}</Text>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  tile: {
    width: 62,
    height: 62,
    borderWidth: 2,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 3,
  },
  char: {
    fontSize: 26,
    fontWeight: '700',
    color: '#fff',
  },
});
