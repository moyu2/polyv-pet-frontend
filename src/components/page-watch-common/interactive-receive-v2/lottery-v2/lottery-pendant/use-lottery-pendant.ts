import { appEvents, useEventBusListener } from '@/app/app-events';
import { useLotteryTarget } from '../use-lottery-v2';

/**
 * 抽奖入口 hook
 *
 * @description 对抽奖的一些全局处理都在这里处理
 */
export const useLotteryPendant = () => {
  const { targetInited, getIarTarget, lotteryConfig } = useLotteryTarget();

  /**
   * 检查发言文本是否符合评论抽奖条件后参与进抽奖中
   * @param comment 发言的文本
   */
  const checkLotteryComment = async (comment: string) => {
    const iarTarget = getIarTarget();
    iarTarget.checkComment(comment);
  };

  useEventBusListener(appEvents.interaction.CheckCommentLotteryComment, checkLotteryComment);

  return {
    targetInited,
    getIarTarget,
    lotteryConfig,
  };
};
