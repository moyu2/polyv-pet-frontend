import { ref, computed, unref } from 'vue';

import { translate } from '@/assets/lang';
import { previewImage } from '@/hooks/components/use-image-preview';

import { AllTuwenMode, IarTuwenLiveInstance } from '../types/tuwen-live-types';
import { useGlobalInject } from '@/app/use-global-inject';

interface PreviewTuwenImageData {
  /** 图片地址列表 */
  images: string[];
  /** 显示的下标 */
  index: number;
}

/**
 * @hook 互动-图文直播
 * */
export const useTuwenLive = () => {
  const { getWatchCore } = useGlobalInject();

  const watchCore = getWatchCore();
  /** 图文直播 SDK 实例 */
  const tuwenSdk = watchCore.interactReceive.getTuwen();

  /** 图文总条数 */
  const messageTotal = ref(0);
  /** 处理图文总条数改变 */
  const onMessageTotalChange = (total = 0) => {
    messageTotal.value = total;
  };

  /** 图文直播组件实例 */
  const tuwenRef = ref<IarTuwenLiveInstance>();
  /** 设置图文直播组件监听 window 的事件 */
  const setupScrollListen = () => {
    const tuwenInstance = unref(tuwenRef);

    if (!tuwenInstance) {
      console.warn('setupScrollListen fail, tuwenRef is undefined!');
      return;
    }
    if (tuwenInstance.initScrollLister) {
      tuwenInstance.initScrollLister();
    }
  };

  /** 预览图文直播的图片 */
  const previewTuwenImage = (data: PreviewTuwenImageData) => {
    const { images, index } = data;
    previewImage(images, {
      initialIndex: index,
    });
  };

  return {
    tuwenSdk,

    messageTotal,
    onMessageTotalChange,

    tuwenRef,
    setupScrollListen,

    previewTuwenImage,
  };
};

/** 图文直播展示模式 hook */
export const useTuwenLiveMode = () => {
  /** 图文展示模式，1-图文，2-图片 */
  const tuwenMode = ref(AllTuwenMode.Tuwen);

  /** 图文展示模式选项 */
  const tuwenModeOptions = computed(() => [
    {
      name: translate('interact.tuwen.tuwenMode'),
      value: AllTuwenMode.Tuwen,
      isCurrent: tuwenMode.value === AllTuwenMode.Tuwen,
    },
    {
      name: translate('interact.tuwen.picMode'),
      value: AllTuwenMode.Image,
      isCurrent: tuwenMode.value === AllTuwenMode.Image,
    },
  ]);

  /** 当前图文展示模式文案 */
  const currentTuwenModeText = computed(() => {
    const options = tuwenModeOptions.value;
    let text = '';
    options.forEach(option => {
      if (option.isCurrent) {
        text = option.name;
      }
    });
    return text;
  });

  /** 修改图文展示模式 */
  const changeTuwenMode = (mode = AllTuwenMode.Tuwen) => {
    tuwenMode.value = mode;
  };

  return {
    tuwenMode,
    tuwenModeOptions,
    currentTuwenModeText,
    changeTuwenMode,
  };
};
