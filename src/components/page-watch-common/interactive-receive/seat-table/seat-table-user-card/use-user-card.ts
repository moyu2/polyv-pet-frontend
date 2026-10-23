import { appEvents, useEventBusListener } from '@/app/app-events';
import { useSimpleVisible } from '@/hooks/behaviors/use-simple-visible';
import { ref } from 'vue';

export const useUserCard = () => {
  const { visible: popupVisible, close: closePopup } = useSimpleVisible(false);

  const userInfo = ref<unknown>();

  useEventBusListener(appEvents.interaction.OpenSeatTableUserCard, (info: unknown) => {
    popupVisible.value = true;
    userInfo.value = info;
  });

  return {
    userInfo,
    popupVisible,
    closePopup,
  };
};
