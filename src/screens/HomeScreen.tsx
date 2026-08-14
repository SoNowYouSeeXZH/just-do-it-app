// HomeScreen.tsx —— 首页：职业「课程」列表（多邻国式）
//
// 展示所有热门互联网职业，每个职业是一张彩色课程卡。点击进入该职业的面试题答题。
// 顶部显示累计经验 XP。数据通过 services/content 异步获取（已切到后端接口）。

import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Zap, ChevronRight } from "lucide-react-native";

import { tokens } from "@/theme/tokens";
import { fetchJobs } from "@/services/content";
import { useQuizStore } from "@/store/quizStore";
import type { JobSummary } from "@/quiz/types";
import type { RootStackParamList } from "@/navigation/types";

export default function HomeScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const totalXp = useQuizStore((s) => s.totalXp);
  const bestScores = useQuizStore((s) => s.bestScores);

  const [jobs, setJobs] = useState<JobSummary[] | null>(null);

  useEffect(() => {
    // 拉取职业列表（异步，方便将来换成后端接口）
    fetchJobs().then(setJobs);
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* 顶部：标题 + XP */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>选择你想练的职业</Text>
          <Text style={styles.subtitle}>刷面试题，像玩游戏一样准备转行</Text>
        </View>
        <View style={styles.xpPill}>
          <Zap
            color={tokens.colors.accent}
            fill={tokens.colors.accent}
            size={16}
          />
          <Text style={styles.xpText}>{totalXp}</Text>
        </View>
      </View>

      {jobs === null ? (
        // 加载态
        <View style={styles.center}>
          <ActivityIndicator color={tokens.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={jobs}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const best = bestScores[item.id];
            return (
              <Pressable
                onPress={() => navigation.navigate("Quiz", { jobId: item.id })}
                style={({ pressed }) => [
                  styles.card,
                  pressed && styles.cardPressed,
                ]}
              >
                {/* 左侧彩色圆形 emoji 图标 */}
                <View
                  style={[styles.iconWrap, { backgroundColor: item.accent }]}
                >
                  <Text style={styles.icon}>{item.emoji}</Text>
                </View>
                {/* 中间文字 */}
                <View style={styles.cardBody}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Text style={styles.cardTag}>{item.tagline}</Text>
                  <Text style={styles.cardMeta}>
                    {item.questionCount} 道题
                    {best !== undefined
                      ? ` · 最佳 ${best}/${item.questionCount}`
                      : ""}
                  </Text>
                </View>
                <ChevronRight color={tokens.colors.textDim} size={22} />
              </Pressable>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: tokens.colors.background },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: tokens.spacing.xl,
    paddingTop: tokens.spacing.lg,
    paddingBottom: tokens.spacing.md,
  },
  title: {
    fontSize: tokens.fontSize.xl,
    fontWeight: "800",
    color: tokens.colors.text,
  },
  subtitle: {
    marginTop: tokens.spacing.xs,
    fontSize: tokens.fontSize.sm,
    color: tokens.colors.textMuted,
  },
  xpPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: tokens.colors.accentSoft,
    borderRadius: tokens.radius.pill,
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.xs,
  },
  xpText: {
    fontSize: tokens.fontSize.md,
    fontWeight: "800",
    color: tokens.colors.accent,
  },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  list: { padding: tokens.spacing.lg, gap: tokens.spacing.md },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: tokens.spacing.md,
    backgroundColor: tokens.colors.surface,
    borderRadius: tokens.radius.lg,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    borderBottomWidth: 4,
    padding: tokens.spacing.lg,
  },
  cardPressed: { opacity: 0.9 },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: tokens.radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: { fontSize: 26 },
  cardBody: { flex: 1 },
  cardTitle: {
    fontSize: tokens.fontSize.md,
    fontWeight: "800",
    color: tokens.colors.text,
  },
  cardTag: {
    marginTop: 2,
    fontSize: tokens.fontSize.sm,
    color: tokens.colors.textMuted,
  },
  cardMeta: {
    marginTop: 4,
    fontSize: tokens.fontSize.xs,
    color: tokens.colors.textDim,
    fontWeight: "600",
  },
});
