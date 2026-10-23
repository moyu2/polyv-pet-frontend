<!-- @file 竖屏端互动二次入口 -->
<template>
  <div
    v-if="entrancesVisible"
    class="c-interactive-entrance"
  >
    <div
      class="c-interactive-entrance__button"
      @click="onClickButton(entranceData)"
    >
      <span
        class="c-interactive-entrance__button__icon"
        :style="{
          backgroundImage: `url(${entranceData.icon})`,
        }"
      ></span>
      <span>{{ entranceData.text || $lang(entranceData.name) }}</span>
      <mobile-icon-arrow-down
        v-if="entranceData.type === 'task'"
        class="c-interactive-entrance__button__arrow"
      />
    </div>

    <mobile-popup
      :title="entranceData.text || $lang(entranceData.name)"
      :visible.sync="entrancePopupVisible"
    >
      <div class="c-interactive-entrance__popup">
        <div
          v-for="item in interactiveEntrance"
          :key="item.type"
          class="c-interactive-entrance__popup__item"
          @click="onClickButton(item)"
        >
          <span
            class="c-interactive-entrance__popup__item__icon"
            :style="{
              backgroundImage: `url(${item.icon2})`,
            }"
          ></span>
          <span>{{ $lang(item.name) }}</span>
          <mobile-icon-arrow-right class="c-interactive-entrance__popup__item__arrow" />
        </div>
      </div>
    </mobile-popup>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { translate } from '@/assets/lang';
import { useInteractiveEntrance } from './use-interactive-entrance';
import {
  useInteractReceiveStore,
  InteractiveEntranceData,
} from '@/store/use-interact-receive-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import MobilePopup from '@/components/common-base/popup/mobile-popup.vue';
import { LangKey } from '@/assets/lang/types';
import { MobileIconArrowDown, MobileIconArrowRight } from '@/components/component-icons/mobile/map';

const { interactiveEntrance } = storeDefinitionToRefs(useInteractReceiveStore);

const { entrancesVisible, openInteractive } = useInteractiveEntrance();

const taskLang = computed(() => translate('interact.task.title'));

/** 入口数据 */
const entranceData = computed<InteractiveEntranceData>(() => {
  if (interactiveEntrance.value.length === 1) {
    return interactiveEntrance.value[0];
  }

  return {
    name: '' as LangKey,
    text: `${taskLang.value}(${interactiveEntrance.value.length})`,
    type: 'task',
    icon: require('./imgs/icon-task.png'),
    icon2: '',
    onClick: () => {},
  };
});

const entrancePopupVisible = ref(false);

/** 处理按钮点击 */
function onClickButton(item: InteractiveEntranceData) {
  if (item.type === 'task') {
    entrancePopupVisible.value = true;
    return;
  }

  entrancePopupVisible.value = false;
  openInteractive(item);
}
</script>

<style lang="scss">
.c-interactive-entrance__button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 20px;
  padding: 0 8px;
  font-size: 12px;
  line-height: 20px;
  color: #ffffff;
  text-align: center;
  white-space: nowrap;
  cursor: pointer;
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 14px;
}

.c-interactive-entrance__button__icon {
  width: 12px;
  height: 12px;
  margin-right: 2px;
  background-position: center;
  background-size: contain;
}
.c-interactive-entrance__button__arrow {
  display: flex;
  font-size: 16px !important;
}

.c-interactive-entrance__popup__item {
  display: flex;
  align-items: center;
  height: 78px;
  margin: 0 24px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);

  &:last-of-type {
    border-bottom: none;
  }
}

.c-interactive-entrance__popup__item__icon {
  display: inline-block;
  width: 40px;
  height: 40px;
  margin-right: 16px;
  background-position: center;
  background-size: cover;
}

.c-interactive-entrance__popup__item__arrow {
  margin-left: auto;
  font-size: 20px;
  color: #aaa;
}
</style>
