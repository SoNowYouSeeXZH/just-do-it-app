import React, { useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Send, Square, X } from 'lucide-react-native';
import Markdown from 'react-native-markdown-display';

import { streamChat } from '@/api/chat';
import { tokens } from '@/theme/tokens';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  failed?: boolean;
  stopped?: boolean;
};

type ChatPanelProps = {
  onClose: () => void;
};

const WELCOME_MESSAGE: Message = {
  id: 'welcome',
  role: 'assistant',
  content: '你好！学习过程中遇到什么问题，都可以问我。',
};

function buildPrompt(messages: Message[]) {
  const transcript = messages
    .filter((message) => message.id !== 'welcome' && !message.failed && message.content.trim())
    .map((message) => `${message.role === 'user' ? '用户' : '助手'}：${message.content}`)
    .join('\n');

  return `以下是当前对话。请结合上下文，用中文简洁、准确地回答最后一个用户问题。\n\n${transcript}`;
}

export function ChatPanel({ onClose }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [lastFailedMessage, setLastFailedMessage] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const cancelStreamRef = useRef<(() => void) | null>(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    return () => {
      requestIdRef.current += 1;
      cancelStreamRef.current?.();
    };
  }, []);

  const scrollToBottom = () => {
    requestAnimationFrame(() => scrollViewRef.current?.scrollToEnd({ animated: true }));
  };

  const startStream = (nextMessages: Message[], userMessage: string) => {
    const assistantMessage: Message = {
      id: `assistant-${Date.now()}`,
      role: 'assistant',
      content: '',
    };
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    setMessages([...nextMessages, assistantMessage]);
    setIsStreaming(true);
    setLastFailedMessage(null);
    scrollToBottom();

    cancelStreamRef.current = streamChat(buildPrompt(nextMessages), {
      onDelta: (delta) => {
        if (requestId !== requestIdRef.current) return;
        setMessages((currentMessages) =>
          currentMessages.map((message) =>
            message.id === assistantMessage.id
              ? { ...message, content: `${message.content}${delta}` }
              : message,
          ),
        );
        scrollToBottom();
      },
      onDone: () => {
        if (requestId !== requestIdRef.current) return;
        cancelStreamRef.current = null;
        setIsStreaming(false);
      },
      onError: () => {
        if (requestId !== requestIdRef.current) return;
        cancelStreamRef.current = null;
        setIsStreaming(false);
        setLastFailedMessage(userMessage);
        setMessages((currentMessages) =>
          currentMessages.map((message) =>
            message.id === assistantMessage.id
              ? { ...message, content: '回复暂时中断，请重试。', failed: true }
              : message,
          ),
        );
      },
    });
  };

  const sendMessage = () => {
    const content = input.trim();
    if (!content || isStreaming) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
    };
    setInput('');
    startStream([...messages, userMessage], content);
  };

  const retry = () => {
    if (!lastFailedMessage || isStreaming) return;
    const nextMessages = messages.filter((message) => !message.failed);
    startStream(nextMessages, lastFailedMessage);
  };

  const stopStream = () => {
    if (!isStreaming) return;
    requestIdRef.current += 1;
    cancelStreamRef.current?.();
    cancelStreamRef.current = null;
    setIsStreaming(false);
    setMessages((currentMessages) =>
      currentMessages.map((message) =>
        message.role === 'assistant' && !message.failed && !message.content
          ? { ...message, content: '已停止生成。', stopped: true }
          : message,
      ),
    );
  };

  return (
    <View style={styles.overlay}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.panel}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>AI 学习助手</Text>
              <Text style={styles.subtitle}>当前打开期间会记住上下文</Text>
            </View>
            <Pressable
              accessibilityLabel="关闭 AI 学习助手"
              hitSlop={10}
              onPress={onClose}
              style={styles.closeButton}
            >
              <X color={tokens.colors.textMuted} size={22} />
            </Pressable>
          </View>

          <ScrollView
            ref={scrollViewRef}
            contentContainerStyle={styles.messageList}
            keyboardShouldPersistTaps="handled"
            onContentSizeChange={scrollToBottom}
          >
            {messages.map((message) => (
              <View
                key={message.id}
                style={[
                  styles.messageBubble,
                  message.role === 'user' ? styles.userBubble : styles.assistantBubble,
                  message.failed && styles.failedBubble,
                ]}
              >
                {message.role === 'user' ? (
                  <Text style={[styles.messageText, styles.userMessageText]}>{message.content}</Text>
                ) : (
                  <Markdown style={markdownStyles}>
                    {message.content || (message.stopped ? '已停止生成。' : '正在思考…')}
                  </Markdown>
                )}
              </View>
            ))}
            {lastFailedMessage && !isStreaming ? (
              <Pressable onPress={retry} style={styles.retryButton}>
                <Text style={styles.retryText}>重新发送</Text>
              </Pressable>
            ) : null}
          </ScrollView>

          <View style={styles.composer}>
            <TextInput
              value={input}
              onChangeText={setInput}
              editable={!isStreaming}
              multiline
              maxLength={1000}
              placeholder="输入你的学习问题…"
              placeholderTextColor={tokens.colors.textDim}
              style={styles.input}
            />
            <Pressable
              accessibilityLabel={isStreaming ? '停止生成' : '发送消息'}
              onPress={isStreaming ? stopStream : sendMessage}
              disabled={!isStreaming && !input.trim()}
              style={[
                styles.sendButton,
                !isStreaming && !input.trim() && styles.sendButtonDisabled,
                isStreaming && styles.stopButton,
              ]}
            >
              {isStreaming ? (
                <Square color={tokens.colors.onPrimary} fill={tokens.colors.onPrimary} size={17} />
              ) : (
                <Send color={tokens.colors.onPrimary} size={19} />
              )}
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(31, 42, 36, 0.22)',
  },
  keyboardAvoidingView: { width: '100%' },
  panel: {
    height: '76%',
    minHeight: 440,
    maxHeight: 680,
    marginHorizontal: tokens.spacing.md,
    marginBottom: tokens.spacing.md,
    backgroundColor: tokens.colors.background,
    borderRadius: tokens.radius.xl,
    overflow: 'hidden',
    shadowColor: tokens.shadow.color,
    shadowOpacity: tokens.shadow.opacity,
    shadowRadius: tokens.shadow.radius,
    shadowOffset: tokens.shadow.offset,
    elevation: tokens.shadow.elevation,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: tokens.spacing.xl,
    paddingVertical: tokens.spacing.lg,
    backgroundColor: tokens.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.border,
  },
  title: { color: tokens.colors.text, fontSize: tokens.fontSize.lg, fontWeight: '800' },
  subtitle: { marginTop: 2, color: tokens.colors.textMuted, fontSize: tokens.fontSize.xs },
  closeButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: tokens.radius.pill,
    backgroundColor: tokens.colors.surfaceSoft,
  },
  messageList: { gap: tokens.spacing.md, padding: tokens.spacing.lg, paddingBottom: tokens.spacing.xl },
  messageBubble: { maxWidth: '86%', borderRadius: tokens.radius.md, padding: tokens.spacing.md },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: tokens.colors.primary,
    borderBottomRightRadius: tokens.radius.xs,
  },
  assistantBubble: {
    alignSelf: 'flex-start',
    backgroundColor: tokens.colors.surface,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    borderBottomLeftRadius: tokens.radius.xs,
  },
  failedBubble: { borderColor: tokens.colors.danger, backgroundColor: '#fff1f1' },
  messageText: { fontSize: tokens.fontSize.sm, lineHeight: 21 },
  userMessageText: { color: tokens.colors.onPrimary },
  assistantMessageText: { color: tokens.colors.text },
  retryButton: {
    alignSelf: 'flex-start',
    borderRadius: tokens.radius.pill,
    backgroundColor: tokens.colors.primarySoft,
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.sm,
  },
  retryText: { color: tokens.colors.primaryDark, fontSize: tokens.fontSize.sm, fontWeight: '700' },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: tokens.spacing.sm,
    paddingHorizontal: tokens.spacing.lg,
    paddingTop: tokens.spacing.md,
    paddingBottom: tokens.spacing.lg,
    backgroundColor: tokens.colors.surface,
    borderTopWidth: 1,
    borderTopColor: tokens.colors.border,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 108,
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: 10,
    color: tokens.colors.text,
    fontSize: tokens.fontSize.sm,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: tokens.colors.border,
    borderRadius: tokens.radius.md,
    backgroundColor: tokens.colors.background,
  },
  sendButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: tokens.radius.pill,
    backgroundColor: tokens.colors.primary,
  },
  sendButtonDisabled: { opacity: 0.4 },
  stopButton: { backgroundColor: tokens.colors.danger },
});

