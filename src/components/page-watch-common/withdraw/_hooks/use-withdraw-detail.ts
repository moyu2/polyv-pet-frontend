import debounce from 'lodash-es/debounce';
import { computed, ref } from 'vue';
import { translate } from '@/assets/lang';
import { useToastManager } from '@/hooks/components/use-toast';
import { handleStatisticsErr } from './use-withdraw-apply';
import { ReceiveRecordInstance } from './use-receive-record';
import { useGlobalInject } from '@/app/use-global-inject';
import { appEvents, useEventBusListener } from '@/app/app-events';

export enum WithdrawDetailTab {
  /** 红包领取记录/历史红包领取  */
  RedpackReceiveRecord = 'redpackReceiveRecord',
  /** 提现记录/历史提现 */
  CashReceiveRecord = 'cashReceiveRecord',
}

export const useWithdrawDetailHook = () => {
  const { getWatchCore } = useGlobalInject();

  const { toast } = useToastManager();

  /**  个人领取总金额 */
  const totalReceive = ref(0);

  /** 个人提现总金额 */
  const totalWithdraw = ref(0);

  /** 个人可提现金额 */
  const totalAmount = ref(0);

  /** 当前 tab 值 */
  const curTab = ref<WithdrawDetailTab | string>('');

  /** 详情页 Tab 数据 */
  const detailTabs = computed(() => {
    return [
      {
        label: translate('withdraw.redpack.receive.record'),
        value: WithdrawDetailTab.RedpackReceiveRecord,
      },
      {
        label: translate('withdraw.cash.receive.record'),
        value: WithdrawDetailTab.CashReceiveRecord,
      },
    ];
  });

  /** 获取历史提现统计 */
  async function getWithdrawStatistics() {
    const watchCore = getWatchCore();

    try {
      const statisticsData = await watchCore.withdraw.getUserStatistics();

      totalReceive.value = statisticsData.totalReceive;
      totalWithdraw.value = statisticsData.totalWithdraw;
      totalAmount.value = statisticsData.totalAmount;
    } catch (error) {
      const errMsg = handleStatisticsErr(error as Error);
      toast.error(errMsg);
    }
  }

  useEventBusListener(appEvents.withdraw.RefreshBalance, getWithdrawStatistics);

  /** 初始化-提现详情 */
  async function initWithdrawDetail() {
    resetWithdrawDetail();

    curTab.value = WithdrawDetailTab.RedpackReceiveRecord;
    await getWithdrawStatistics();
  }

  /** 重置-提现详情 */
  function resetWithdrawDetail() {
    curTab.value = '';
    totalReceive.value = 0;
    totalWithdraw.value = 0;
    totalAmount.value = 0;
  }

  /** 红包领取记录组件实例 */
  const redpackReceiveRecordRef = ref<ReceiveRecordInstance>();
  /** 提现领取记录组件实例 */
  const cashReceiveRecordRef = ref<ReceiveRecordInstance>();

  /** 获取当前 Tab 对应的领取记录组件实例 */
  function getCurReceiveRecordRef() {
    if (curTab.value === WithdrawDetailTab.RedpackReceiveRecord) {
      return redpackReceiveRecordRef;
    }
    if (curTab.value === WithdrawDetailTab.CashReceiveRecord) {
      return cashReceiveRecordRef;
    }
  }

  /** 提现详情页滚动监听钩子 */
  function handleDetailMainScroll(e: UIEvent) {
    const target = e.target as HTMLElement;
    const scrollHeight = Math.floor(target.scrollHeight);
    const scrollTop = Math.floor(target.scrollTop);
    const clientHeight = Math.floor(target.clientHeight);
    if (scrollTop >= scrollHeight - clientHeight - 100) {
      const curReceiveRecordRef = getCurReceiveRecordRef();
      curReceiveRecordRef?.value?.getReceiveRecordList();
    }
  }
  const debounceHandleDetailMainScroll = debounce(handleDetailMainScroll, 300);

  return {
    totalAmount,
    totalReceive,
    totalWithdraw,
    curTab,
    detailTabs,

    getWithdrawStatistics,
    initWithdrawDetail,
    resetWithdrawDetail,

    redpackReceiveRecordRef,
    cashReceiveRecordRef,
    debounceHandleDetailMainScroll,
  };
};
