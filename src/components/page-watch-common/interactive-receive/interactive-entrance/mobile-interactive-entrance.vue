<!-- @file 移动端互动二次入口 -->
<template>
  <div
    v-if="entrancesVisible"
    class="c-interactive-entrance"
  >
    <div class="c-interactive-entrance__content">
      <div
        v-for="entranceData in interactiveEntrance"
        :key="entranceData.type"
        class="c-interactive-entrance__button pws-interactive-entrance-button"
        @click="openInteractive(entranceData)"
      >
        <span
          class="c-interactive-entrance__button__icon"
          :style="{
            backgroundImage: `url(${entranceData.icon})`,
          }"
        ></span>
        <span>{{ $lang(entranceData.name) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useInteractiveEntrance } from './use-interactive-entrance';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';

const { interactiveEntrance } = storeDefinitionToRefs(useInteractReceiveStore);

const { entrancesVisible, openInteractive } = useInteractiveEntrance();
</script>

<style lang="scss">
.c-interactive-entrance {
  height: 28px;
  padding: 8px 16px;
}

.c-interactive-entrance__content {
  display: flex;
  flex-wrap: nowrap;
  width: 100%;
  height: 100%;
  overflow-x: scroll;
  scrollbar-width: none;
  scroll-behavior: smooth;
  -ms-overflow-style: none;

  &::-webkit-scrollbar {
    display: none;
  }
}

.c-interactive-entrance__button {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 28px;
  padding: 0 10px;
  margin-right: 8px;
  font-size: 14px;
  line-height: 28px;
  color: #ffffff;
  text-align: center;
  white-space: nowrap;
  cursor: pointer;
  background-color: #39393e;
  border-radius: 14px;
}

.c-interactive-entrance__button__icon {
  width: 16px;
  height: 16px;
  margin-right: 4px;
  background-position: center;
  background-size: contain;
}
</style>
