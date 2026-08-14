// client.ts —— 后端接口的统一入口（网络层封装）
//
// 为什么要有这个文件：
// 把「后端地址」和「通用请求逻辑」集中在一处。
// 以后换地址（本地开发 / 局域网 / 上线域名）只改这里，页面代码不用动。

// 后端基础地址（baseURL）
// - 同机开发（模拟器/网页）可用 http://localhost:8000
// - 用真机（手机）调试时，手机和电脑要在同一个局域网，
//   必须用电脑的局域网 IP，docker-compose 映射的是 0.0.0.0:8000，局域网内可达。
// 目前先写死为局域网 IP，方便真机联调；上线后改成 https 域名。
export const BASE_URL = 'http://192.168.21.188:8000';

// 健康检查：确认后端是否活着
// 对应后端 GET /api/health，返回 {"status":"ok"}
export async function checkHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${BASE_URL}/api/health`);
    if (!res.ok) return false;
    const data = (await res.json()) as { status?: string };
    return data.status === 'ok';
  } catch {
    // 网络不通 / 后端没启动都会走到这里
    return false;
  }
}

// 一次性（非流式）对话：适合不需要打字机效果的场景
// 对应后端 POST /api/chat，请求体 {message, stream:false}，返回 {"reply":"..."}
export async function chatOnce(message: string): Promise<string> {
  const res = await fetch(`${BASE_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, stream: false }),
  });
  if (!res.ok) {
    throw new Error(`请求失败：HTTP ${res.status}`);
  }
  const data = (await res.json()) as { reply?: string };
  return data.reply ?? '';
}
