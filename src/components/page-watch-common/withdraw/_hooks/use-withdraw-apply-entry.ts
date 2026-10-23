import { appEvents } from '@/app/app-events';
import { useGlobalInject } from '@/app/use-global-inject';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useWeixinStore } from '@/store/use-weixin-store';
import { useWithdrawStore } from '@/store/use-withdraw-store';
import { WeixinPayType } from '@polyv/live-watch-sdk';
import { computed } from 'vue';

/** 复用观看页“去提现”入口的可用性判断与打开行为。 */
export function useWithdrawApplyEntry() {
  const { getEmitter } = useGlobalInject();
  const { weixinPayType } = storeDefinitionToRefs(useWeixinStore);
  const { withdrawVisible } = storeDefinitionToRefs(useWithdrawStore);

  const withdrawApplyEnabled = computed(
    () => weixinPayType.value === WeixinPayType.TransferBill && withdrawVisible.value,
  );

  function openWithdrawApply(): void {
    if (!withdrawApplyEnabled.value) return;
    getEmitter().emit(appEvents.withdraw.OpenWithdrawApply, true);
  }

  return { withdrawApplyEnabled, openWithdrawApply };
}
