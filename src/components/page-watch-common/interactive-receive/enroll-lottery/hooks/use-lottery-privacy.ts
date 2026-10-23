import { useGlobalInject } from '@/app/use-global-inject';
import { ref } from 'vue';

export function useLotteryPrivacy() {
  const { getWatchCore } = useGlobalInject();

  const watchCore = getWatchCore();
  const privacyDetail = watchCore.interactReceive.getLotteryPrivacyDetail();

  const privacyContent = ref(privacyDetail.privacyContent);

  return {
    privacyContent,
  };
}
