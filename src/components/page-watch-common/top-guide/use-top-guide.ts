import { translate } from '@/assets/lang';
import { isIOS, isOpenHarmony, isWeixin, isWorkWeixin } from '@/assets/utils/browser';
import { useToastManager } from '@/hooks/components/use-toast';
import { useQueryParams } from '@/hooks/core/use-query-params';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useLayoutStore } from '@/store/use-layout-store';
import { usePortraitLayoutStore } from '@/store/use-portrait-layout-store';
import { computed, ref } from 'vue';
import { startsWithProtocol } from '@polyv/utils/net';
import { copyText } from '@/assets/utils/copy';
import { useThemeStore } from '@/store/use-theme-store';

function isLink(target: string) {
  if (startsWithProtocol(target, ['http', 'https'])) {
    return true;
  }
  if (/^\/\//.test(target)) {
    return true;
  }
  return false;
}

export const useTopGuide = () => {
  const { paramGetter } = useQueryParams();

  const { toast } = useToastManager();

  const { mobilePlayerIsPageFullscreen, isHorizontalScreenOrientation } =
    storeDefinitionToRefs(useLayoutStore);
  const { portraitPlayerIsPageFullscreen } = storeDefinitionToRefs(usePortraitLayoutStore);

  const { topGuideSetting } = storeDefinitionToRefs(useThemeStore);

  const redirectUrl = ref<string>();

  if (isIOS) {
    redirectUrl.value = topGuideSetting.value.topGuideBarIosRedirectUrl;
  } else if (isOpenHarmony) {
    redirectUrl.value = topGuideSetting.value.topGuideBarHarmonyOSRedirectUrl;
  } else {
    redirectUrl.value = topGuideSetting.value.topGuideBarAndroidRedirectUrl;
  }

  function onClickButton() {
    if (!redirectUrl.value) {
      toast.error(translate('topGuide.fail'));
      return;
    }
    if ((isWeixin || isWorkWeixin) && !isLink(redirectUrl.value)) {
      copyText(redirectUrl.value);
      toast.error(translate('topGuide.wxFail'));
      return;
    }
    window.open(redirectUrl.value, '_blank');
  }

  const visible = ref(paramGetter().noAppBar() !== '1');

  function close() {
    visible.value = false;
  }

  const guideVisible = computed(() => {
    if (
      mobilePlayerIsPageFullscreen.value ||
      portraitPlayerIsPageFullscreen.value ||
      isHorizontalScreenOrientation.value
    ) {
      return false;
    }

    return visible.value;
  });

  return {
    topGuideSetting,
    onClickButton,
    visible,
    close,
    guideVisible,
  };
};
