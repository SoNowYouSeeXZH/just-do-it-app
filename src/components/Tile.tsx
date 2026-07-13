import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LetterStatus } from '../store/types';
import { guofeng } from '../theme/guofeng';

interface TileProps {
  char: string;
  status: LetterStatus;
  isRevealed: boolean;
  delay: number;
}

const STATUS_COLORS: Record<LetterStatus, string> = {
  correct: guofeng.colors.correct,
  present: guofeng.colors.present,
  absent: guofeng.colors.absent,
  empty: guofeng.colors.surfaceElevated,
};

const STATUS_BORDER: Record<LetterStatus, string> = {
  correct: guofeng.colors.correctBorder,
  present: guofeng.colors.presentBorder,
  absent: guofeng.colors.absentBorder,
  empty: guofeng.colors.border,
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
  }, [isRevealed, char, delay, flipAnim]);

  useEffect(() => {
    if (char && !isRevealed) {
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 1.08, duration: 70, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1, duration: 80, useNativeDriver: true }),
      ]).start();
    }
  }, [char, isRevealed, scaleAnim]);

  const rotateY = flipAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['0deg', '90deg', '0deg'],
  });

  const bgColor = flipAnim.interpolate({
    inputRange: [0, 0.5, 0.501, 1],
    outputRange: [
      guofeng.colors.surfaceElevated,
      guofeng.colors.surfaceElevated,
      STATUS_COLORS[status],
      STATUS_COLORS[status],
    ],
  });

  const borderColor = isRevealed ? STATUS_BORDER[status] : char ? guofeng.colors.goldMuted : guofeng.colors.border;

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
      <View style={styles.innerLine} pointerEvents="none" />
      <Text style={styles.char}>{char}</Text>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  tile: {
    width: 58,
    height: 58,
    borderWidth: 1.5,
    borderRadius: guofeng.radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 3.5,
    overflow: 'hidden',
  },
  innerLine: {
    position: 'absolute',
    left: 5,
    right: 5,
    top: 5,
    bottom: 5,
    borderWidth: 1,
    borderColor: 'rgba(247, 234, 213, 0.08)',
    borderRadius: guofeng.radius.sm,
  },
  char: {
    fontSize: 25,
    fontWeight: '900',
    color: guofeng.colors.text,
  },
});
