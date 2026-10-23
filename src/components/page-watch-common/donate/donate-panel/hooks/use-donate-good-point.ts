/**
 * @file 礼物打赏（积分）hook
 */
import { translate } from '@/assets/lang';
import { useToastManager } from '@/hooks/components/use-toast';
import { DonateGoodInfo, useDonateStore } from '@/store/use-donate-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { onMounted, ref, unref } from 'vue';
import { useDonateRewardMsgInsertHook } from './use-donate-reward-msg-insert';
import { useGlobalInject } from '@/app/use-global-inject';

/** 礼物打赏（积分）hook */
export const useDonateGoodPoint = () => {
  const { getWatchCore } = useGlobalInject();

  const { toast } = useToastManager();

  const { insertRewardMsgForDonateGoodPoint } = useDonateRewardMsgInsertHook();
  const { showDonatePointGood } = storeDefinitionToRefs(useDonateStore);

  /** 当前用户剩余的积分总数 */
  const surplusPoint = ref(0);
  /** 获取当前用户剩余的积分 */
  async function getSurplusPoint() {
    const watchCore = getWatchCore();
    try {
      const points = await watchCore.donate.getDonateSurplusPoint();
      surplusPoint.value = points;
    } catch (e) {
      const err = e as Error;
      toast.error(err.message || translate('donate.point.getFail'));
    }
  }

  /** 处理打赏积分礼物 */
  async function donatePointGood(good: DonateGoodInfo, count: number): Promise<void> {
    const watchCore = getWatchCore();
    try {
      const points = await watchCore.donate.payDonatePoint({
        goodId: good.goodId,
        goodCount: count,
      });
      insertRewardMsgForDonateGoodPoint(good, count);
      surplusPoint.value = points;
    } catch (e) {
      const err = e as Error;
      toast.error(err.message || translate('donate.error.unknown'));
    }
  }

  onMounted(() => {
    if (unref(showDonatePointGood)) {
      getSurplusPoint();
    }
  });

  return {
    /** 当前剩余积分 */
    surplusPoint,
    /** 进行积分礼物打赏 */
    donatePointGood,
  };
};
