// Hearts.tsx —— 生命值显示（多邻国的红心）
//
// 用实心/空心红心表示剩余生命。答错扣一颗，扣光则本节失败。

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Heart } from 'lucide-react-native';
import { tokens } from '@/theme/tokens';

type Props = {
  hearts: number; // 剩余生命
  max: number; // 满生命
};

export default function Hearts({ hearts }: Props) {
  return (
    <View style={styles.row}>
      {/* 用一颗红心图标 + 数字，简洁不占地方 */}
      <Heart color={tokens.colors.danger} fill={tokens.colors.danger} size={22} />
      <Text style={styles.count}>{Math.max(hearts, 0)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  count: { fontSize: tokens.fontSize.md, fontWeight: '800', color: tokens.colors.danger },
});
