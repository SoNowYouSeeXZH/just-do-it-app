// OptionCard.tsx —— 单个选项卡片（多邻国式可点击选项）
//
// 四种视觉状态：
//   default  未选中
//   selected 已选中（还没检查）
//   correct  检查后：这是正确答案 → 绿色
//   wrong    检查后：这是你选错的那个 → 红色
// 检查后禁止再点。

import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { tokens } from '@/theme/tokens';

export type OptionVisual = 'default' | 'selected' | 'correct' | 'wrong';

type Props = {
  label: string; // 选项文字
  visual: OptionVisual;
  accent: string; // 职业主题色，用于「selected」态描边
  disabled?: boolean; // 检查后禁用点击
  onPress: () => void;
};

export default function OptionCard({ label, visual, accent, disabled, onPress }: Props) {
  // 依据状态计算边框、背景、文字颜色
  const { borderColor, backgroundColor, textColor } = resolveColors(visual, accent);

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.card,
        { borderColor, backgroundColor },
        pressed && !disabled && styles.pressed,
      ]}
    >
      <Text style={[styles.label, { color: textColor }]}>{label}</Text>
    </Pressable>
  );
}

function resolveColors(visual: OptionVisual, accent: string) {
  switch (visual) {
    case 'selected':
      return { borderColor: accent, backgroundColor: tokens.colors.surface, textColor: accent };
    case 'correct':
      return {
        borderColor: tokens.colors.success,
        backgroundColor: tokens.colors.primarySoft,
        textColor: tokens.colors.primaryDark,
      };
    case 'wrong':
      return {
        borderColor: tokens.colors.danger,
        backgroundColor: '#fdecec',
        textColor: tokens.colors.danger,
      };
    default:
      return {
        borderColor: tokens.colors.border,
        backgroundColor: tokens.colors.surface,
        textColor: tokens.colors.text,
      };
  }
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 2,
    borderRadius: tokens.radius.md,
    paddingVertical: tokens.spacing.lg,
    paddingHorizontal: tokens.spacing.lg,
    // 底部加厚一点，呼应按钮的立体感
    borderBottomWidth: 4,
  },
  pressed: { opacity: 0.85 },
  label: { fontSize: tokens.fontSize.md, fontWeight: '600', lineHeight: 22 },
});
