import { appEvents, useEventBusListener } from '@/app/app-events';
import { useGlobalInject } from '@/app/use-global-inject';
import { useSimpleVisible } from '@/hooks/behaviors/use-simple-visible';
import { ref } from 'vue';

export const usePortraitSettingPopup = (event: string) => {
  const { getEmitter } = useGlobalInject();

  const { visible, setVisible } = useSimpleVisible();

  const useTransition = ref(false);

  useEventBusListener(event, (params: { _visible?: boolean; _useTransition: boolean }) => {
    const { _visible = true, _useTransition = true } = params;
    useTransition.value = _useTransition;
    setVisible(_visible);
  });

  /** 关闭弹层 */
  function closePopup(_useTransition = true) {
    useTransition.value = _useTransition;
    setVisible(false);
  }

  /** 点击返回 */
  function onClickBack() {
    getEmitter().emit(appEvents.global.OpenMobileMorePopup);

    useTransition.value = false;
    setVisible(false);
  }

  return {
    visible,
    setVisible,
    useTransition,
    closePopup,
    onClickBack,
  };
};
