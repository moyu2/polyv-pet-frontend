<template>
  <pwc-popup
    v-model="anchorPopupVisible"
    class="c-anchor-popup"
    :show-header="false"
    :padding="false"
    effect="custom"
    background="none"
    :height="`${popupHeight}px`"
    body-max-height="100%"
  >
    <template
      v-if="popupHeight > defaultHeight + 50"
      #body-prefix
    >
      <div
        class="c-anchor-popup__back"
        @click="hide"
      >
        <pwc-icon-left />
      </div>
    </template>

    <div class="c-anchor-popup__body">
      <div
        class="c-anchor-popup__info"
        @click="hide"
      >
        <anchor-info :key="refreshKey" />
      </div>
      <div class="c-anchor-popup__content">
        <div class="c-anchor-popup__tabs">
          <div
            v-for="item in tabList"
            :key="item.value"
            class="c-anchor-popup__tab-item"
            :class="{ 'is-active': currentTab === item.value }"
            @click="onChangeTab(item.value)"
          >
            {{ item.label }}
            <span
              v-if="item.value === 'channel'"
              class="pwc-font-din-pro-regular"
              >({{ channelTotal }})</span
            >
          </div>
        </div>

        <div class="c-anchor-popup__tab-content">
          <description-info
            v-if="hasTab('description')"
            v-show="currentTab === 'description'"
            @scroll="onScrollEvent"
          />
          <anchor-channel
            v-if="hasTab('channel')"
            v-show="currentTab === 'channel'"
            :key="refreshKey"
            @scroll="onScrollEvent"
            @total="channelTotal = $event"
          />
        </div>
      </div>
    </div>
  </pwc-popup>
</template>

<script setup lang="ts">
import { appEvents, useEventBusListener } from '@/app/app-events';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useChannelInfoStore } from '@/store/use-channel-info-store';
import { usePageStore } from '@/store/use-page-store';
import { PwcIconLeft, PwcPopup } from '@polyv/vue-components';
import { computed, ref } from 'vue';
import AnchorChannel from '../anchor-channel/anchor-channel.vue';
import AnchorInfo from '../anchor-info/anchor-info.vue';
import DescriptionInfo from './description-info.vue';
import { useLayoutStore } from '@/store/use-layout-store';
import { useChannelStore } from '@/store/use-channel-store';
import { translate } from '@/assets/lang';
import { useChannelMenuStore } from '@/store/use-channel-menu-store';

const { pageClientHeight } = storeDefinitionToRefs(usePageStore);

const { teacherInfo } = storeDefinitionToRefs(useChannelStore);

const { anchorPopupVisible } = storeDefinitionToRefs(useChannelInfoStore);

const { mobileLayoutBottomHeight, mobileMenuHeaderHeight, isPortraitWatchLayout } =
  storeDefinitionToRefs(useLayoutStore);

const { descMenuData } = storeDefinitionToRefs(useChannelMenuStore);

const refreshKey = ref(Date.now());

const originDefaultHeight = 600;
const defaultHeight = ref(originDefaultHeight);
const popupHeight = ref(originDefaultHeight);

type TabType = 'description' | 'channel';

const tabList = computed(() => {
  const list: Array<{ label: string; value: TabType }> = [];

  if (isPortraitWatchLayout.value && descMenuData.value.visible) {
    list.push({
      label: descMenuData.value.label || translate('menu.tabName.desc'),
      value: 'description',
    });
  }

  if (teacherInfo.value?.anchorEnabled) {
    list.push({
      label: translate('anchor.tab.channel.label'),
      value: 'channel',
    });
  }

  return list;
});

const hasTab = (value: TabType) => {
  return tabList.value.some(item => item.value === value);
};

const currentTab = ref<TabType | undefined>();

const channelTotal = ref(0);

function show() {
  if (anchorPopupVisible.value) {
    return;
  }

  if (tabList.value.length > 0) {
    currentTab.value = tabList.value[0].value;
  } else {
    currentTab.value = undefined;
  }

  if (!isPortraitWatchLayout.value) {
    defaultHeight.value = mobileLayoutBottomHeight.value + mobileMenuHeaderHeight.value;
  }

  popupHeight.value = defaultHeight.value;
  refreshKey.value = Date.now();
  anchorPopupVisible.value = true;
}

function hide() {
  anchorPopupVisible.value = false;
}

const onChangeTab = (value: TabType) => {
  currentTab.value = value;
};

function onScrollEvent(scrollTop: number) {
  const maxHeight = pageClientHeight.value;

  let height = defaultHeight.value + scrollTop;
  if (height > maxHeight) {
    height = maxHeight;
  }
  popupHeight.value = Math.max(height, popupHeight.value);
}

function openPopup() {
  show();
}

useEventBusListener(appEvents.global.OpenAnchorPopup, () => {
  openPopup();
});
</script>

<style lang="scss">
.c-anchor-popup {
  background: none !important;
}
.c-anchor-popup__back {
  position: absolute;
  top: 12px;
  left: 16px;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  font-size: 20px;
  color: #fff;
  pointer-events: initial;
  background: rgba(#000, 0.2);
  border: 1px solid rgba(#fff, 0.2);
  border-radius: 50%;

  span {
    display: flex;
  }
}
.c-anchor-popup__body {
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
}
.c-anchor-popup__info {
  position: relative;
  z-index: 5;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  justify-content: flex-end;
  height: 180px;
  padding: 0 16px 36px;
  margin-bottom: -16px;
  background: linear-gradient(
    180deg,
    rgba(0, 0, 0, 0) 0%,
    rgba(0, 0, 0, 0.4) 39%,
    rgba(0, 0, 0, 0.8) 91%
  );
}

.c-anchor-popup__content {
  position: relative;
  z-index: 10;
  display: flex;
  flex: 1;
  flex-direction: column;
  height: 60vh;
  overflow: hidden;
  background: #f0f0f0;
  border-radius: 16px 16px 0 0;
}

.c-anchor-popup__tabs {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  height: 52px;
  padding: 0 8px;
}

.c-anchor-popup__tab-item {
  position: relative;
  box-sizing: border-box;
  min-width: 88px;
  height: 40px;
  padding: 7px 12px 0;
  font-size: 16px;
  line-height: 22px;
  color: rgba(#000, 0.4);

  span {
    font-size: 12px;
    font-weight: initial;
    color: rgba(#000, 0.4);
  }

  &.is-active {
    font-weight: bold;
    color: rgba(#000, 0.8);

    &::after {
      position: absolute;
      bottom: 2px;
      left: 50%;
      width: 16px;
      height: 2px;
      content: '';
      background-color: #3f76fc;
      border-radius: 2px;
      transform: translateX(-50%);
    }
  }
}

.c-anchor-popup__tab-content {
  flex: 1;
  overflow: hidden;
}
</style>
