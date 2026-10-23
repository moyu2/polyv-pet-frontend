import { computed, onMounted, ref } from 'vue';
import {
  AuthType,
  LiveStatus,
  YN,
  ChannelTrialInfo,
  ChannelTrialError,
} from '@polyv/live-watch-sdk';
import { isWeixin } from '@/assets/utils/browser';

import { useAuthStore } from '@/store/use-auth-store';
import { useChannelStore } from '@/store/use-channel-store';
import { ynToBool } from '@polyv/utils/boolean';

import { appEvents, useEventBusListener } from '@/app/app-events';
import { useToastManager } from '@/hooks/components/use-toast';
import { translate } from '@/assets/lang';
import { useGlobalInject } from '@/app/use-global-inject';

/**
 * @hook 试看-引导页业务逻辑
 * */
export const usePlayerTrialHook = () => {
  const { getWatchCore } = useGlobalInject();

  const { toast } = useToastManager();

  const channelStore = useChannelStore();
  const authStore = useAuthStore();

  /** 频道试看配置数据 */
  const trialInfo = ref<ChannelTrialInfo | null>(null);

  /**
   * 是否启用"试看"功能
   * 微信环境、直播状态、付费观看条件试看开关
   * */
  const trialEnabled = computed(() => {
    if (!isWeixin) return false;
    if (channelStore.liveStatus !== LiveStatus.Live) return false;

    const payAuthSettingItem = authStore.getAuthSettingItem(AuthType.Pay);
    if (
      !payAuthSettingItem ||
      !ynToBool(payAuthSettingItem.trialWatchEnabled || YN.N) ||
      !payAuthSettingItem.trialWatchTime
    ) {
      return false;
    }

    return true;
  });

  /** 是否展示试看播放器 */
  const trialPlayerVisible = computed(() => {
    return trialEnabled.value && trialInfo.value && trialInfo.value.availableTrial > 0;
  });

  /** 试看结束提示是否显示 */
  const trialPlayFinishTipVisible = computed(() => {
    return trialEnabled.value && trialInfo.value && trialInfo.value.availableTrial === 0;
  });

  /** 初始化试看数据 */
  async function initTrialInfo() {
    if (!trialEnabled.value) return;

    const watchCore = getWatchCore();
    const result = await watchCore.trial.getTrialInfo();
    if (result.success) {
      trialInfo.value = result;
      return;
    }

    if (result.failReason === ChannelTrialError.Redirect && result.failMessage) {
      location.href = result.failMessage;
    } else {
      toast.error(result.failMessage || translate('base.error.unknown'));
    }
  }

  /** 更新试看信息 */
  function updateTrialInfo(data: Partial<ChannelTrialInfo>) {
    const originData = trialInfo.value;
    if (!originData) return;

    trialInfo.value = {
      ...originData,
      ...data,
    };
  }

  onMounted(async () => {
    await initTrialInfo();
  });

  useEventBusListener(appEvents.player.TrialPlayEnd, () => {
    updateTrialInfo({
      availableTrial: 0,
    });
  });

  return {
    trialEnabled,
    trialInfo,
    trialPlayerVisible,
    trialPlayFinishTipVisible,
  };
};
