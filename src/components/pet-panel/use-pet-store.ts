/**
 * 桌宠 store：只保留"喂养长大"主流程（用户简化要求）。
 *
 * - 观看身份无感登录（viewerId 唯一）。
 * - 固定领养：autoAdopt 开启（后端 state 下发）时自动领养，无需用户操作。
 * - 余额由喂养响应、打开气泡和评论奖励到账后的单次刷新更新。
 */
import { defineStore } from 'pinia';
import {
  ApiError,
  FeedResult,
  FoodInfo,
  MeState,
  PetInfo,
  ViewerIdentity,
  petApi,
} from './pet-api';

interface PetStoreState {
  inited: boolean;
  authenticated: boolean;
  identity: ViewerIdentity | null;
  loginError: string;
  username: string;
  balance: string;
  pet: PetInfo | null;
  foods: FoodInfo[];
  autoAdopt: boolean;
  /** 丢弃喂养或身份切换前发出的旧状态读取结果。 */
  revision: number;
  toast: string;
  toastType: 'info' | 'success' | 'error';
  feeding: boolean;
  switching: boolean;
  balanceDirty: boolean;
}

export const usePetStore = defineStore('pet-panel-store', {
  state: (): PetStoreState => ({
    inited: false,
    authenticated: false,
    identity: null,
    loginError: '',
    username: '',
    balance: '0.00',
    pet: null,
    foods: [],
    autoAdopt: true,
    revision: 0,
    toast: '',
    toastType: 'info',
    feeding: false,
    switching: false,
    balanceDirty: false,
  }),

  actions: {
    showToast(message: string, type: 'info' | 'success' | 'error' = 'info') {
      this.toast = message;
      this.toastType = type;
      if (message) {
        window.setTimeout(() => {
          if (this.toast === message) {
            this.toast = '';
          }
        }, 2600);
      }
    },

    applyState(state: MeState) {
      this.authenticated = true;
      this.username = state.user.firstName || state.user.username;
      this.balance = state.points.balance;
      this.pet = state.pet;
      this.autoAdopt = state.autoAdopt !== false;
    },

    async init() {
      if (this.inited) {
        return;
      }
      try {
        const [{ foods }] = await Promise.all([petApi.foods(), petApi.session()]);
        this.foods = foods;
        // 旧 Cookie 可能属于其他频道或演示账号，等待当前 SDK 身份重新绑定。
        this.inited = true;
      } catch (error) {
        this.inited = false;
        console.error('[pet-desktop] init failed', error);
      }
    },

    /** 登录/会话就绪后：拉状态并按开关自动领养（固定领养，无领养界面）。 */
    async afterAuthed() {
      const state = await petApi.state();
      this.applyState(state);
      if (this.autoAdopt && !this.pet) {
        await this.adopt('小萌');
      }
    },

    /** 观看身份自动登录（§4.1）：SDK viewerId 换业务会话。 */
    async loginByViewer(viewerId: string, channelId: string, nickname?: string) {
      if (
        this.authenticated &&
        this.identity?.viewerId === viewerId &&
        this.identity.channelId === channelId
      ) {
        return;
      }
      this.authenticated = false;
      this.revision += 1;
      this.identity = null;
      this.loginError = '';
      this.pet = null;
      this.balance = '0.00';
      try {
        await petApi.session(); // 确保 csrftoken 下发
        const result = await petApi.authByViewer(viewerId, channelId, nickname);
        this.identity = result.identity;
        await this.afterAuthed();
      } catch (error) {
        this.loginError = error instanceof Error ? error.message : '积分服务连接失败，请稍后重试';
        console.warn('[pet-desktop] 观看身份登录失败', error);
      }
    },

    /** 单次刷新（打开气泡时调用；不做轮询）。 */
    async refreshState() {
      if (!this.authenticated || this.feeding || this.switching) {
        return;
      }
      try {
        const revision = this.revision;
        const state = await petApi.state();
        if (revision === this.revision) this.applyState(state);
      } catch {
        // 静默：气泡内数据保持上次值
      }
    },

    /** 评论入账可能与喂养重叠，等写请求结束后再读取最终余额。 */
    async refreshAfterReward() {
      if (this.feeding || this.switching) {
        this.balanceDirty = true;
      } else {
        await this.refreshState();
      }
    },

    async adopt(name?: string) {
      try {
        const { adopted, pet } = await petApi.adopt(name);
        this.pet = pet;
        if (adopted) {
          this.showToast(`${pet.name} 来啦，喂它长大吧`, 'success');
        }
      } catch (error) {
        console.warn('[pet-desktop] 自动领养失败', error);
      }
    },

    /** 切换到另一只宠物的独立记录；丢弃切换前的旧状态响应。 */
    async switchSpecies(species: string): Promise<boolean> {
      if (!this.authenticated || !this.pet || this.feeding || this.switching) {
        return false;
      }
      this.switching = true;
      const revision = ++this.revision;
      try {
        const { pet } = await petApi.switchSpecies(species);
        if (revision !== this.revision) return false;
        this.pet = pet;
        return true;
      } finally {
        this.switching = false;
        if (this.balanceDirty) {
          this.balanceDirty = false;
          await this.refreshState();
        }
      }
    },

    /** 响应即时落账，画面动作交给 PetDirector，避免计时器互相覆盖。 */
    async feed(food: FoodInfo): Promise<FeedResult | null> {
      if (!this.authenticated || !this.pet || this.feeding || this.switching) {
        return null;
      }
      this.feeding = true;
      const revision = ++this.revision;
      const petId = this.pet.id;
      try {
        const result: FeedResult = await petApi.feed(
          `act-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
          food.code,
          petId,
        );
        if (revision !== this.revision || result.pet.id !== petId) return null;
        this.balance = result.balance;
        this.pet = result.pet;
        return result;
      } catch (error) {
        if (error instanceof ApiError) {
          if (error.code === 20001) {
            const balance = (error.data as { balance?: string } | null)?.balance;
            if (balance) {
              this.balance = balance;
            }
          }
          this.showToast(error.message, 'error');
        } else {
          this.showToast('网络异常，请稍后重试', 'error');
        }
      } finally {
        this.feeding = false;
        if (this.balanceDirty) {
          this.balanceDirty = false;
          await this.refreshState();
        }
      }
      return null;
    },

    canAfford(food: FoodInfo): boolean {
      return Number(this.balance) >= Number(food.pointCost);
    },
  },
});
