import { ref } from 'vue';
import { PolyvProduct, PolyvOrder, PolyvPayment, PolyvAddress } from '@polyv/live-watch-sdk';
import { useGlobalInject } from '@/app/use-global-inject';
import { appEvents } from '@/app/app-events';
import { useIarExternalLinkParams } from '@/components/page-watch-common/interactive-receive/use-iar-external-link-params';
import { useIarTarget } from '@/components/page-watch-common/interactive-receive-v2/_hooks/use-iar-target';

export const useProductUI = () => {
  const { getWatchCore, getEmitter, getAppBodyElement } = useGlobalInject();
  const { getLinkParams } = useIarExternalLinkParams();

  const watchCore = getWatchCore();

  const productUIConfig = ref({
    getLinkParams,
  });

  const popupConfig = ref({
    appendTo: getAppBodyElement(),
  });

  const { targetInited: productTargetInited, getIarTarget: getProductTarget } =
    useIarTarget<PolyvProduct>(() => {
      return watchCore.product.getProductTarget();
    });

  const { targetInited: orderTargetInited, getIarTarget: getOrderTarget } =
    useIarTarget<PolyvOrder>(() => {
      return watchCore.product.getOrderTarget();
    });

  const { targetInited: paymentTargetInited, getIarTarget: getPaymentTarget } =
    useIarTarget<PolyvPayment>(() => {
      return watchCore.product.getPaymentTarget();
    });

  const { targetInited: addressTargetInited, getIarTarget: getAddressTarget } =
    useIarTarget<PolyvAddress>(() => {
      return watchCore.product.getAddressTarget();
    });

  /**
   * 不支持直接购买，引导扫码进入移动端
   */
  function handleNotSupportDirectBuy() {
    getEmitter().emit(appEvents.global.OpenQrCodeShareDialog);
  }

  return {
    productUIConfig,
    popupConfig,

    productTargetInited,
    getProductTarget,

    orderTargetInited,
    getOrderTarget,

    paymentTargetInited,
    getPaymentTarget,

    addressTargetInited,
    getAddressTarget,

    handleNotSupportDirectBuy,
  };
};
