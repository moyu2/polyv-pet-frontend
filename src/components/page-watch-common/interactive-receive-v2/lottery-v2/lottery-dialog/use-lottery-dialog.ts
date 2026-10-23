import { appEvents, useEventBusListener } from '@/app/app-events';
import { type LotteryDialogInstance } from '@polyv/iar-lottery-ui';
import { ref } from 'vue';

export const useLotteryDialog = () => {
  const dialogRef = ref<LotteryDialogInstance>();

  useEventBusListener(appEvents.iar.OpenLotteryReceiveDialog, (lotteryId: string) => {
    dialogRef.value?.openLotteryReceive({ lotteryId });
  });

  return {
    dialogRef,
  };
};
