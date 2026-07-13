# 成语 Wordle 国风雅致 UIUX 设计

## 需求场景与处理逻辑
用户已选择国风雅致方向，对现有成语 Wordle app 做 UIUX 升级。目标是在不改变核心玩法和状态逻辑的前提下，提升视觉辨识度、文化主题感、移动端可用性和分享结果质感。

## 架构与技术方案
本次改造仅涉及 React Native 前端样式与布局，不新增导航、不引入新的重型 UI 库、不改变游戏状态机规则。

技术策略：
1. 新增共享主题文件，集中维护国风色彩、圆角、阴影和间距。
2. 主页面从纯深色 Wordle 风格升级为深色水墨背景、金色操作、温润卡片结构。
3. 棋盘字格保留 Wordle 三态反馈，但使用更适合国风主题的颜色和边框。
4. 输入区改为更明确的成语输入卡片，保留当前受控 TextInput，避免再次引入中文输入法卡死问题。
5. 结果弹层改为成绩笺样式，突出答案、统计和分享。

## 受影响文件

### 新增
- `/Users/baidu/Desktop/personal/react-native-music/src/theme/guofeng.ts`
  - 新增国风 UI 主题常量。

### 修改
- `/Users/baidu/Desktop/personal/react-native-music/src/screens/GameScreen.tsx`
  - 修改主页面背景、顶部标题、统计区、规则提示、内容布局。
- `/Users/baidu/Desktop/personal/react-native-music/src/components/Tile.tsx`
  - 修改字格尺寸、圆角、边框、三态颜色和文字样式。
- `/Users/baidu/Desktop/personal/react-native-music/src/components/GuessGrid.tsx`
  - 优化棋盘间距和响应式布局。
- `/Users/baidu/Desktop/personal/react-native-music/src/components/ChineseKeyboard.tsx`
  - 修改输入框和提交按钮风格，保持受控输入逻辑。
- `/Users/baidu/Desktop/personal/react-native-music/src/components/ResultModal.tsx`
  - 修改结果弹层视觉，增加国风成绩卡质感。

## 实现细节

### 主题常量示例
```ts
export const guofengTheme = {
  colors: {
    background: '#100d09',
    surface: '#1b140d',
    surfaceElevated: '#241a10',
    gold: '#d7a657',
    goldMuted: '#8d6b36',
    text: '#f7ead5',
    textMuted: '#b49a78',
    correct: '#6f8f50',
    present: '#b78939',
    absent: '#3b3023',
  },
};
```

### 主页面数据流
`GameScreen` 读取 `useGameStore` 中的当前输入、猜测记录、胜率统计和提交行为，向 `GuessGrid`、`ChineseKeyboard`、`ResultModal` 分发状态。UI 改造不改变数据流。

### 输入链路
`ChineseKeyboard` 继续使用受控 `TextInput`，`onChangeText` 过滤汉字并限制 4 个字符。不得恢复隐藏输入框或 `setNativeProps({ text: '' })` 方案。

## 边界条件与异常处理
1. 小屏手机上 6 行棋盘不能遮挡输入区。
2. 键盘弹出时输入区可点击，提交按钮状态清晰。
3. 长文案不能溢出统计卡、按钮或结果弹层。
4. 游戏结束弹层不能挡住系统安全区域。
5. 颜色反馈需保持可读，绿色、黄色、灰色之间区分明确。

## 预期结果
1. App 进入后第一屏有明确国风主题和游戏目标。
2. 棋盘、输入、统计和结果弹层视觉统一。
3. 操作路径保持简单，输入和提交不会新增交互风险。
4. TypeScript 检查通过，Android Expo 导出打包通过。
