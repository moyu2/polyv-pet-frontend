/**
 * @file 格式化相关的 hook
 */

import { unref, watch, Ref } from 'vue';

/**
 * @hook 格式化价格
 * */
export const useFormatPrice = (priceRef: Ref<string>) => {
  /** 监听并格式化成正确的价格格式 */
  watch(
    () => unref(priceRef),
    val => {
      let newVal = `${val}`;

      newVal = newVal && newVal.replace(/[^0-9.]/g, '');

      if (newVal.indexOf('.') !== newVal.lastIndexOf('.')) {
        newVal =
          newVal.substring(0, newVal.lastIndexOf('.')) +
          newVal.substring(newVal.lastIndexOf('.') + 1);
      }

      priceRef.value = newVal;
    },
  );

  /** 将当前价格随机 */
  function randomPrice(): void {
    priceRef.value = (Math.random() * 10).toFixed(2);
  }

  return {
    randomPrice,
  };
};
