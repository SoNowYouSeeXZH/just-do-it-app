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

const EMOJI_MAP: Record<string, string> = {
  correct: '🟩',
  present: '🟨',
  absent:  '⬛',
  empty:   '⬜',
};

export default function ResultModal() {
  const { answer, guesses, currentRow, status, streak, totalPlayed, totalWon, resetForNewDay } = useGameStore();
  const slideAnim = useRef(new Animated.Value(300)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (status !== 'playing') {
      Animated.parallel([
        Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, bounciness: 10 }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start();
    }
  }, [status]);

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
        {/* 标题 */}
        <Text style={styles.title}>
          {status === 'won' ? '猜对了！' : '很遗憾'}
        </Text>

        {/* 答案 */}
        <View style={styles.answerRow}>
          <Text style={styles.answerLabel}>今日成语</Text>
          <Text style={styles.answerText}>{answer}</Text>
        </View>

        {/* 统计数据 */}
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

        {/* 本局路径 */}
        <View style={styles.emojiGrid}>
          {guesses.slice(0, currentRow).map((row, i) => (
            <Text key={i} style={styles.emojiRow}>
              {row.statuses.map((s) => EMOJI_MAP[s]).join('')}
            </Text>
          ))}
        </View>

        {/* 操作按钮 */}
        <View style={styles.btnRow}>
          <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
            <Text style={styles.shareBtnText}>分享结果</Text>
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
    backgroundColor: 'rgba(0,0,0,0.6)',
    zIndex: 100,
  },
  card: {
    backgroundColor: '#1a1a1b',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    borderTopWidth: 1,
    borderColor: '#3a3a3c',
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 16,
  },
  answerRow: {
    alignItems: 'center',
    marginBottom: 20,
  },
  answerLabel: {
    color: '#818384',
    fontSize: 13,
    marginBottom: 4,
  },
  answerText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#3a3a3c',
  },
  statBox: {
    alignItems: 'center',
  },
  statBig: {
    color: '#fff',
    fontSize: 30,
    fontWeight: '800',
  },
  statSub: {
    color: '#818384',
    fontSize: 13,
    marginTop: 2,
  },
  emojiGrid: {
    alignItems: 'center',
    marginBottom: 20,
    gap: 4,
  },
  emojiRow: {
    fontSize: 22,
    letterSpacing: 2,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 12,
  },
  shareBtn: {
    flex: 1,
    backgroundColor: '#818384',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  shareBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  nextBtn: {
    flex: 1,
    backgroundColor: '#538d4e',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  nextBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});
