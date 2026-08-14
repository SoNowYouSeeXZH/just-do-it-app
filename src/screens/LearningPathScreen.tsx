// LearningPathScreen.tsx —— 学习步骤详情页（Phase 3 完善，Phase 4 的 AI 助手已全局化）
//
// 从「转型推荐」或「首页」跳进来，收到路由参数 { careerId, title }。
// 按 careerId 拉取该职业的分步学习路径并以时间线样式展示：
//   - 每个步骤含标题、说明；
//   - 带 quizJobId 的步骤提供「去答题巩固」按钮，跳到 Quiz（打通 Phase 1）；
//   - 带 links 的步骤提供外部资料链接。
// 页面右下角的 AI 助手入口已提取为全局组件 GlobalChatButton（App 层挂载），
// 所有页面共用，此处不再维护页面内入口。

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
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { ExternalLink, PlayCircle } from 'lucide-react-native';

import { tokens } from '@/theme/tokens';
import { fetchCareerPath } from '@/services/content';
import type { CareerPath } from '@/content/types';
import type { RootStackParamList } from '@/navigation/types';

export default function LearningPathScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'LearningPath'>>();
  const { careerId } = route.params;

  const [path, setPath] = useState<CareerPath | null>(null);

  useEffect(() => {
    fetchCareerPath(careerId).then((data) => setPath(data ?? null));
  }, [careerId]);

  const openLink = (url: string) => {
    Linking.openURL(url).catch(() => {});
  };

  if (!path) {
    return (
      <SafeAreaView style={[styles.container, styles.center]} edges={['bottom']}>
        <ActivityIndicator color={tokens.colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.body}>
        {/* 顶部：职业定位 */}
        <View style={styles.head}>
          <View style={[styles.iconWrap, { backgroundColor: path.accent }]}>
            <Text style={styles.icon}>{path.emoji}</Text>
          </View>
          <View style={styles.headText}>
            <Text style={styles.name}>{path.title}</Text>
            <Text style={styles.summary}>{path.summary}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>学习步骤</Text>

        {/* 步骤时间线 */}
        <View style={styles.timeline}>
          {path.steps.map((step, i) => {
            const isLast = i === path.steps.length - 1;
            return (
              <View key={step.id} style={styles.stepRow}>
                {/* 左侧序号 + 连接线 */}
                <View style={styles.railCol}>
                  <View style={[styles.stepDot, { backgroundColor: path.accent }]}>
                    <Text style={styles.stepDotText}>{i + 1}</Text>
                  </View>
                  {!isLast && <View style={styles.railLine} />}
                </View>

                {/* 右侧内容卡 */}
                <View style={styles.stepCard}>
                  <Text style={styles.stepTitle}>{step.title}</Text>
                  <Text style={styles.stepDesc}>{step.desc}</Text>

                  {/* 外链 */}
                  {step.links?.map((link, li) => (
                    <Pressable
                      key={li}
                      onPress={() => openLink(link.url)}
                      style={styles.linkRow}
                    >
                      <ExternalLink color={path.accent} size={15} />
                      <Text style={[styles.linkText, { color: path.accent }]}>{link.label}</Text>
                    </Pressable>
                  ))}

                  {/* 可答题的步骤：去答题巩固 */}
                  {step.quizJobId && (
                    <Pressable
                      onPress={() =>
                        navigation.navigate('Quiz', { jobId: step.quizJobId as string })
                      }
                      style={[styles.quizBtn, { backgroundColor: path.accent }]}
                    >
                      <PlayCircle color={tokens.colors.onPrimary} size={18} />
                      <Text style={styles.quizBtnText}>去答题巩固</Text>
                    </Pressable>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        <Text style={styles.hint}>提示：完成学习步骤后，右下角的 AI 助手可随时答疑（全局入口）。</Text>
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
  sectionTitle: {
    marginTop: tokens.spacing.xl,
    marginBottom: tokens.spacing.md,
    fontSize: tokens.fontSize.md,
    fontWeight: '800',
    color: tokens.colors.text,
  },
  timeline: { gap: 0 },
  stepRow: { flexDirection: 'row', gap: tokens.spacing.md },
  railCol: { alignItems: 'center', width: 32 },
  stepDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotText: { fontSize: tokens.fontSize.sm, fontWeight: '800', color: tokens.colors.onPrimary },
  railLine: { flex: 1, width: 2, backgroundColor: tokens.colors.border, marginVertical: 4 },
  stepCard: {
    flex: 1,
    marginBottom: tokens.spacing.lg,
    backgroundColor: tokens.colors.surface,
    borderRadius: tokens.radius.lg,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    padding: tokens.spacing.lg,
  },
  stepTitle: { fontSize: tokens.fontSize.md, fontWeight: '800', color: tokens.colors.text },
  stepDesc: {
    marginTop: 4,
    fontSize: tokens.fontSize.sm,
    lineHeight: 22,
    color: tokens.colors.textMuted,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: tokens.spacing.sm,
  },
  linkText: { fontSize: tokens.fontSize.sm, fontWeight: '700' },
  quizBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: tokens.spacing.md,
    height: 42,
    borderRadius: tokens.radius.pill,
  },
  quizBtnText: { fontSize: tokens.fontSize.sm, fontWeight: '800', color: tokens.colors.onPrimary },
  hint: {
    marginTop: tokens.spacing.lg,
    fontSize: tokens.fontSize.xs,
    color: tokens.colors.textDim,
    lineHeight: 18,
  },
});
