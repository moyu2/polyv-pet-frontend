/**
 * @file 现金打赏 hook
 */

import { useFormatPrice } from '@/hooks/tools/use-format';
import { translate } from '@/assets/lang';
import { useToastManager } from '@/hooks/components/use-toast';
import { ref, unref } from 'vue';
import { useDonatePay } from './use-donate-pay';
import { DonateType } from '@polyv/live-watch-sdk';
import { useDonateStore } from '@/store/use-donate-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { DonateOptions } from './types';

/** 现金打赏 hook */
export const useDonateCash = (donateOptions: DonateOptions = {}) => {
  const { toast } = useToastManager();

  // 打赏成功回调
  const donateSuccess = donateOptions.donateSuccess;

  const { donateCashMin } = storeDefinitionToRefs(useDonateStore);
  const { payDonate } = useDonatePay();

  /** 现金金额 */
  const cashAmount = ref('0');
  const { randomPrice } = useFormatPrice(cashAmount);

  /** 处理点击随机 */
  function onClickRandom() {
    randomPrice();
  }

  /** 处理点击快捷选项 */
  function onClickQuickOptions(amount: number) {
    cashAmount.value = `${amount}`;
  }

  /** 打赏现金 */
  async function donateCash() {
    const cash = Number(unref(cashAmount));
    if (cash === 0) {
      toast.error(translate('donate.error.notZero'));
      return;
    }

    if (cash < unref(donateCashMin)) {
      toast.error(
        translate('donate.error.mini', {
          price: unref(donateCashMin).toString(),
        }),
      );
      return;
    }

    await payDonate({
      donateType: DonateType.Cash,
      amount: `${cash}`,
    });

    donateSuccess && donateSuccess();
  }

  return {
    cashAmount,
    onClickRandom,
    onClickQuickOptions,
    donateCash,
  };
};
