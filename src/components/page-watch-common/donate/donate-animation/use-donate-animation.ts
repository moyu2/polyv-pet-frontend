import { appEvents } from '@/app/app-events';
import { useGlobalInject } from '@/app/use-global-inject';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useDonateStore } from '@/store/use-donate-store';

export const useDonateAnimationVisible = () => {
  const { getEmitter } = useGlobalInject();

  const { donateAnimationVisible } = storeDefinitionToRefs(useDonateStore);

  /** 切换打赏动画显示状态 */
  function toggleDonateAnimationVisible() {
    getEmitter().emit(appEvents.donate.ToggleDonateAnimationVisible);
  }

  return {
    donateAnimationVisible,
    toggleDonateAnimationVisible,
  };
};
