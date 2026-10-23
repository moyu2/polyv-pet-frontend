<template>
  <div class="c-pc-barrage-location-button">
    <component :is="map[buttonType]" />
  </div>
</template>

<script setup lang="ts">
import {
  PcIconBarrageLocalTop,
  PcIconBarrageLocalBottom,
  PcIconBarrageLocalHalf,
  PcIconBarrageLocalFull,
} from '@/components/component-icons/pc/map';

import { PropUtils } from '@polyv/vue-components';
import { tupleString } from '@/assets/utils/array';

defineProps(
  (() => {
    const buttonTypeList = tupleString('top', 'bottom', 'half', 'full');
    return {
      /** 位置按钮类型 */
      buttonType: PropUtils.oneOf(buttonTypeList).def('top'),
    };
  })(),
);

/**
 * 位置按钮名称对应使用的组件
 * 动态组件:is是一个变量而非字符串,因而需要以下设置
 */
const map = {
  /** 顶部 */
  top: PcIconBarrageLocalTop,
  /** 底部 */
  bottom: PcIconBarrageLocalBottom,
  /** 半屏 */
  half: PcIconBarrageLocalHalf,
  /** 全屏 */
  full: PcIconBarrageLocalFull,
};
</script>
