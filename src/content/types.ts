// content/types.ts —— 行业知识库 & 转型推荐 的数据结构定义
//
// 集中定义 Phase 2（行业知识库）和 Phase 3（转型推荐 + 学习步骤）用到的类型。
// 和 quiz/types.ts 分开放：quiz 是答题玩法，这里是内容/路径。

// 外部资料链接（点击用系统浏览器打开）
export interface ResourceLink {
  label: string; // 展示文案
  url: string; // 跳转地址
}

// 一个行业（知识库列表里的一项）
export interface Industry {
  id: string;
  name: string; // 行业名，如「互联网/软件」
  emoji: string; // 图标（先用 emoji 避免美术依赖）
  accent: string; // 主题色
  summary: string; // 一句话简介（列表卡片用）
  overview: string; // 详情页概述段落
  keyPoints: string[]; // 该行业关键知识点/岗位认知
  links: ResourceLink[]; // 相关外部学习资料
}

// 学习路径里的一个步骤
export interface LearningStep {
  id: string;
  title: string; // 步骤标题
  desc: string; // 步骤说明
  quizJobId?: string; // 若可用答题巩固，指向后端 /api/jobs 返回的职业 id
  links?: ResourceLink[]; // 该步骤的参考资料
}

// 一条可转型的目标职业（含完整学习步骤）
export interface CareerPath {
  id: string; // 目标职业 id（LearningPath 路由用它取路径）
  title: string; // 职业名
  emoji: string;
  accent: string;
  summary: string; // 一句话定位
  steps: LearningStep[]; // 分步学习路径
}

// 针对「当前职业」给出的一条转型建议
export interface CareerRecommendation {
  targetId: string; // 指向某个 CareerPath.id
  reason: string; // 为什么推荐（迁移优势）
  difficulty: '较易' | '中等' | '较难'; // 转型难度
}

// 用户可选择的「当前职业」，每个附带若干转型建议
export interface CurrentJob {
  id: string;
  title: string;
  emoji: string;
  recommendations: CareerRecommendation[];
}
