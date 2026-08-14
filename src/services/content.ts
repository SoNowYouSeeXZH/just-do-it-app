// content.ts —— 内容数据的服务层（取数入口）
//
// ★ 这是「先 mock、后迁移后端」的关键抽象 ★
// 答题（fetchJobs / fetchQuestions / fetchJob）、行业知识库
// （fetchIndustries / fetchIndustry）、转型推荐 + 学习路径
// （fetchCurrentJobs / fetchRecommendations / fetchCareerPath / fetchCareerPaths）
// 均已切换到后端真实接口（BASE_URL 见 @/api/client），页面和 store 无需改动。
//
// 后端字段与前端类型的差异在这里做映射：
// - Job → JobSummary：后端列表接口带 question_count，不带 questions（题目单独拉）
// - Question → QuizQuestion：后端 answer_indices 是列表，前端 answerIndex 是单个下标
// - Industry：后端 key_points 是 snake_case，前端 keyPoints 是 camelCase
// - CareerPath/CurrentJob：顶层字段和前端一致（后端表直接搬 JSON 列存 steps/recommendations，
//   嵌套结构维持前端驼峰命名），无需转换

import { BASE_URL } from '@/api/client';
import type { JobSummary, QuizQuestion } from '@/quiz/types';
import type {
  Industry,
  CareerPath,
  CurrentJob,
  CareerRecommendation,
} from '@/content/types';

// 后端 /api/jobs 返回的单条职业原始结构（snake_case）
type JobRaw = {
  id: string;
  title: string;
  emoji: string;
  tagline: string;
  accent: string;
  question_count: number;
};

// 后端 Question 表的结构（与前端 QuizQuestion 字段不同，见文件头注释）
interface BackendQuestion {
  id: number;
  job_id: string;
  qtype: string; // 'single' | 'multi'
  prompt: string;
  options: string[];
  answer_indices: number[];
  explanation: string;
  source_url: string | null;
  content_hash: string | null;
}

// 后端 /api/industries 返回的单条行业原始结构（snake_case）
interface IndustryRaw {
  id: string;
  name: string;
  emoji: string;
  accent: string;
  summary: string;
  overview: string;
  key_points: string[];
  links: { label: string; url: string }[];
}

// 后端 snake_case → 前端 camelCase 的字段映射
function toJobSummary(j: JobRaw): JobSummary {
  return {
    id: j.id,
    title: j.title,
    emoji: j.emoji,
    tagline: j.tagline,
    accent: j.accent,
    questionCount: j.question_count,
  };
}

function toIndustry(i: IndustryRaw): Industry {
  return {
    id: i.id,
    name: i.name,
    emoji: i.emoji,
    accent: i.accent,
    summary: i.summary,
    overview: i.overview,
    keyPoints: i.key_points,
    links: i.links,
  };
}

// 获取所有职业（课程列表）：GET /api/jobs
export async function fetchJobs(): Promise<JobSummary[]> {
  try {
    const res = await fetch(`${BASE_URL}/api/jobs`);
    if (!res.ok) return [];
    const data = (await res.json()) as JobRaw[];
    return data.map(toJobSummary);
  } catch {
    return []; // 后端没启动/网络不通时返回空列表，页面显示空态而非崩溃
  }
}

// 获取某个职业的题目（一次课程 = 若干道题，后端随机抽默认 10 道）
// GET /api/jobs/{jobId}/questions
export async function fetchQuestions(jobId: string): Promise<QuizQuestion[]> {
  try {
    const res = await fetch(`${BASE_URL}/api/jobs/${jobId}/questions`);
    if (!res.ok) return [];
    const data = (await res.json()) as BackendQuestion[];
    return data.map((q) => ({
      // 后端主键是自增 int，前端 id 是 string，转一下保持类型一致
      id: String(q.id),
      prompt: q.prompt,
      options: q.options,
      // answer_indices 是列表（支持多选）；目前题库都是单选，取第一个即可
      answerIndex: q.answer_indices[0],
      explanation: q.explanation,
    }));
  } catch {
    return [];
  }
}

// 按 id 取单个职业信息（答题页展示标题/主题色用）：GET /api/jobs/{jobId}
export async function fetchJob(jobId: string): Promise<JobSummary | undefined> {
  try {
    const res = await fetch(`${BASE_URL}/api/jobs/${jobId}`);
    if (!res.ok) return undefined; // 404（职业不存在）也走到这里
    return toJobSummary((await res.json()) as JobRaw);
  } catch {
    return undefined;
  }
}

// —— Phase 2：行业知识库 ——

// 获取所有行业：GET /api/industries
export async function fetchIndustries(): Promise<Industry[]> {
  try {
    const res = await fetch(`${BASE_URL}/api/industries`);
    if (!res.ok) return [];
    const data = (await res.json()) as IndustryRaw[];
    return data.map(toIndustry);
  } catch {
    return [];
  }
}

// 按 id 取单个行业详情：GET /api/industries/{industryId}
export async function fetchIndustry(industryId: string): Promise<Industry | undefined> {
  try {
    const res = await fetch(`${BASE_URL}/api/industries/${industryId}`);
    if (!res.ok) return undefined; // 404（行业不存在）也走到这里
    return toIndustry((await res.json()) as IndustryRaw);
  } catch {
    return undefined;
  }
}

// —— 转型推荐 + 学习路径 ——

// 后端 CurrentJob 的转型建议结构（顶层字段与前端一致，仅结构体重复声明以避免跨文件耦合）
interface RecommendationRaw {
  targetId: string;
  reason: string;
  difficulty: '较易' | '中等' | '较难';
}

// 后端 /api/current-jobs 返回的单条当前职业原始结构（顶层字段与前端一致）
interface CurrentJobRaw {
  id: string;
  title: string;
  emoji: string;
  recommendations: RecommendationRaw[];
}

// 获取所有「当前职业」选项（供用户选择）：GET /api/current-jobs
export async function fetchCurrentJobs(): Promise<CurrentJob[]> {
  try {
    const res = await fetch(`${BASE_URL}/api/current-jobs`);
    if (!res.ok) return [];
    return (await res.json()) as CurrentJobRaw[];
  } catch {
    return [];
  }
}

// 根据当前职业 id 取转型建议：GET /api/current-jobs/{currentJobId}
export async function fetchRecommendations(
  currentJobId: string,
): Promise<CareerRecommendation[]> {
  try {
    const res = await fetch(`${BASE_URL}/api/current-jobs/${currentJobId}`);
    if (!res.ok) return []; // 404（职业不存在）也走到这里
    const data = (await res.json()) as CurrentJobRaw;
    return data.recommendations;
  } catch {
    return [];
  }
}

// 按目标职业 id 取完整学习路径（学习步骤页用）：GET /api/career-paths/{careerId}
export async function fetchCareerPath(careerId: string): Promise<CareerPath | undefined> {
  try {
    const res = await fetch(`${BASE_URL}/api/career-paths/${careerId}`);
    if (!res.ok) return undefined; // 404（路径不存在）也走到这里
    return (await res.json()) as CareerPath;
  } catch {
    return undefined;
  }
}

// 获取所有目标职业路径（转型页用来把推荐的 targetId 补全为标题/图标/主题色）：GET /api/career-paths
export async function fetchCareerPaths(): Promise<CareerPath[]> {
  try {
    const res = await fetch(`${BASE_URL}/api/career-paths`);
    if (!res.ok) return [];
    return (await res.json()) as CareerPath[];
  } catch {
    return [];
  }
}
