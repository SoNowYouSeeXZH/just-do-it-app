# 成语 Wordle 国风雅致 UIUX 改造总结

## 完成内容
1. 新增 `src/theme/guofeng.ts`，集中管理国风配色、圆角、间距和阴影。
2. 重构 `GameScreen`，新增每日成语局标题、副标题、局数标签、国风统计卡、规则说明卡。
3. 优化 `GuessGrid` 和 `Tile`，将棋盘升级为温润深色字格，反馈色改为国风绿色、金色和墨色。
4. 优化 `ChineseKeyboard`，保留稳定的受控中文输入逻辑，同时升级输入面板和提交按钮视觉。
5. 优化 `ResultModal`，改造成绩笺风格，突出谜底成语、统计数据、emoji 路径和操作按钮。

## 验证结果
- `npx tsc --noEmit` 通过。
- `npx expo export --platform android --output-dir /tmp/react-native-music-export` 通过。

## 关键约束
- 没有改变游戏状态机规则。
- 没有恢复隐藏 TextInput，避免中文输入法卡死问题复现。
- 没有新增重型 UI 依赖。
