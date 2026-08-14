// types.ts —— 答题（Quiz）功能的数据结构定义
//
// 这里定义「职业」和「面试题」长什么样。data/、services/、store/、screens/
// 都会引用这些类型，集中放一处避免各写各的。

// 单道面试题（多邻国式：单选，选一个正确答案）
export interface QuizQuestion {
  id: string;
  prompt: string; // 题干
  options: string[]; // 选项文本数组
  answerIndex: number; // 正确选项在 options 中的下标（从 0 开始）
  explanation: string; // 答完后展示的解析，帮助学习
}

// 一个「职业」= 多邻国里的一门「课程」
export interface Job {
  id: string;
  title: string; // 职业名，如「前端工程师」
  emoji: string; // 先用 emoji 当图标，避免美术依赖也不会有 AI 味
  tagline: string; // 一句话简介
  accent: string; // 该职业的主题色（多邻国式每门课不同色）
  questions: QuizQuestion[]; // 该职业的题库
}

// 职业「列表项」—— 后端 /api/jobs 返回的结构：元信息 + 题目数。
// 与 Job 的区别：不带题目内容（题目进入答题页时才单独拉），
// 但带 questionCount 供首页课程卡显示「N 道题 / 最佳 X/N」。
export interface JobSummary {
  id: string;
  title: string;
  emoji: string;
  tagline: string;
  accent: string;
  questionCount: number; // 该职业题库总题数（后端聚合）
}
