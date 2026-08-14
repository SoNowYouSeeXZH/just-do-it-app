// tokens.ts —— 全局亮色设计系统（Design Tokens）
//
// 为什么要有这个文件：
// 整个 App 的颜色、圆角、间距、阴影、字号都集中在这里定义，
// 各个页面只引用这里的变量，而不是到处写死颜色值。
// 好处：想统一换配色/风格时，只改这一个文件即可，不用翻遍所有组件。
//
// 风格定位：参照「多邻国(Duolingo)」明亮、活泼、友好的调性，
// 但配色是手工挑选的一套暖调绿色系，避免通用 AI 生成那种廉价感。
// 注意：原来的国风暗色主题 guofeng.ts 仍然保留，只给「成语游戏」模块单独使用。

export const tokens = {
  colors: {
    // 品牌主色：友好的草绿色，用于主要按钮、进度、选中态
    primary: '#3fb950',
    primaryDark: '#2f9440', // 主色的深一档，用于按下态/描边
    primarySoft: '#e6f7ea', // 主色的极浅背景，用于选中卡片底色

    // 辅助强调色：暖橙，用于奖励、火苗连胜、点睛点缀
    accent: '#ff9f43',
    accentSoft: '#fff1e0',

    // 背景层级：从最底到最上，营造轻微的层次感
    background: '#f7f9f5', // 页面最底色，带一点点绿灰，不刺眼
    surface: '#ffffff', // 卡片/面板底色
    surfaceSoft: '#eef2ea', // 次级面板、分隔区块

    // 边框
    border: '#dfe5da',
    borderStrong: '#c7d0bf',

    // 文字：主/次/更淡三档，保证可读性对比度
    text: '#1f2a24',
    textMuted: '#5c6b60',
    textDim: '#9aa79c',

    // 语义色
    success: '#3fb950',
    warning: '#f2b01e',
    danger: '#e5484d',
    info: '#3b82f6',

    // 反色文字（放在主色/深色背景上的文字）
    onPrimary: '#ffffff',
  },

  // 圆角：数值越大越圆润，多邻国风格偏圆润
  radius: {
    xs: 8,
    sm: 12,
    md: 16,
    lg: 20,
    xl: 28,
    pill: 999, // 胶囊形（圆角按钮/标签）
  },

  // 间距：统一的 4 的倍数体系，排版更整齐
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
  },

  // 字号
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 20,
    xl: 26,
    xxl: 34,
  },

  // 阴影：iOS 用 shadow* 字段，Android 用 elevation
  shadow: {
    color: '#1f2a24',
    opacity: 0.08,
    radius: 12,
    offset: { width: 0, height: 6 },
    elevation: 3,
  },
} as const;

// 导出一个类型，方便在组件里做类型提示
export type Tokens = typeof tokens;
