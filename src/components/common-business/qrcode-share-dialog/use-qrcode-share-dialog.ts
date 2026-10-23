import { ref } from 'vue';
import { appEvents, useEventBusListener } from '@/app/app-events';

export function useQrcodeShareDialog() {
  const visible = ref(false);

  useEventBusListener(appEvents.global.OpenQrCodeShareDialog, () => {
    visible.value = true;
  });

  return {
    visible,
  };
}
