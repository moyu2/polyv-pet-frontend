import { ref, computed } from 'vue';
import { appEvents, useEventBusListener } from '@/app/app-events';

import { translate } from '@/assets/lang';
import { useGlobalInject } from '@/app/use-global-inject';

/**
 * @hook 互动-红包-积分记录弹层
 * */
export const useScoreRecord = () => {
  const { getWatchCore } = useGlobalInject();

  const watchCore = getWatchCore();
  /** 红包 SDK 实例 */
  const redpackSdk = watchCore.interactReceive.getRedpack();

  /** 积分记录组件是否创建，用于控制刷新数据、在首次没打开时不请求接口 */
  const scoreRecordRender = ref(false);
  function setScoreRecordRender(needRender = true) {
    scoreRecordRender.value = needRender;
  }

  /** 积分记录显示状态 */
  const scoreRecordVisible = ref(false);
  /** 设置显示状态 */
  function setScoreRecordVisible(visible = true) {
    scoreRecordVisible.value = visible;

    if (visible) {
      setScoreRecordRender(true);
    }
  }

  /** 积分领取记录标题 */
  const scoreRecordTitle = computed(() => translate('interact.scoreRecord.title'));

  useEventBusListener(appEvents.interaction.OpenScoreRecord, setScoreRecordVisible);

  return {
    redpackSdk,
    scoreRecordRender,
    setScoreRecordRender,
    scoreRecordVisible,
    scoreRecordTitle,
    setScoreRecordVisible,
  };
};
