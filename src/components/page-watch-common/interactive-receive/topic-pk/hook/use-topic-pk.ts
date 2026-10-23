import { useGlobalInject } from '@/app/use-global-inject';
import { useFeedBehavior } from '@/hooks/behaviors/use-webview-feed';
import { useInterruptUserClick } from '@/hooks/business/use-interrupt-user-click/use-interrupt-user-click';
import { useThemeStore } from '@/store/use-theme-store';
import { computed } from 'vue';

export const useTopicPk = () => {
  const { getWatchCore } = useGlobalInject();

  const themeStore = useThemeStore();

  const { toInterruptUserClick } = useInterruptUserClick();

  const { toLockFeedDrag, toUnlockFeedDrag } = useFeedBehavior();

  const watchCore = getWatchCore();

  const topicPkSdk = watchCore.interactReceive.getTopicPK();

  const customImgConfig = computed(() => {
    if (!themeStore.watchThemeStyleConfig) {
      return {};
    }

    return {
      entranceImg: themeStore.watchThemeStyleConfig.common.pendant.topicPk,
    };
  });

  function onTopicPKVisibleChanged(visible: boolean) {
    if (visible) {
      toLockFeedDrag('topic-pk');
    } else {
      toUnlockFeedDrag();
    }
  }

  async function beforeChooseTopicPkAnswer() {
    return toInterruptUserClick({
      triggerSource: 'before-choose-topic-pk-answer',
      ignoreSetNick: true,
    });
  }

  return {
    topicPkSdk,
    customImgConfig,
    onTopicPKVisibleChanged,
    beforeChooseTopicPkAnswer,
  };
};
