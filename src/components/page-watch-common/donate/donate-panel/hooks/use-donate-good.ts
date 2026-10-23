/**
 * @file 道具打赏 hook
 */

import { translate } from '@/assets/lang';
import { useToastManager } from '@/hooks/components/use-toast';
import { DonateGoodInfo, useDonateStore } from '@/store/use-donate-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { DonateType } from '@polyv/live-watch-sdk';
import { ref, unref } from 'vue';
import { DonateOptions } from './types';
import { useDonateGoodPoint } from './use-donate-good-point';
import { useDonatePay } from './use-donate-pay';

/**
 * 道具打赏 hook
 */
export const useDonateGood = (donateOptions: DonateOptions = {}) => {
  const { toast } = useToastManager();

  // 打赏成功回调
  const donateSuccess = donateOptions.donateSuccess;

  const { showDonatePointGood, showDonateCashGood, donatePointUnit } =
    storeDefinitionToRefs(useDonateStore);

  /** 打赏数量 */
  const donateCount = ref(1);
  /** 打赏数量快捷选项 */
  const quickCounts = [1, 5, 10, 66, 88, 666];

  /** 当前选择的礼物 */
  const selectedGood = ref<DonateGoodInfo>();
  /** 设置选中的礼物 */
  function setSelectedGood(good: DonateGoodInfo): void {
    selectedGood.value = good;
    donateCount.value = 1;
  }

  const { surplusPoint, donatePointGood } = useDonateGoodPoint();
  const { payDonate } = useDonatePay();

  /** 打赏礼物 */
  async function donateGood() {
    const good = unref(selectedGood);
    const count = unref(donateCount) || 1;

    if (!good) {
      toast.error(translate('donate.error.notChoice'));
      return;
    }

    if (unref(showDonatePointGood)) {
      await donatePointGood(good, count);
    } else if (unref(showDonateCashGood)) {
      await payDonate({
        donateType: DonateType.Good,
        goodId: good.goodId,
      });
    }

    donateSuccess && donateSuccess();
  }

  return {
    donateCount,
    quickCounts,
    surplusPoint,
    selectedGood,
    setSelectedGood,
    donateGood,
    donatePointGood,
    donatePointUnit,
  };
};
