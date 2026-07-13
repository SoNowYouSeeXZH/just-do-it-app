import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Share,
  Platform,
} from 'react-native';
import { useGameStore } from '../store/gameStore';
import { guofeng } from '../theme/guofeng';

const EMOJI_MAP: Record<string, string> = {
  correct: '🟩',
  present: '🟨',
  absent: '⬛',
  empty: '⬜',
};

export default function ResultModal() {
  const { answer, guesses, currentRow, status, streak, totalPlayed, totalWon, resetForNewDay } = useGameStore();
  const slideAnim = useRef(new Animated.Value(300)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (status !== 'playing') {
      Animated.parallel([
        Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, bounciness: 8 }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start();
    }
  }, [status, slideAnim, opacityAnim]);

  if (status === 'playing') return null;

  const winRate = totalPlayed > 0 ? Math.round((totalWon / totalPlayed) * 100) : 0;

  const buildShareText = () => {
    const today = new Date();
    const dateStr = `${today.getMonth() + 1}月${today.getDate()}日`;
    const rows = guesses
      .slice(0, currentRow)
      .map((row) => row.statuses.map((s) => EMOJI_MAP[s]).join(''))
      .join('\n');
    const tag = status === 'won' ? `${currentRow}/6` : 'X/6';
    return `成语猜猜 ${dateStr} ${tag}\n\n${rows}\n\n答案：${answer}`;
  };

  const handleShare = async () => {
    try {
      await Share.share({ message: buildShareText() });
    } catch (_) {}
  };

  return (
    <Animated.View
      style={[styles.overlay, { opacity: opacityAnim }]}
      pointerEvents="box-none"
    >
      <Animated.View style={[styles.card, { transform: [{ translateY: slideAnim }] }]}>
        <View style={styles.handle} />
        <Text style={styles.eyebrow}>今日成绩笺</Text>
        <Text style={styles.title}>{status === 'won' ? '一语中的' : '差一点入局'}</Text>

        <View style={styles.answerPanel}>
          <Text style={styles.answerLabel}>谜底成语</Text>
          <Text style={styles.answerText}>{answer}</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statBig}>{totalPlayed}</Text>
            <Text style={styles.statSub}>已玩</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statBig}>{winRate}%</Text>
            <Text style={styles.statSub}>胜率</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statBig}>{streak}</Text>
            <Text style={styles.statSub}>连胜</Text>
          </View>
        </View>

        <View style={styles.emojiPanel}>
          {guesses.slice(0, currentRow).map((row, i) => (
            <Text key={i} style={styles.emojiRow}>
              {row.statuses.map((s) => EMOJI_MAP[s]).join('')}
            </Text>
          ))}
        </View>

        <View style={styles.btnRow}>
          <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
            <Text style={styles.shareBtnText}>分享战绩</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.nextBtn} onPress={resetForNewDay}>
            <Text style={styles.nextBtnText}>再来一局</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(5, 4, 3, 0.72)',
    zIndex: 100,
  },
  card: {
    backgroundColor: guofeng.colors.surface,
    borderTopLeftRadius: guofeng.radius.xl,
    borderTopRightRadius: guofeng.radius.xl,
    padding: guofeng.spacing.xl,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    borderTopWidth: 1,
    borderColor: guofeng.colors.border,
  },
  handle: {
    alignSelf: 'center',
    width: 42,
    height: 4,
    borderRadius: 2,
    backgroundColor: guofeng.colors.border,
    marginBottom: 18,
  },
  eyebrow: {
    color: guofeng.colors.gold,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 4,
    textAlign: 'center',
    marginBottom: 6,
  },
  title: {
    color: guofeng.colors.text,
    fontSize: 25,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 18,
    letterSpacing: 2,
  },
  answerPanel: {
    alignItems: 'center',
    borderRadius: guofeng.radius.lg,
    borderWidth: 1,
    borderColor: guofeng.colors.borderSoft,
    backgroundColor: guofeng.colors.ink,
    paddingVertical: 16,
    marginBottom: 16,
  },
  answerLabel: {
    color: guofeng.colors.textMuted,
    fontSize: 12,
    marginBottom: 5,
  },
  answerText: {
    color: guofeng.colors.goldBright,
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: 5,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: guofeng.colors.borderSoft,
  },
  statBox: {
    alignItems: 'center',
  },
  statBig: {
    color: guofeng.colors.text,
    fontSize: 28,
    fontWeight: '900',
  },
  statSub: {
    color: guofeng.colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  emojiPanel: {
    alignItems: 'center',
    marginBottom: 18,
    gap: 3,
  },
  emojiRow: {
    fontSize: 21,
    letterSpacing: 2,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 12,
  },
  shareBtn: {
    flex: 1,
    backgroundColor: guofeng.colors.surfaceSoft,
    borderRadius: guofeng.radius.md,
    borderWidth: 1,
    borderColor: guofeng.colors.border,
    paddingVertical: 14,
    alignItems: 'center',
  },
  shareBtnText: {
    color: guofeng.colors.text,
    fontSize: 15,
    fontWeight: '900',
  },
  nextBtn: {
    flex: 1,
    backgroundColor: guofeng.colors.gold,
    borderRadius: guofeng.radius.md,
    paddingVertical: 14,
    alignItems: 'center',
  },
  nextBtnText: {
    color: guofeng.colors.ink,
    fontSize: 15,
    fontWeight: '900',
  },
});
