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
import { guofeng } from '../theme/guofeng';

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
    setCurrentInput,
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
  }, [shakeAnim]);

  useEffect(() => {
    if (currentRow > 0) {
      const prevRow = guesses[currentRow - 1];
      if (prevRow && !prevRow.isRevealed) {
        const store = useGameStore.getState();
        const updatedGuesses = [...store.guesses];
        updatedGuesses[currentRow - 1] = { ...updatedGuesses[currentRow - 1], isRevealed: true };
        useGameStore.setState({ guesses: updatedGuesses });

        setTimeout(() => {
          if (status === 'won') {
            const msgs = ['一语中的', '妙笔生花', '成语达人', '学富五车', '博学多才'];
            showToast(msgs[Math.min(currentRow - 1, msgs.length - 1)]);
          } else if (status === 'lost') {
            showToast(`正确答案：${answer}`);
          }
        }, 4 * 150 + 350);
      }
    }
  }, [currentRow, status, answer, guesses, showToast]);

  const handleSubmit = useCallback(() => {
    const result = submitGuess();
    if (result === 'invalid_format') {
      showToast('请输入四个汉字');
      shakeRow();
    } else if (result === 'not_in_list') {
      showToast('词库未收录，换一个');
      shakeRow();
    } else if (result === 'already_won') {
      showToast('已经猜对啦');
    }
  }, [submitGuess, shakeRow, showToast]);

  const winRate = totalPlayed > 0 ? Math.round((totalWon / totalPlayed) * 100) : 0;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.backdrop} />
      <View style={styles.glow} />

      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>每日成语局</Text>
          <Text style={styles.headerTitle}>成语猜猜</Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>第 {currentRow + 1}/6 试</Text>
        </View>
      </View>

      <View style={styles.statsPanel}>
        <View style={styles.statItem}>
          <Text style={styles.statNum}>{streak}</Text>
          <Text style={styles.statLabel}>连胜</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNum}>{totalPlayed}</Text>
          <Text style={styles.statLabel}>已玩</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNum}>{winRate}%</Text>
          <Text style={styles.statLabel}>胜率</Text>
        </View>
      </View>

      {toast ? (
        <View style={styles.toast} pointerEvents="none">
          <Text style={styles.toastText}>{toast}</Text>
        </View>
      ) : null}

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.ruleCard}>
          <Text style={styles.ruleTitle}>猜一个四字成语</Text>
          <Text style={styles.ruleText}>绿色为位置正确，金色为字在其中，墨色为答案中没有这个字。</Text>
          <View style={styles.legend}>
            <View style={[styles.legendPill, { backgroundColor: guofeng.colors.correct }]}>
              <Text style={styles.legendText}>正位</Text>
            </View>
            <View style={[styles.legendPill, { backgroundColor: guofeng.colors.present }]}>
              <Text style={styles.legendText}>含字</Text>
            </View>
            <View style={[styles.legendPill, { backgroundColor: guofeng.colors.absent }]}>
              <Text style={styles.legendText}>无字</Text>
            </View>
          </View>
        </View>

        <Animated.View style={[styles.boardWrap, { transform: [{ translateX: shakeAnim }] }]}>
          <GuessGrid guesses={guesses} currentInput={currentInput} currentRow={currentRow} />
        </Animated.View>
      </ScrollView>

      {status === 'playing' ? (
        <ChineseKeyboard
          value={currentInput}
          onChange={setCurrentInput}
          onSubmit={handleSubmit}
        />
      ) : null}

      <ResultModal />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: guofeng.colors.background,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: guofeng.colors.background,
  },
  glow: {
    position: 'absolute',
    top: -120,
    left: -60,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(215, 166, 87, 0.12)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: guofeng.spacing.lg,
    paddingTop: Platform.OS === 'ios' ? guofeng.spacing.sm : guofeng.spacing.md,
    paddingBottom: guofeng.spacing.sm,
  },
  eyebrow: {
    color: guofeng.colors.gold,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 3,
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: guofeng.colors.text,
    letterSpacing: 4,
  },
  badge: {
    borderWidth: 1,
    borderColor: guofeng.colors.border,
    backgroundColor: 'rgba(36, 26, 16, 0.82)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  badgeText: {
    color: guofeng.colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
  statsPanel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: guofeng.spacing.lg,
    marginTop: guofeng.spacing.sm,
    marginBottom: guofeng.spacing.sm,
    paddingVertical: 12,
    borderRadius: guofeng.radius.lg,
    borderWidth: 1,
    borderColor: guofeng.colors.borderSoft,
    backgroundColor: 'rgba(27, 20, 13, 0.88)',
    shadowColor: guofeng.shadow.color,
    shadowOpacity: guofeng.shadow.opacity,
    shadowRadius: guofeng.shadow.radius,
    shadowOffset: guofeng.shadow.offset,
    elevation: guofeng.shadow.elevation,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: guofeng.colors.borderSoft,
  },
  statNum: {
    fontSize: 21,
    fontWeight: '900',
    color: guofeng.colors.text,
  },
  statLabel: {
    fontSize: 11,
    color: guofeng.colors.textMuted,
    marginTop: 2,
  },
  toast: {
    position: 'absolute',
    top: 92,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 999,
  },
  toastText: {
    backgroundColor: guofeng.colors.text,
    color: guofeng.colors.ink,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: guofeng.radius.sm,
    fontSize: 15,
    fontWeight: '800',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: guofeng.spacing.lg,
    paddingTop: guofeng.spacing.sm,
    paddingBottom: guofeng.spacing.md,
  },
  ruleCard: {
    width: '100%',
    borderRadius: guofeng.radius.lg,
    borderWidth: 1,
    borderColor: guofeng.colors.borderSoft,
    backgroundColor: 'rgba(27, 20, 13, 0.68)',
    padding: guofeng.spacing.md,
    marginBottom: guofeng.spacing.md,
  },
  ruleTitle: {
    color: guofeng.colors.text,
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 5,
  },
  ruleText: {
    color: guofeng.colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
  },
  legend: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  legendPill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  legendText: {
    color: '#fffaf0',
    fontSize: 11,
    fontWeight: '800',
  },
  boardWrap: {
    width: '100%',
    alignItems: 'center',
  },
});
