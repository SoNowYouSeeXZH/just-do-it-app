// QuizResultScreen.tsx —— 一节课结束后的结算页（多邻国式）
//
// 展示：通关/失败标题、答对比例、本次获得 XP、历史最佳。
// 操作：再来一次（重开这门课）/ 返回学习首页。
//
// 数据全部来自 quizStore 里刚结算完的会话状态，因此这里只读不算。

import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";
import { Trophy, HeartCrack, Zap, Target } from "lucide-react-native";

import { tokens } from "@/theme/tokens";
import { useQuizStore, QUIZ_CONFIG } from "@/store/quizStore";
import type { RootStackParamList } from "@/navigation/types";

export default function QuizResultScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, "QuizResult">>();
  const { jobId } = route.params;

  // 读取刚结算完的会话数据
  const {
    jobTitle,
    accent,
    questions,
    correctCount,
    status,
    totalXp,
    bestScores,
    reset,
  } = useQuizStore();

  const total = questions.length;
  const passed = status === "finished"; // finished=通关，failed=命扣光
  const gainedXp = correctCount * QUIZ_CONFIG.XP_PER_CORRECT;
  const best = bestScores[jobId] ?? correctCount;

  // 再来一次：清空会话并重新进入答题页（用 replace 避免结果页堆积在返回栈里）
  const handleRetry = () => {
    reset();
    navigation.replace("Quiz", { jobId });
  };

  // 返回：清空会话并回到底部标签的学习首页
  const handleBack = () => {
    reset();
    navigation.navigate("Tabs");
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.body}>
        {/* 顶部大图标：通关金杯 / 失败裂心 */}
        <View
          style={[
            styles.iconCircle,
            { backgroundColor: passed ? tokens.colors.primarySoft : "#fdecec" },
          ]}
        >
          {passed ? (
            <Trophy color={tokens.colors.primary} size={56} />
          ) : (
            <HeartCrack color={tokens.colors.danger} size={56} />
          )}
        </View>

        <Text style={styles.title}>{passed ? "恭喜通关！" : "生命值耗尽"}</Text>
        <Text style={styles.subtitle}>
          {passed
            ? `你完成了「${jobTitle}」这一课`
            : `再挑战一次「${jobTitle}」吧`}
        </Text>

        {/* 数据卡片：正确率 + 本次 XP */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { borderColor: accent }]}>
            <Target color={accent} size={20} />
            <Text style={[styles.statValue, { color: accent }]}>
              {correctCount}/{total}
            </Text>
            <Text style={styles.statLabel}>答对题数</Text>
          </View>
          <View
            style={[styles.statCard, { borderColor: tokens.colors.accent }]}
          >
            <Zap color={tokens.colors.accent} size={20} />
            <Text style={[styles.statValue, { color: tokens.colors.accent }]}>
              +{gainedXp}
            </Text>
            <Text style={styles.statLabel}>获得经验</Text>
          </View>
        </View>

        {/* 汇总信息 */}
        <View style={styles.summary}>
          <Text style={styles.summaryText}>历史最佳：答对 {best} 题</Text>
          <Text style={styles.summaryText}>累计经验：{totalXp} XP</Text>
        </View>
      </View>

      {/* 底部操作按钮 */}
      <View style={styles.footer}>
        <Pressable
          style={[styles.primaryBtn, { backgroundColor: accent }]}
          onPress={handleRetry}
        >
          <Text style={styles.primaryBtnText}>再来一次</Text>
        </Pressable>
        <Pressable style={styles.secondaryBtn} onPress={handleBack}>
          <Text style={styles.secondaryBtnText}>返回学习首页</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: tokens.colors.background },
  body: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: tokens.spacing.xl,
  },
  iconCircle: {
    width: 112,
    height: 112,
    borderRadius: 56,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: tokens.spacing.xl,
  },
  title: {
    fontSize: tokens.fontSize.xl,
    fontWeight: "800",
    color: tokens.colors.text,
    marginBottom: tokens.spacing.sm,
  },
  subtitle: {
    fontSize: tokens.fontSize.sm,
    color: tokens.colors.textMuted,
    textAlign: "center",
    marginBottom: tokens.spacing.xl,
  },
  statsRow: {
    flexDirection: "row",
    gap: tokens.spacing.md,
    marginBottom: tokens.spacing.xl,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    gap: tokens.spacing.xs,
    paddingVertical: tokens.spacing.lg,
    borderWidth: 2,
    borderRadius: tokens.radius.lg,
    backgroundColor: tokens.colors.surface,
  },
  statValue: { fontSize: tokens.fontSize.lg, fontWeight: "800" },
  statLabel: { fontSize: tokens.fontSize.xs, color: tokens.colors.textMuted },
  summary: { alignItems: "center", gap: tokens.spacing.xs },
  summaryText: { fontSize: tokens.fontSize.sm, color: tokens.colors.textDim },
  footer: {
    padding: tokens.spacing.lg,
    gap: tokens.spacing.md,
  },
  primaryBtn: {
    height: 52,
    borderRadius: tokens.radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBtnText: {
    fontSize: tokens.fontSize.md,
    fontWeight: "800",
    color: tokens.colors.onPrimary,
  },
  secondaryBtn: {
    height: 52,
    borderRadius: tokens.radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: tokens.colors.surfaceSoft,
  },
  secondaryBtnText: {
    fontSize: tokens.fontSize.md,
    fontWeight: "700",
    color: tokens.colors.textMuted,
  },
});
