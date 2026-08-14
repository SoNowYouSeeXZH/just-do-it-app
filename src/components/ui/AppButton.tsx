// AppButton.tsx —— 全局通用按钮
//
// 为什么要有这个组件：
// 按钮在很多页面都会用到，如果每个页面各写各的样式，风格会不统一、也难维护。
// 抽成一个组件后，所有按钮长得一致，改样式也只改这一处。

import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  ViewStyle,
} from 'react-native';
import { tokens } from '@/theme/tokens';

type Props = {
  label: string; // 按钮文字
  onPress: () => void; // 点击回调
  variant?: 'primary' | 'ghost'; // primary=实心主色，ghost=描边次要按钮
  loading?: boolean; // 加载中显示转圈并禁用点击
  disabled?: boolean;
  style?: ViewStyle;
};

export default function AppButton({
  label,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
}: Props) {
  const isPrimary = variant === 'primary';
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      // 按下时轻微变暗，给用户点击反馈
      style={({ pressed }) => [
        styles.base,
        isPrimary ? styles.primary : styles.ghost,
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? tokens.colors.onPrimary : tokens.colors.primary} />
      ) : (
        <Text style={[styles.label, isPrimary ? styles.labelPrimary : styles.labelGhost]}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 52,
    borderRadius: tokens.radius.pill, // 胶囊形，多邻国风格
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: tokens.spacing.xl,
  },
  primary: {
    backgroundColor: tokens.colors.primary,
    // 底部一条深色，模拟多邻国按钮的「立体厚度」
    borderBottomWidth: 4,
    borderBottomColor: tokens.colors.primaryDark,
  },
  ghost: {
    backgroundColor: tokens.colors.surface,
    borderWidth: 2,
    borderColor: tokens.colors.border,
  },
  pressed: { opacity: 0.85 },
  disabled: { opacity: 0.5 },
  label: { fontSize: tokens.fontSize.md, fontWeight: '700' },
  labelPrimary: { color: tokens.colors.onPrimary },
  labelGhost: { color: tokens.colors.text },
});
