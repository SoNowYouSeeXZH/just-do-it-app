// QuizScreen.tsx —— 答题主界面（多邻国式一节课的核心玩法）
//
// 结构：
//   顶部：关闭按钮 + 进度条 + 生命值
//   中间：题干 + 选项卡片列表
//   底部：反馈条（答对/答错 + 解析）+「检查/继续」按钮
//
// 流程：进入时按 jobId 拉题并 startLesson；答完或命扣光后跳到结算页 QuizResult。

import React, { useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";
import { X, Check, XCircle } from "lucide-react-native";

import { tokens } from "@/theme/tokens";
import { fetchJob, fetchQuestions } from "@/services/content";
import { useQuizStore, QUIZ_CONFIG } from "@/store/quizStore";
import QuizProgressBar from "@/components/quiz/QuizProgressBar";
import Hearts from "@/components/quiz/Hearts";
import OptionCard, { type OptionVisual } from "@/components/quiz/OptionCard";
import type { RootStackParamList } from "@/navigation/types";

export default function QuizScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, "Quiz">>();
  const { jobId } = route.params;

  // 从 store 取会话状态与操作
  const {
    questions,
    index,
    selectedIndex,
    checked,
    hearts,
    accent,
    status,
    startLesson,
    select,
    check,
    next,
  } = useQuizStore();

  // 进入页面：拉取该职业的题目并开始一节课
  useEffect(() => {
    let alive = true;
    Promise.all([fetchJob(jobId), fetchQuestions(jobId)]).then(([job, qs]) => {
      if (!alive || !job) return;
      startLesson({
        jobId,
        jobTitle: job.title,
        accent: job.accent,
        questions: qs,
      });
    });
    return () => {
      alive = false;
    };
  }, [jobId, startLesson]);

  // 结算：一旦通关或失败，跳到结果页
  useEffect(() => {
    if (status === "finished" || status === "failed") {
      navigation.replace("QuizResult", { jobId });
    }
  }, [status, navigation, jobId]);

  // 题目还没加载好（或正在结算跳转）时显示加载态
  if (status !== "playing" || questions.length === 0) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <ActivityIndicator color={tokens.colors.primary} />
      </SafeAreaView>
    );
  }

  const question = questions[index];
  const isCorrect = checked && selectedIndex === question.answerIndex;

  // 计算每个选项该显示成什么视觉状态
  const visualFor = (optionIndex: number): OptionVisual => {
    if (!checked) return selectedIndex === optionIndex ? "selected" : "default";
    // 检查后：正确答案标绿；用户选错的那个标红；其余保持默认
    if (optionIndex === question.answerIndex) return "correct";
    if (optionIndex === selectedIndex) return "wrong";
    return "default";
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      {/* 顶部栏：关闭 + 进度 + 生命 */}
      <View style={styles.topBar}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={10}>
          <X color={tokens.colors.textDim} size={26} />
        </Pressable>
        <QuizProgressBar
          current={index}
          total={questions.length}
          color={accent}
        />
        <Hearts hearts={hearts} max={QUIZ_CONFIG.MAX_HEARTS} />
      </View>

      {/* 题干 + 选项 */}
      <ScrollView
        contentContainerStyle={styles.body}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.counter}>
          第 {index + 1} / {questions.length} 题
        </Text>
        <Text style={styles.prompt}>{question.prompt}</Text>

        <View style={styles.options}>
          {question.options.map((opt, i) => (
            <OptionCard
              key={i}
              label={opt}
              visual={visualFor(i)}
              accent={accent}
              disabled={checked}
              onPress={() => select(i)}
            />
          ))}
        </View>
      </ScrollView>

      {/* 底部反馈区 + 主按钮 */}
      <View
        style={[
          styles.footer,
          checked && (isCorrect ? styles.footerCorrect : styles.footerWrong),
        ]}
      >
        {checked ? (
          <View style={styles.feedbackRow}>
            {isCorrect ? (
              <Check color={tokens.colors.success} size={22} />
            ) : (
              <XCircle color={tokens.colors.danger} size={22} />
            )}
            <View style={styles.feedbackTextWrap}>
              <Text
                style={[
                  styles.feedbackTitle,
                  {
                    color: isCorrect
                      ? tokens.colors.primaryDark
                      : tokens.colors.danger,
                  },
                ]}
              >
                {isCorrect ? "回答正确！" : "答错了"}
              </Text>
              <Text style={styles.feedbackExplain}>{question.explanation}</Text>
            </View>
          </View>
        ) : null}

        {/* 主按钮：未检查=检查（需先选）；已检查=继续 */}
        {checked ? (
          <Pressable
            onPress={next}
            style={[
              styles.mainBtn,
              {
                backgroundColor: isCorrect
                  ? tokens.colors.success
                  : tokens.colors.danger,
              },
            ]}
          >
            <Text style={styles.mainBtnText}>继续</Text>
          </Pressable>
        ) : (
          <Pressable
            onPress={check}
            disabled={selectedIndex === null}
            style={[
              styles.mainBtn,
              {
                backgroundColor:
                  selectedIndex === null ? tokens.colors.surfaceSoft : accent,
              },
            ]}
          >
            <Text
              style={[
                styles.mainBtnText,
                selectedIndex === null && { color: tokens.colors.textDim },
              ]}
            >
              检查
            </Text>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: tokens.colors.background },
  center: { alignItems: "center", justifyContent: "center" },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: tokens.spacing.md,
    paddingHorizontal: tokens.spacing.lg,
    paddingVertical: tokens.spacing.md,
  },
  body: {
    padding: tokens.spacing.xl,
    paddingBottom: tokens.spacing.xxl,
  },
  counter: {
    fontSize: tokens.fontSize.xs,
    fontWeight: "700",
    color: tokens.colors.textDim,
    marginBottom: tokens.spacing.sm,
  },
  prompt: {
    fontSize: tokens.fontSize.lg,
    fontWeight: "800",
    color: tokens.colors.text,
    lineHeight: 28,
    marginBottom: tokens.spacing.xl,
  },
  options: { gap: tokens.spacing.md },
  footer: {
    padding: tokens.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: tokens.colors.border,
    backgroundColor: tokens.colors.surface,
    gap: tokens.spacing.md,
  },
  footerCorrect: {
    backgroundColor: tokens.colors.primarySoft,
    borderTopColor: tokens.colors.success,
  },
  footerWrong: {
    backgroundColor: "#fdecec",
    borderTopColor: tokens.colors.danger,
  },
  feedbackRow: { flexDirection: "row", gap: tokens.spacing.sm },
  feedbackTextWrap: { flex: 1 },
  feedbackTitle: {
    fontSize: tokens.fontSize.md,
    fontWeight: "800",
    marginBottom: 2,
  },
  feedbackExplain: {
    fontSize: tokens.fontSize.sm,
    color: tokens.colors.textMuted,
    lineHeight: 20,
  },
  mainBtn: {
    height: 52,
    borderRadius: tokens.radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  mainBtnText: {
    fontSize: tokens.fontSize.md,
    fontWeight: "800",
    color: tokens.colors.onPrimary,
  },
});
