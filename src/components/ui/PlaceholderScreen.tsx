// PlaceholderScreen.tsx —— 占位页面组件
//
// 为什么要有它：
// Phase 0 只搭骨架，很多页面还没实现内容。用一个统一的占位组件，
// 既能让导航跑通、又能清楚标注「这个页面将来做什么、属于第几阶段」。
// 后续每个 Phase 会把对应页面的占位内容替换成真实功能。

import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, Text, View } from 'react-native';
import { tokens } from '@/theme/tokens';

type Props = {
  title: string; // 页面标题
  description: string; // 一句话说明这个页面将来做什么
  phase: string; // 标注属于哪个阶段，便于对照计划
};

export default function PlaceholderScreen({ title, description, phase }: Props) {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.content}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{phase}</Text>
        </View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.desc}>{description}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: tokens.colors.background },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: tokens.spacing.xl,
  },
  badge: {
    backgroundColor: tokens.colors.primarySoft,
    borderRadius: tokens.radius.pill,
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.xs,
    marginBottom: tokens.spacing.lg,
  },
  badgeText: { color: tokens.colors.primaryDark, fontSize: tokens.fontSize.xs, fontWeight: '700' },
  title: {
    fontSize: tokens.fontSize.xl,
    fontWeight: '800',
    color: tokens.colors.text,
    textAlign: 'center',
  },
  desc: {
    marginTop: tokens.spacing.sm,
    fontSize: tokens.fontSize.md,
    color: tokens.colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
});
