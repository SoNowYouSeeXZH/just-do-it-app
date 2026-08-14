// chat.ts —— 流式对话（打字机效果）封装
//
// 为什么要单独一个文件：
// 流式对话和普通请求不一样，它是「服务器一点一点把内容推过来」（SSE 协议），
// 需要专门的库来接收。这里用 react-native-sse。
//
// 为什么不用浏览器那套 fetch + response.body.getReader()：
// React Native 的 fetch 不支持读取流式响应体（没有 getReader），
// 所以必须借助 react-native-sse 这个库来处理 SSE。
//
// 后端约定（POST /api/chat, body {message, stream:true}）：
//   - 会连续推送若干条：data: {"delta":"..."}   ← 每条是一小段文字
//   - 最后推送一条：    data: [DONE]             ← 表示结束

import EventSource from 'react-native-sse';
import { BASE_URL } from './client';

// 回调参数：
// - onDelta：每收到一小段文字就回调一次（把它拼接到界面上）
// - onDone：全部结束时回调
// - onError：出错时回调
// 返回值：一个「取消函数」，调用它可以中途关闭连接（比如用户关掉了对话框）
export function streamChat(
  message: string,
  handlers: {
    onDelta: (delta: string) => void;
    onDone: () => void;
    onError?: (err: unknown) => void;
  },
): () => void {
  const es = new EventSource(`${BASE_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, stream: true }),
    // 不做心跳超时判断，避免长回答时被误判断开
    pollingInterval: 0,
  });
  let settled = false;
  let cancelled = false;

  // 监听服务器推送的每一条消息
  es.addEventListener('message', (event) => {
    const raw = event.data;
    if (raw == null) return;

    // 收到结束标记就收尾
    if (raw.trim() === '[DONE]') {
      settled = true;
      handlers.onDone();
      es.close();
      return;
    }

    // 正常情况：raw 是一段 JSON，形如 {"delta":"你"}
    try {
      const parsed = JSON.parse(raw) as { delta?: string; error?: string };
      if (parsed.error) {
        settled = true;
        handlers.onError?.(new Error(parsed.error));
        es.close();
        return;
      }
      if (parsed.delta) handlers.onDelta(parsed.delta);
    } catch {
      settled = true;
      handlers.onError?.(new Error('收到无法解析的流式数据'));
      es.close();
    }
  });

  // 连接或传输出错
  es.addEventListener('error', (event) => {
    if (settled || cancelled) return;
    settled = true;
    handlers.onError?.(event);
    es.close();
  });

  // 服务端异常关闭且没有发送 [DONE] 时，不能让调用方永久等待。
  es.addEventListener('close', () => {
    if (settled || cancelled) return;
    settled = true;
    handlers.onError?.(new Error('流式连接意外关闭'));
  });

  // 把「关闭连接」的能力交回给调用方
  return () => {
    cancelled = true;
    settled = true;
    es.close();
  };
}
