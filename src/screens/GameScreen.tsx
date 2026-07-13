import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  ScrollView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGameStore } from '../store/gameStore';
import { GuessGrid } from '../components/GuessGrid';
import { ChineseKeyboard } from '../components/ChineseKeyboard';
import ResultModal from '../components/ResultModal';

export default function GameScreen() {
  const {
    answer,
    guesses,
    currentInput,
    currentRow,
    status,
    streak,
    totalPlayed,
    totalWon,
    inputChar,
    deleteChar,
    submitGuess,
  } = useGameStore();

  const shakeAnim = useRef(new Animated.Value(0)).current;
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 1800);
  }, []);

  const shakeRow = useCallback(() => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -6, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 40, useNativeDriver: true }),
    ]).start();
  }, []);

  // 揭示当前行动画
  useEffect(() => {
    if (currentRow > 0) {
      const prevRow = guesses[currentRow - 1];
      if (prevRow && !prevRow.isRevealed) {
        const store = useGameStore.getState();
        const updatedGuesses = [...store.guesses];
        updatedGuesses[currentRow - 1] = { ...updatedGuesses[currentRow - 1], isRevealed: true };
        useGameStore.setState({ guesses: updatedGuesses });

        // 胜利或失败提示
        setTimeout(() => {
          if (status === 'won') {
            const msgs = ['完美！', '太棒了！', '成语达人！', '学富五车！', '博学多才！'];
            showToast(msgs[Math.min(currentRow - 1, msgs.length - 1)]);
          } else if (status === 'lost') {
            showToast(`正确答案：${answer}`);
          }
        }, 4 * 150 + 350);
      }
    }
  }, [currentRow, status]);

  const handleSubmit = useCallback(() => {
    const result = submitGuess();
    if (result === 'invalid_format') {
      showToast('请输入4个汉字');
      shakeRow();
    } else if (result === 'not_in_list') {
      showToast('不在词库中，换一个');
      shakeRow();
    } else if (result === 'already_won') {
      showToast('已经猜对啦！');
    }
  }, [submitGuess, shakeRow, showToast]);

  const winRate = totalPlayed > 0 ? Math.round((totalWon / totalPlayed) * 100) : 0;

  return (
    <SafeAreaView style={styles.safe}>
      {/* 顶部标题栏 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>成语猜猜</Text>
        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Text style={styles.statNum}>{streak}</Text>
            <Text style={styles.statLabel}>连胜</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNum}>{totalPlayed}</Text>
            <Text style={styles.statLabel}>已玩</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNum}>{winRate}%</Text>
            <Text style={styles.statLabel}>胜率</Text>
          </View>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Toast 提示 */}
      {toast ? (
        <View style={styles.toast} pointerEvents="none">
          <Text style={styles.toastText}>{toast}</Text>
        </View>
      ) : null}

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* 游戏说明 */}
        <Text style={styles.hint}>猜一个四字成语，共 6 次机会</Text>
        <View style={styles.legend}>
          <View style={[styles.legendDot, { backgroundColor: '#538d4e' }]} />
          <Text style={styles.legendText}>位置正确</Text>
          <View style={[styles.legendDot, { backgroundColor: '#b59f3b' }]} />
          <Text style={styles.legendText}>字在其中</Text>
          <View style={[styles.legendDot, { backgroundColor: '#3a3a3c' }]} />
          <Text style={styles.legendText}>不在其中</Text>
        </View>

        {/* 猜测格 */}
        <Animated.View style={{ transform: [{ translateX: shakeAnim }] }}>
          <GuessGrid guesses={guesses} currentInput={currentInput} currentRow={currentRow} />
        </Animated.View>
      </ScrollView>

      {/* 输入区 */}
      {status === 'playing' ? (
        <ChineseKeyboard
          onInput={inputChar}
          onDelete={deleteChar}
          onSubmit={handleSubmit}
          currentLength={currentInput.length}
        />
      ) : null}

      {/* 结果弹层 */}
      <ResultModal />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#121213',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 2,
  },
  stats: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statNum: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  statLabel: {
    fontSize: 11,
    color: '#818384',
    marginTop: 1,
  },
  divider: {
    height: 1,
    backgroundColor: '#3a3a3c',
  },
  toast: {
    position: 'absolute',
    top: 80,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 999,
  },
  toastText: {
    backgroundColor: '#fff',
    color: '#000',
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 6,
    fontSize: 15,
    fontWeight: '700',
  },
  content: {
    alignItems: 'center',
    paddingTop: 8,
  },
  hint: {
    color: '#818384',
    fontSize: 13,
    marginBottom: 6,
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 2,
  },
  legendText: {
    color: '#818384',
    fontSize: 12,
    marginRight: 6,
  },
  resetBtn: {
    backgroundColor: '#538d4e',
    borderRadius: 10,
    paddingHorizontal: 32,
    paddingVertical: 12,
  },
  resetText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
