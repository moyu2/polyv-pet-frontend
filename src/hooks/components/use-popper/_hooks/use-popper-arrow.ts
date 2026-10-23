/**
 * @file popper 箭头 hook
 */
import Vue, { ComponentOptions, onMounted, unref } from 'vue';
import { ExtendedVue } from 'vue/types/vue';

import PopperArrow from '../_components/popper-arrow.vue';
import { PopperOptions } from '../_popper-type';

export interface PopperArrowOptions {
  /** 颜色，默认：#fff */
  color?: string;
  /** 尺寸，默认：6 */
  size?: number;
}

export type PopperArrowComponentOptions = ComponentOptions<Vue>;
export type PopperArrowCtorType = ExtendedVue<
  Vue,
  Record<string, never>,
  Record<string, never>,
  Record<string, never>,
  PopperArrowOptions,
  Record<string, never>
>;
const PopperArrowConstructor = Vue.extend(PopperArrow as PopperArrowComponentOptions);

export const usePopperArrow = (popperOptions: PopperOptions) => {
  const { getElement, arrow } = popperOptions;

  /** 创建箭头节点 */
  function createArrowElem() {
    const arrowVal = unref(arrow);
    const propsData = typeof arrowVal === 'boolean' ? {} : arrowVal;
    const instance = new PopperArrowConstructor({
      propsData,
    });
    instance.$mount();

    const { popperElem } = getElement();

    popperElem && popperElem.appendChild(instance.$el);
  }

  onMounted(() => {
    if (unref(arrow)) {
      createArrowElem();
    }
  });
};
