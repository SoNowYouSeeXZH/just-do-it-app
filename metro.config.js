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

module.exports = config;
