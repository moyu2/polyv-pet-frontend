import { useGlobalInject } from '@/app/use-global-inject';
import { ProductClickType, IarProductType } from '@polyv/live-watch-sdk';

export const useEffectSetting = () => {
  const { getWatchCore } = useGlobalInject();
  const watchCore = getWatchCore();

  function getEffectSetting() {
    return watchCore.channel.getEffectSetting();
  }

  /**
   * 根据商品类型获取商品点击模板
   * @param type 商品类型
   */
  function getProductClickTemplate(type: ProductClickType) {
    const effectSetting = getEffectSetting();
    switch (type) {
      case IarProductType.Normal:
        return effectSetting.clickOrdinaryProductEffectTip;
      case IarProductType.Finance:
        return effectSetting.clickFinancialProductEffectTip;
      case IarProductType.Job:
      case 'delivery':
        return effectSetting.clickJobProductEffectTip;
      default:
        return effectSetting.clickOrdinaryProductEffectTip;
    }
  }

  /**
   * 获取商品购买模板
   */
  function getProductBuyTemplate() {
    const effectSetting = getEffectSetting();
    return effectSetting.orderProductEffectTip;
  }

  return {
    getEffectSetting,
    getProductClickTemplate,
    getProductBuyTemplate,
  };
};
