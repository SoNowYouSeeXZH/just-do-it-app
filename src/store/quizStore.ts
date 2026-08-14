// quizStore.ts —— 答题会话状态管理（仿多邻国一节课的玩法）
//
// 用 zustand 管理「正在进行的这节课」的所有状态：当前第几题、选了哪个、
// 是否已检查、答对几道、剩几条命等。同时用 persist 持久化累计 XP 和各职业最佳成绩。
//
// 玩法流程（对齐多邻国）：
//   进入 → 选一个选项 → 点「检查」→ 显示对/错 + 解析 → 点「继续」→ 下一题
//   答错扣 1 条命；命扣光 → 失败；全部答完 → 通关并结算 XP。

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { QuizQuestion } from '@/quiz/types';

// 每节课初始生命值
const MAX_HEARTS = 5;
// 每答对一题获得的经验
const XP_PER_CORRECT = 10;

// 一节课的进行状态
export type LessonStatus = 'idle' | 'playing' | 'finished' | 'failed';

interface QuizState {
  // —— 当前会话（不持久化，退出即重来）——
  jobId: string | null;
  jobTitle: string;
  accent: string;
  questions: QuizQuestion[];
  index: number; // 当前题目下标
  selectedIndex: number | null; // 当前选中的选项，未选为 null
  checked: boolean; // 当前题是否已点「检查」
  correctCount: number; // 本节答对数
  hearts: number; // 剩余生命
  status: LessonStatus;

  // —— 持久化的累计数据 ——
  totalXp: number; // 总经验
  bestScores: Record<string, number>; // 各职业历史最佳答对数 { jobId: correctCount }
}

interface QuizActions {
  startLesson: (params: {
    jobId: string;
    jobTitle: string;
    accent: string;
    questions: QuizQuestion[];
  }) => void;
  select: (optionIndex: number) => void; // 选择某个选项
  check: () => void; // 点「检查」，判定对错
  next: () => void; // 点「继续」，进入下一题或结算
  reset: () => void; // 清空当前会话
}

type Store = QuizState & QuizActions;

// 会话相关字段的初始值（开始新课/重置时用）
const freshSession = {
  jobId: null as string | null,
  jobTitle: '',
  accent: '',
  questions: [] as QuizQuestion[],
  index: 0,
  selectedIndex: null as number | null,
  checked: false,
  correctCount: 0,
  hearts: MAX_HEARTS,
  status: 'idle' as LessonStatus,
};

export const useQuizStore = create<Store>()(
  persist(
    (set, get) => ({
      ...freshSession,
      totalXp: 0,
      bestScores: {},

      startLesson: ({ jobId, jobTitle, accent, questions }) => {
        set({
          ...freshSession,
          jobId,
          jobTitle,
          accent,
          questions,
          status: 'playing',
        });
      },

      select: (optionIndex) => {
        // 已经检查过就不允许再改选择
        if (get().checked) return;
        set({ selectedIndex: optionIndex });
      },

      check: () => {
        const { selectedIndex, checked, questions, index, correctCount, hearts } = get();
        // 没选选项、或已经检查过，直接忽略
        if (selectedIndex === null || checked) return;

        const isCorrect = selectedIndex === questions[index].answerIndex;

        set({
          checked: true,
          correctCount: isCorrect ? correctCount + 1 : correctCount,
          // 答错扣一条命；这里只更新数值，不改 status，
          // 让用户先看到本题解析，等点「继续」时再由 next() 判定是否失败。
          hearts: isCorrect ? hearts : hearts - 1,
        });
      },

      next: () => {
        const { index, questions, hearts, jobId, correctCount, totalXp, bestScores } = get();

        // 结算逻辑：把本节成绩并入累计数据
        const settle = (finalStatus: LessonStatus) => {
          const gainedXp = correctCount * XP_PER_CORRECT;
          const prevBest = jobId ? (bestScores[jobId] ?? 0) : 0;
          set({
            status: finalStatus,
            totalXp: totalXp + gainedXp,
            bestScores: jobId
              ? { ...bestScores, [jobId]: Math.max(prevBest, correctCount) }
              : bestScores,
          });
        };

        // 生命已耗尽 → 结算为失败
        if (hearts <= 0) {
          settle('failed');
          return;
        }

        // 还有下一题 → 前进并重置本题的选择/检查态
        if (index + 1 < questions.length) {
          set({ index: index + 1, selectedIndex: null, checked: false });
          return;
        }

        // 最后一题答完 → 通关结算
        settle('finished');
      },

      reset: () => set({ ...freshSession }),
    }),
    {
      name: 'quiz-progress-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // 只持久化累计数据，进行中的会话不持久化（避免中途关闭后状态混乱）
      partialize: (state) => ({
        totalXp: state.totalXp,
        bestScores: state.bestScores,
      }),
    },
  ),
);

// 供界面复用的常量
export const QUIZ_CONFIG = { MAX_HEARTS, XP_PER_CORRECT };
