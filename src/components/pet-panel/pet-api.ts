/**
 * 宠物养成业务后端 API 封装（对应《外部积分养宠物-接口文档.md》）。
 *
 * - 使用同源接口路径，开发环境由 devServer 代理到 Django，生产由 Nginx 转发，
 *   浏览器始终同源（技术方案 §11.1）。
 * - 写请求读取当前 CSRF Cookie；登录轮换令牌后也能继续领养和喂养。
 * - 后端金额为十进制字符串，此处不做数值转换。
 * - 桌宠通过物种列表和更换接口选择形象；
 *   后端仍保留流水/任务/改名等接口（见接口文档）。
 */

export interface ApiUser {
  id: number;
  username: string;
  firstName: string;
  isStaff: boolean;
}

export interface ViewerIdentity {
  appId: string;
  channelId: string;
  viewerId: string;
}

export interface PetInfo {
  id: number;
  name: string;
  species: string;
  exp: number;
  satiety: number;
  adoptedAt: string;
  stage: 'egg' | 'juvenile' | 'adult';
  stageName: string;
  nextStage: string | null;
  nextStageExp: number | null;
  stageProgress: number | null;
}

export interface FoodInfo {
  id: string;
  code: string;
  name: string;
  /** 管理后台配置的食物图片绝对地址；未配置时为 null。 */
  imageUrl?: string | null;
  /** 同一图片相对应用根路径的地址，供代理或静态前缀场景解析。 */
  imagePath?: string | null;
  pointCost: string;
  expGain: number;
  satietyGain: number;
}

export interface PetSpecies {
  code: string;
  name: string;
}

export interface MeState {
  user: ApiUser;
  points: { balance: string };
  pet: PetInfo | null;
  autoAdopt?: boolean;
}

export interface FeedResult {
  actionId: string;
  balance: string;
  pet: PetInfo;
  expGain: number;
  satietyGain: number;
  evolved: boolean;
  idempotent?: boolean;
}

export interface CommentRewardState {
  enabled: boolean;
  configurationReady: boolean;
  rewardPoints: string;
  dailyLimit: string;
  dailyEarned: string;
  cooldownSeconds: number;
  nextRewardAt: string;
  serverTime: string;
  eventId: number | null;
  status: string | null;
  reason: string;
  rewardedPoints: string;
  replayed?: boolean;
}

/** SDK 已收到的本人文字评论；账户和频道仍由后端观看会话确定。 */
export interface CommentReceipt {
  messageId: string;
  content: string;
  messageTime: number;
}

export class ApiError extends Error {
  code: number;
  data: unknown;

  constructor(message: string, code: number, data: unknown) {
    super(message);
    this.code = code;
    this.data = data;
  }
}

const apiBase = process.env.VUE_APP_PET_API_BASE || '/api';
const csrfCookieName = process.env.VUE_APP_PET_CSRF_COOKIE || 'csrftoken';

function getCookie(name: string): string {
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : '';
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };
  if (options.method && options.method.toUpperCase() !== 'GET') {
    headers['X-CSRFToken'] = getCookie(csrfCookieName);
  }
  const resp = await fetch(`${apiBase}${path}`, {
    ...options,
    headers,
    credentials: 'same-origin',
  });
  let body: { code?: number; message?: string; data?: unknown } = {};
  try {
    body = await resp.json();
  } catch {
    throw new ApiError(`请求失败（HTTP ${resp.status}）`, -1, null);
  }
  if (!resp.ok || body.code !== 0) {
    throw new ApiError(
      body.message || `请求失败（HTTP ${resp.status}）`,
      body.code ?? -1,
      body.data ?? null,
    );
  }
  return body.data as T;
}

export const petApi = {
  session: () => request<{ authenticated: boolean; user: ApiUser | null }>('/auth/session'),

  /** 观看身份换业务会话（技术方案 §4.1）。 */
  authByViewer: (viewerId: string, channelId: string, nickname?: string) =>
    request<{ user: ApiUser; bound: boolean; identity: ViewerIdentity }>('/auth/polyv', {
      method: 'POST',
      body: JSON.stringify({ viewerId, channelId, nickname }),
    }),

  state: () => request<MeState>('/me/state'),

  adopt: (name?: string) =>
    request<{ adopted: boolean; pet: PetInfo }>('/me/pet/adopt', {
      method: 'POST',
      body: JSON.stringify(name ? { name } : {}),
    }),

  feed: (actionId: string, foodId: string, petId: number) =>
    request<FeedResult>('/me/pet/feed', {
      method: 'POST',
      body: JSON.stringify({ actionId, foodId, petId }),
    }),

  foods: () => request<{ foods: FoodInfo[] }>('/foods'),

  commentRewards: (eventId?: number) =>
    request<CommentRewardState>(
      eventId ? '/me/comment-rewards?eventId=' + eventId : '/me/comment-rewards',
    ),

  submitComment: (receipt: CommentReceipt) =>
    request<CommentRewardState>('/me/comment-rewards', {
      method: 'POST',
      body: JSON.stringify(receipt),
    }),

  species: () => request<{ species: PetSpecies[] }>('/pets/species'),

  switchSpecies: (species: string) =>
    request<{ pet: PetInfo }>('/me/pet/switch', {
      method: 'POST',
      body: JSON.stringify({ species }),
    }),
};
