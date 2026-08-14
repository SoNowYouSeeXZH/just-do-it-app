// GlobalChatButton.tsx —— 全局 AI 助手入口（右下角悬浮按钮）
//
// 挂在 App 层，覆盖所有页面：右下角一个「问问 AI」悬浮按钮，
// 点击弹出 ChatPanel 对话面板。
//
// 由 LearningPathScreen 页面内入口全局化而来：原页面内的按钮 + ChatPanel
// 整体搬到 App 层，页面不再各自维护入口。对话状态在组件内，每次打开都是新对话。

import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MessageCircle } from 'lucide-react-native';

import { ChatPanel } from '@/components/ChatPanel';
import { tokens } from '@/theme/tokens';

export function GlobalChatButton() {
  // 页面内按钮原来用「当前路径的主题色」，全局化后没有路径概念，
  // 统一用全局主题色 primary。
  const insets = useSafeAreaInsets();
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <>
      <Pressable
        accessibilityLabel="打开 AI 学习助手"
        onPress={() => setIsChatOpen(true)}
        style={[styles.chatButton, { bottom: tokens.spacing.lg + insets.bottom }]}
      >
        <View style={styles.chatIcon}>
          <MessageCircle color={tokens.colors.onPrimary} size={18} />
        </View>
        <Text style={styles.chatButtonText}>问问 AI</Text>
      </Pressable>

      {isChatOpen ? <ChatPanel onClose={() => setIsChatOpen(false)} /> : null}
    </>
  );
}

const styles = StyleSheet.create({
  chatButton: {
    position: 'absolute',
    right: tokens.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.sm,
    paddingRight: tokens.spacing.lg,
    paddingLeft: tokens.spacing.sm,
    height: 52,
    borderRadius: tokens.radius.pill,
    backgroundColor: tokens.colors.text,
    shadowColor: tokens.shadow.color,
    shadowOpacity: tokens.shadow.opacity,
    shadowRadius: tokens.shadow.radius,
    shadowOffset: tokens.shadow.offset,
    elevation: tokens.shadow.elevation,
  },
  chatIcon: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: tokens.radius.pill,
    backgroundColor: tokens.colors.primary,
  },
  chatButtonText: { color: tokens.colors.onPrimary, fontSize: tokens.fontSize.sm, fontWeight: '800' },
});
