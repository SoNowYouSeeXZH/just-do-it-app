// client.ts —— 后端接口的统一入口（网络层封装）
//
// 为什么要有这个文件：
// 把「后端地址」集中在一处。页面代码通过 BASE_URL 拼接请求，
// 换环境（本地开发 / 局域网 / 上线域名）只需改环境变量，代码不用动。

// Expo 会在打包时把 EXPO_PUBLIC_ 前缀的变量替换成字面量。
// 项目没装 @types/node，这里只声明本文件用到的那一个字段。
declare const process: { env: { EXPO_PUBLIC_API_URL?: string } };

// 后端基础地址（baseURL）
// 配置方式：项目根目录 .env 文件中设置 EXPO_PUBLIC_API_URL=https://your-domain
// 未配置时回退到本地开发地址；生产环境建议使用 HTTPS 域名。
export const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? 'http://127.0.0.1:8000';
