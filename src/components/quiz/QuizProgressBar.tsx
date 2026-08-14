// QuizProgressBar.tsx —— 答题顶部进度条
//
// 多邻国式：一条圆角进度条，随答题推进而变长。颜色用当前职业主题色。

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { tokens } from '@/theme/tokens';

type Props = {
  current: number; // 已完成题数（0 ~ total）
  total: number; // 总题数
  color: string; // 进度条填充色（职业主题色）
};

export default function QuizProgressBar({ current, total, color }: Props) {
  // 计算完成百分比，避免除以 0
  const ratio = total > 0 ? Math.min(current / total, 1) : 0;

  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width: `${ratio * 100}%`, backgroundColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flex: 1,
    height: 14,
    borderRadius: tokens.radius.pill,
    backgroundColor: tokens.colors.surfaceSoft,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: tokens.radius.pill,
  },
});
