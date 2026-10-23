/** 本人 SPEAK 回执即时提交计分；网络失败时按观看身份保留原消息重试。 */
import { defineStore } from 'pinia';
import { CommentReceipt, CommentRewardState, petApi } from './pet-api';
import { usePetStore } from './use-pet-store';

interface PendingComment extends CommentReceipt {
  eventId?: number;
  createdAt: number;
}

export const useCommentRewardStore = defineStore('pet-comment-rewards', {
  state: () => ({
    summary: null as CommentRewardState | null,
    identityKey: '',
    pending: [] as PendingComment[],
    busy: false,
    clock: Date.now(),
    clockOffset: 0,
    lastRefresh: 0,
    retryAt: 0,
  }),
  getters: {
    hint(): string {
      const info = this.summary;
      if (!info?.enabled) return '';
      const progress = `今日 ${Number(info.dailyEarned)}/${Number(info.dailyLimit)}`;
      if (Number(info.dailyEarned) + Number(info.rewardPoints) > Number(info.dailyLimit)) {
        return `今日评论奖励已达上限 · ${progress}`;
      }
      const seconds = Math.max(
        0,
        Math.ceil((Date.parse(info.nextRewardAt) - this.clock - this.clockOffset) / 1000),
      );
      return seconds
        ? `${seconds}秒后评论可再得积分 · ${progress}`
        : `评论得${Number(info.rewardPoints)}积分 · 每${info.cooldownSeconds}秒一次 · ${progress}`;
    },
  },
  actions: {
    persist() {
      try {
        if (this.identityKey) localStorage.setItem(this.identityKey, JSON.stringify(this.pending));
      } catch {
        // 无存储权限时仍可在当前页面重试；后端以消息 ID 保证幂等。
      }
    },
    setIdentity(key: string) {
      if (this.identityKey === key) return;
      this.identityKey = key;
      this.summary = null;
      this.lastRefresh = 0;
      this.retryAt = 0;
      this.pending = [];
      if (!key) return;
      try {
        const saved: unknown = JSON.parse(localStorage.getItem(key) || '[]');
        if (Array.isArray(saved)) {
          this.pending = saved
            .filter(
              item =>
                item &&
                typeof item.messageId === 'string' &&
                typeof item.content === 'string' &&
                typeof item.messageTime === 'number' &&
                typeof item.createdAt === 'number' &&
                Date.now() - item.createdAt < 3600000,
            )
            .slice(-50);
        }
      } catch {
        // 损坏的本地缓存不影响正常发送评论。
      }
    },
    queue(receipt: CommentReceipt) {
      if (
        !this.identityKey ||
        this.summary?.enabled === false ||
        this.pending.some(item => item.messageId === receipt.messageId)
      )
        return;
      this.pending.push({ ...receipt, createdAt: Date.now() });
      this.pending = this.pending.slice(-50);
      this.persist();
    },
    /** 展示已确认的入账结果；历史重试只同步状态，避免重复播放到账提示。 */
    async receive(result: CommentRewardState, item?: PendingComment) {
      this.summary = result;
      this.clockOffset = Date.parse(result.serverTime) - Date.now();
      this.lastRefresh = Date.now();
      if (!item) return;
      item.eventId = result.eventId || undefined;
      if (result.status === 'pending') return;
      this.pending = this.pending.filter(value => value.messageId !== item.messageId);
      if (result.status === 'rewarded') {
        const pet = usePetStore();
        if (!result.replayed)
          pet.showToast(`评论奖励 +${Number(result.rewardedPoints)} 积分`, 'success');
        await pet.refreshAfterReward();
      }
    },
    /** 串行提交回执；服务端在同一请求中返回到账或不奖励原因。 */
    async tick() {
      this.clock = Date.now();
      if (!this.identityKey || this.busy || this.retryAt > this.clock) return;
      this.busy = true;
      const key = this.identityKey;
      try {
        const item = this.pending.shift();
        if (!item && Date.now() - this.lastRefresh < 30000) return;
        if (item) this.pending.push(item);
        const result = item
          ? await (item.eventId
              ? petApi.commentRewards(item.eventId)
              : petApi.submitComment({
                  messageId: item.messageId,
                  content: item.content,
                  messageTime: item.messageTime,
                }))
          : await petApi.commentRewards();
        if (key !== this.identityKey) return;
        await this.receive(result, item);
        this.persist();
      } catch {
        // 奖励服务异常不影响聊天；保留同一消息 ID 重试，服务端负责幂等。
        if (key === this.identityKey) {
          this.retryAt = Date.now() + 15000;
          this.pending = this.pending.filter(item => Date.now() - item.createdAt < 3600000);
          this.persist();
        }
      } finally {
        this.busy = false;
      }
    },
  },
});
