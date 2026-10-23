import { appEvents } from '@/app/app-events';
import { useGlobalInject } from '@/app/use-global-inject';
import { TAB_NAME_PRODUCT } from '@/assets/constants/tab-name';
import { isMobile } from '@/assets/utils/browser';
import {
  MessageEffectData,
  MessageEffectType,
} from '@/components/page-watch-common/message-effect/type';
import { useLayoutStore } from '@/store/use-layout-store';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import { ChatMsgEffectType, ProductEntryPosition } from '@polyv/live-watch-sdk';
import { computed } from 'vue';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useChatMsgDataInject } from '../_hooks/chat-msg-data-hook';

export const useEffectMsg = () => {
  const { chatMsg } = useChatMsgDataInject<ChatMsgEffectType>();

  const { getWatchCore, getEmitter } = useGlobalInject();
  const watchCore = getWatchCore();

  const layoutStore = useLayoutStore();

  const { interactSetting } = storeDefinitionToRefs(useInteractReceiveStore);

  /** 特效数据 */
  const effectData = computed(() => {
    return chatMsg.value.data as MessageEffectData;
  });

  async function onClickMsg() {
    const { effectType, targetId } = effectData.value;

    // 仅商品点击、商品购买才有点击交互
    if (
      [MessageEffectType.ProductBuy, MessageEffectType.ProductClick].includes(effectType) &&
      targetId
    ) {
      const productTarget = await watchCore.product.getProductTarget();
      const productDetail = await productTarget.getProductData(Number(targetId));

      // 普通、职位商品打开商品详情
      if (
        productDetail &&
        [productTarget.ProductType.Normal, productTarget.ProductType.Position].includes(
          productDetail.productType,
        )
      ) {
        getEmitter().emit(appEvents.product.OpenProductDetailPopup, productDetail.productId);
        return;
      }

      if (!isMobile) {
        // PC 端，开启「播放器是否悬浮商品列表入口开关」，打开商品列表弹层
        if (interactSetting.value.productEntryPosition === ProductEntryPosition.Player) {
          getEmitter().emit(appEvents.product.OpenProductListPopup);
          return;
        }
        // 切换到商品列表的 tab
        layoutStore.$patch({
          pcAsideTabCurrentName: TAB_NAME_PRODUCT,
        });
      } else {
        // 横/竖屏观看页，打开商品列表
        getEmitter().emit(appEvents.product.OpenProductListPopup);
      }
    }
  }

  return {
    chatMsg,
    effectData,
    onClickMsg,
  };
};
