import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Tile } from './Tile';
import { GuessRow } from '../store/types';

interface GuessGridProps {
  guesses: GuessRow[];
  currentInput: string;
  currentRow: number;
}

export const GuessGrid = React.memo(({ guesses, currentInput, currentRow }: GuessGridProps) => {
  return (
    <View style={styles.grid}>
      {guesses.map((row, rowIndex) => {
        const isCurrentRow = rowIndex === currentRow;
        const chars = isCurrentRow
          ? [...currentInput.split(''), ...Array(4 - currentInput.length).fill('')]
          : row.chars;

        return (
          <View key={rowIndex} style={styles.row}>
            {chars.map((char, colIndex) => (
              <Tile
                key={colIndex}
                char={char}
                status={isCurrentRow ? 'empty' : row.statuses[colIndex]}
                isRevealed={row.isRevealed}
                delay={colIndex * 150}
              />
            ))}
          </View>
        );
      })}
    </View>
  );
});

const styles = StyleSheet.create({
  grid: {
    marginVertical: 16,
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
  },
});
