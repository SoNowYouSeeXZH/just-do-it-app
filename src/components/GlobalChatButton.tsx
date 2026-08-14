// GlobalChatButton.tsx —— 全局 AI 助手入口（右下角悬浮按钮）
//
// 挂在 App 层，覆盖所有页面：右下角一个「问问 AI」悬浮按钮，
// 点击弹出 ChatPanel 对话面板。
//
// 由 LearningPathScreen 页面内入口全局化而来：原页面内的按钮 + ChatPanel
// 整体搬到 App 层，页面不再各自维护入口。对话状态在组件内，每次打开都是新对话。

import React, { useMemo, useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MessageCircle } from 'lucide-react-native';

import { ChatPanel } from '@/components/ChatPanel';
import { tokens } from '@/theme/tokens';

export function GlobalChatButton() {
  // 页面内按钮原来用「当前路径的主题色」，全局化后没有路径概念，
  // 统一用全局主题色 primary。
  const insets = useSafeAreaInsets();
  const { height: windowHeight, width: windowWidth } = useWindowDimensions();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [buttonSize, setButtonSize] = useState({ width: 132, height: 52 });
  const [isLayoutReady, setIsLayoutReady] = useState(false);
  const hasInitializedPosition = useRef(false);
  const positionX = useSharedValue(0);
  const positionY = useSharedValue(0);
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);

  const openChat = () => setIsChatOpen(true);
  const clamp = (value: number, min: number, max: number) => {
    'worklet';
    return Math.min(Math.max(value, min), max);
  };

  const gesture = useMemo(() => {
    const panGesture = Gesture.Pan()
      .minDistance(4)
      .onStart(() => {
        startX.value = positionX.value;
        startY.value = positionY.value;
      })
      .onUpdate((event) => {
        positionX.value = clamp(
          startX.value + event.translationX,
          0,
          Math.max(0, windowWidth - buttonSize.width),
        );
        positionY.value = clamp(
          startY.value + event.translationY,
          0,
          Math.max(0, windowHeight - insets.bottom - buttonSize.height),
        );
      });

    const tapGesture = Gesture.Tap()
      .maxDuration(300)
      .onEnd((_event, success) => {
        if (success) runOnJS(openChat)();
      });

    return Gesture.Exclusive(panGesture, tapGesture);
  }, [
    buttonSize.height,
    buttonSize.width,
    insets.bottom,
    openChat,
    positionX,
    positionY,
    startX,
    startY,
    windowHeight,
    windowWidth,
  ]);

  const animatedPosition = useAnimatedStyle(() => ({
    left: positionX.value,
    top: positionY.value,
    opacity: isLayoutReady ? 1 : 0,
  }));

  return (
    <>
      <GestureDetector gesture={gesture}>
        <Animated.View
        accessible
        accessibilityRole="button"
        accessibilityLabel="打开 AI 学习助手"
        onAccessibilityTap={() => setIsChatOpen(true)}
        onLayout={(event) => {
          const { height, width } = event.nativeEvent.layout;
          setButtonSize({ height, width });
          if (!hasInitializedPosition.current) {
            const initialPosition = {
              x: Math.max(0, windowWidth - tokens.spacing.lg - width),
              y: Math.max(0, windowHeight - insets.bottom - tokens.spacing.lg - height),
            };
            positionX.value = initialPosition.x;
            positionY.value = initialPosition.y;
            hasInitializedPosition.current = true;
            setIsLayoutReady(true);
          }
        }}
          style={[styles.chatButton, animatedPosition]}
        >
          <View style={styles.chatContent}>
            <View style={styles.chatIcon}>
              <MessageCircle color={tokens.colors.onPrimary} size={18} />
            </View>
            <Text style={styles.chatButtonText}>问问 AI</Text>
          </View>
        </Animated.View>
      </GestureDetector>

      {isChatOpen ? <ChatPanel onClose={() => setIsChatOpen(false)} /> : null}
    </>
  );
}

const styles = StyleSheet.create({
  chatButton: {
    position: 'absolute',
  },
  chatContent: {
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
