// App.tsx —— 应用入口
//
// 职责：把「导航容器」和几个必需的全局 Provider 包起来。
// - react-native-gesture-handler：必须在最顶部第一行 import，
//   否则手势（滑动返回等）在原生端可能失效。
// - GestureHandlerRootView：手势系统的根容器，需要包住整个 App。
// - SafeAreaProvider：处理刘海屏/状态栏安全区域。

import 'react-native-gesture-handler';
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import RootNavigator from '@/navigation/RootNavigator';
import { GlobalChatButton } from '@/components/GlobalChatButton';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        {/* 亮色主题，状态栏文字用深色 */}
        <StatusBar style="dark" />
        <RootNavigator />
        {/* 全局 AI 助手入口，覆盖所有页面（渲染在导航器之后，位于最上层） */}
        <GlobalChatButton />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
