const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// 排除 worktree 目录，避免 Metro 扫到重复的 package.json
config.watchFolders = (config.watchFolders || []).filter(
  (folder) => !folder.includes('.worktrees')
);

config.resolver.blockList = [
  new RegExp(path.join(__dirname, '.worktrees').replace(/\\/g, '\\\\') + '/.*'),
  ...(config.resolver.blockList ? [config.resolver.blockList].flat() : []),
];

// 修复 Web 端白屏："Cannot use 'import.meta' outside a module"
// 原因：Metro 默认按 package.json 的 exports.import 条件解析依赖（如 zustand），
// 拿到的是 ESM 版本（.mjs），里面用了 import.meta.env，但 Metro Web 打包目前
// 不支持这个语法，编译期就报语法错误，导致整个 bundle 加载失败（纯白屏，没有 RedBox）。
// 把 condition 顺序改成优先 require/react-native，让 Metro 选 CommonJS 版本即可绕开。
config.resolver.unstable_conditionNames = ['browser', 'require', 'react-native'];

module.exports = config;
