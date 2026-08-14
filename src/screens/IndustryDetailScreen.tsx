// IndustryDetailScreen.tsx —— 行业详情（Phase 2）
//
// 展示某个行业的概述、关键知识点，以及可点击跳转的外部学习资料。
// 外链用系统浏览器打开（Linking.openURL）。

import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { CheckCircle2, ExternalLink } from 'lucide-react-native';

import { tokens } from '@/theme/tokens';
import { fetchIndustry } from '@/services/content';
import type { Industry } from '@/content/types';
import type { RootStackParamList } from '@/navigation/types';

export default function IndustryDetailScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'IndustryDetail'>>();
  const { industryId } = route.params;
  const [industry, setIndustry] = useState<Industry | null>(null);

  useEffect(() => {
    fetchIndustry(industryId).then((data) => setIndustry(data ?? null));
  }, [industryId]);

  // 打开外部链接（失败时静默，避免崩溃）
  const openLink = (url: string) => {
    Linking.openURL(url).catch(() => {});
  };

  if (!industry) {
    return (
      <SafeAreaView style={[styles.container, styles.center]} edges={['bottom']}>
        <ActivityIndicator color={tokens.colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.body}>
        {/* 头部：图标 + 名称 + 简介 */}
        <View style={styles.head}>
          <View style={[styles.iconWrap, { backgroundColor: industry.accent }]}>
            <Text style={styles.icon}>{industry.emoji}</Text>
          </View>
          <View style={styles.headText}>
            <Text style={styles.name}>{industry.name}</Text>
            <Text style={styles.summary}>{industry.summary}</Text>
          </View>
        </View>

        {/* 概述 */}
        <Text style={styles.overview}>{industry.overview}</Text>

        {/* 关键知识点 */}
        <Text style={styles.sectionTitle}>关键知识点</Text>
        <View style={styles.card}>
          {industry.keyPoints.map((point, i) => (
            <View key={i} style={styles.pointRow}>
              <CheckCircle2 color={industry.accent} size={18} />
              <Text style={styles.pointText}>{point}</Text>
            </View>
          ))}
        </View>

        {/* 外部学习资料 */}
        <Text style={styles.sectionTitle}>学习资料</Text>
        <View style={styles.linkGroup}>
          {industry.links.map((link, i) => (
            <Pressable
              key={i}
              onPress={() => openLink(link.url)}
              style={({ pressed }) => [styles.linkRow, pressed && styles.linkPressed]}
            >
              <ExternalLink color={industry.accent} size={18} />
              <Text style={[styles.linkText, { color: industry.accent }]}>{link.label}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: tokens.colors.background },
  center: { alignItems: 'center', justifyContent: 'center' },
  body: { padding: tokens.spacing.xl, paddingBottom: tokens.spacing.xxl },
  head: { flexDirection: 'row', alignItems: 'center', gap: tokens.spacing.md },
  iconWrap: {
    width: 60,
    height: 60,
    borderRadius: tokens.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: { fontSize: 30 },
  headText: { flex: 1 },
  name: { fontSize: tokens.fontSize.lg, fontWeight: '800', color: tokens.colors.text },
  summary: { marginTop: 2, fontSize: tokens.fontSize.sm, color: tokens.colors.textMuted },
  overview: {
    marginTop: tokens.spacing.lg,
    fontSize: tokens.fontSize.md,
    lineHeight: 24,
    color: tokens.colors.textMuted,
  },
  sectionTitle: {
    marginTop: tokens.spacing.xl,
    marginBottom: tokens.spacing.md,
    fontSize: tokens.fontSize.md,
    fontWeight: '800',
    color: tokens.colors.text,
  },
  card: {
    backgroundColor: tokens.colors.surface,
    borderRadius: tokens.radius.lg,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    padding: tokens.spacing.lg,
    gap: tokens.spacing.md,
  },
  pointRow: { flexDirection: 'row', gap: tokens.spacing.sm, alignItems: 'flex-start' },
  pointText: { flex: 1, fontSize: tokens.fontSize.sm, lineHeight: 22, color: tokens.colors.text },
  linkGroup: { gap: tokens.spacing.sm },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.sm,
    backgroundColor: tokens.colors.surface,
    borderRadius: tokens.radius.md,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    paddingVertical: tokens.spacing.md,
    paddingHorizontal: tokens.spacing.lg,
  },
  linkPressed: { opacity: 0.85 },
  linkText: { flex: 1, fontSize: tokens.fontSize.sm, fontWeight: '700' },
});