const markdownStyles = StyleSheet.create({
  body: {
    margin: 0,
    color: tokens.colors.text,
    fontSize: tokens.fontSize.sm,
    lineHeight: 21,
  },
  paragraph: { marginTop: 0, marginBottom: tokens.spacing.sm },
  heading1: {
    marginTop: tokens.spacing.xs,
    marginBottom: tokens.spacing.sm,
    color: tokens.colors.text,
    fontSize: tokens.fontSize.lg,
    fontWeight: '800',
  },
  heading2: {
    marginTop: tokens.spacing.xs,
    marginBottom: tokens.spacing.xs,
    color: tokens.colors.text,
    fontSize: tokens.fontSize.md,
    fontWeight: '800',
  },
  heading3: {
    marginTop: tokens.spacing.xs,
    marginBottom: tokens.spacing.xs,
    color: tokens.colors.text,
    fontSize: tokens.fontSize.sm,
    fontWeight: '800',
  },
  strong: { fontWeight: '800', color: tokens.colors.text },
  em: { fontStyle: 'italic' },
  bullet_list: { marginTop: 0, marginBottom: tokens.spacing.sm },
  ordered_list: { marginTop: 0, marginBottom: tokens.spacing.sm },
  list_item: { marginBottom: tokens.spacing.xs },
  code_inline: {
    color: tokens.colors.primaryDark,
    backgroundColor: tokens.colors.primarySoft,
    borderRadius: tokens.radius.xs,
    paddingHorizontal: 4,
  },
  code_block: {
    marginVertical: tokens.spacing.sm,
    padding: tokens.spacing.md,
    color: tokens.colors.onPrimary,
    backgroundColor: tokens.colors.text,
    borderRadius: tokens.radius.xs,
    fontSize: tokens.fontSize.xs,
  },
  fence: {
    marginVertical: tokens.spacing.sm,
    padding: tokens.spacing.md,
    color: tokens.colors.onPrimary,
    backgroundColor: tokens.colors.text,
    borderRadius: tokens.radius.xs,
    fontSize: tokens.fontSize.xs,
  },
  link: { color: tokens.colors.primaryDark, textDecorationLine: 'underline' },
});
