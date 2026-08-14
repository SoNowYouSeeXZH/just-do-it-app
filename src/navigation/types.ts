// types.ts —— 导航路由的类型定义
//
// 为什么要有这个文件：
// React Navigation 用 TypeScript 时，需要声明「有哪些页面、每个页面能接收什么参数」。
// 有了这些类型，navigation.navigate('xxx', {...}) 时会有自动补全和类型检查，
// 传错参数会在编译期就报错，而不是运行时才崩。

// 底部 Tab 里的几个主页面（都不需要参数，所以是 undefined）
export type TabParamList = {
  Home: undefined; // 学习路径首页（多邻国式地图）
  Industry: undefined; // 行业知识库
  CareerMatch: undefined; // 转型职业推荐
  Game: undefined; // 成语小游戏（原有功能）
};

// 最外层的堆栈导航（Tab 是其中一个页面，其它页面会盖在 Tab 上层）
export type RootStackParamList = {
  Tabs: undefined; // 底部 Tab 容器
  // 答题页：进入某个职业的一节面试题课程，只需传职业 id
  Quiz: { jobId: string };
  // 答题结算页：展示本节成绩，同样带上 jobId 便于「再来一次」
  QuizResult: { jobId: string };
  // 行业详情页：从「行业知识库」列表点进来，带行业 id
  IndustryDetail: { industryId: string };
  // 学习步骤详情页：从「转型推荐」或「首页」点某个职业进来，
  // 需要知道是哪个职业(careerId)以及标题(title)用于顶部展示
  LearningPath: { careerId: string; title: string };
};
