// CareerMatchScreen.tsx —— 转型推荐（Phase 3）
//
// 流程：选择「当前职业」→ 展示推荐的可转型方向（含理由与难度）→
//       点击某个方向 → 跳转到该职业的学习步骤页（LearningPath）。

import React, { useEffect, useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ArrowRight } from 'lucide-react-native';

import { tokens } from '@/theme/tokens';
import { fetchCurrentJobs, fetchCareerPaths } from '@/services/content';
import type { CareerPath, CurrentJob } from '@/content/types';
import type { RootStackParamList } from '@/navigation/types';

// 难度标签配色
const DIFFICULTY_COLOR: Record<string, string> = {
  较易: tokens.colors.success,
  中等: tokens.colors.warning,
  较难: tokens.colors.danger,
};

export default function CareerMatchScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [currentJobs, setCurrentJobs] = useState<CurrentJob[] | null>(null);
  const [paths, setPaths] = useState<CareerPath[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    // 同时拉「当前职业选项」和「所有目标路径」（后者用于把推荐 targetId 补全为展示信息）
    Promise.all([fetchCurrentJobs(), fetchCareerPaths()]).then(([jobs, ps]) => {
      setCurrentJobs(jobs);
      setPaths(ps);
    });
  }, []);

  // 按 id 快速查目标职业信息
  const pathById = useMemo(() => {
    const map: Record<string, CareerPath> = {};
    paths.forEach((p) => (map[p.id] = p));
    return map;
  }, [paths]);

  const selected = currentJobs?.find((j) => j.id === selectedId) ?? null;

  if (currentJobs === null) {
    return (
      <SafeAreaView style={[styles.container, styles.center]} edges={['top']}>
        <ActivityIndicator color={tokens.colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.body}>
        <Text style={styles.title}>你想从哪里出发？</Text>
        <Text style={styles.subtitle}>选择你当前的职业，看看适合转型的方向</Text>

        {/* 当前职业选择：可点选的标签 */}
        <View style={styles.chips}>
          {currentJobs.map((job) => {
            const active = job.id === selectedId;
            return (
              <Pressable
                key={job.id}
                onPress={() => setSelectedId(job.id)}
                style={[styles.chip, active && styles.chipActive]}
              >
                <Text style={styles.chipEmoji}>{job.emoji}</Text>
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{job.title}</Text>
              </Pressable>
            );
          })}
        </View>

        {/* 推荐结果 */}
        {selected ? (
          <View style={styles.recWrap}>
            <Text style={styles.recTitle}>为「{selected.title}」推荐的方向</Text>
            {selected.recommendations.map((rec) => {
              const path = pathById[rec.targetId];
              if (!path) return null;
              return (
                <Pressable
                  key={rec.targetId}
                  onPress={() =>
                    navigation.navigate('LearningPath', {
                      careerId: path.id,
                      title: path.title,
                    })
                  }
                  style={({ pressed }) => [
                    styles.recCard,
                    { borderLeftColor: path.accent },
                    pressed && styles.recPressed,
                  ]}
                >
                  <View style={[styles.recIcon, { backgroundColor: path.accent }]}>
                    <Text style={styles.recEmoji}>{path.emoji}</Text>
                  </View>
                  <View style={styles.recBody}>
                    <View style={styles.recHead}>
                      <Text style={styles.recName}>{path.title}</Text>
                      <View
                        style={[
                          styles.badge,
                          { backgroundColor: DIFFICULTY_COLOR[rec.difficulty] },
                        ]}
                      >
                        <Text style={styles.badgeText}>{rec.difficulty}</Text>
                      </View>
                    </View>
                    <Text style={styles.recReason}>{rec.reason}</Text>
                  </View>
                  <ArrowRight color={tokens.colors.textDim} size={20} />
                </Pressable>
              );
            })}
          </View>
        ) : (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>选择上方的当前职业，查看转型建议</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: tokens.colors.background },
  center: { alignItems: 'center', justifyContent: 'center' },
  body: { padding: tokens.spacing.xl, paddingBottom: tokens.spacing.xxl },
  title: { fontSize: tokens.fontSize.xl, fontWeight: '800', color: tokens.colors.text },
  subtitle: {
    marginTop: tokens.spacing.xs,
    fontSize: tokens.fontSize.sm,
    color: tokens.colors.textMuted,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: tokens.spacing.sm,
    marginTop: tokens.spacing.lg,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: tokens.radius.pill,
    borderWidth: 1.5,
    borderColor: tokens.colors.border,
    backgroundColor: tokens.colors.surface,
    paddingVertical: tokens.spacing.sm,
    paddingHorizontal: tokens.spacing.md,
  },
  chipActive: {
    borderColor: tokens.colors.primary,
    backgroundColor: tokens.colors.primarySoft,
  },
  chipEmoji: { fontSize: 16 },
  chipText: { fontSize: tokens.fontSize.sm, fontWeight: '700', color: tokens.colors.textMuted },
  chipTextActive: { color: tokens.colors.primaryDark },
  recWrap: { marginTop: tokens.spacing.xl, gap: tokens.spacing.md },
  recTitle: { fontSize: tokens.fontSize.md, fontWeight: '800', color: tokens.colors.text },
  recCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.md,
    backgroundColor: tokens.colors.surface,
    borderRadius: tokens.radius.lg,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    borderLeftWidth: 5,
    padding: tokens.spacing.lg,
  },
  recPressed: { opacity: 0.9 },
  recIcon: {
    width: 46,
    height: 46,
    borderRadius: tokens.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recEmoji: { fontSize: 24 },
  recBody: { flex: 1 },
  recHead: { flexDirection: 'row', alignItems: 'center', gap: tokens.spacing.sm },
  recName: { fontSize: tokens.fontSize.md, fontWeight: '800', color: tokens.colors.text },
  badge: {
    borderRadius: tokens.radius.xs,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: { fontSize: tokens.fontSize.xs, fontWeight: '700', color: tokens.colors.onPrimary },
  recReason: {
    marginTop: 4,
    fontSize: tokens.fontSize.sm,
    color: tokens.colors.textMuted,
    lineHeight: 20,
  },
  empty: {
    marginTop: tokens.spacing.xxl,
    alignItems: 'center',
  },
  emptyText: { fontSize: tokens.fontSize.sm, color: tokens.colors.textDim },
});
