<!-- @file 移动端横屏-云席“我的”收藏弹窗 -->

<template>
  <mobile-popup
    class="c-mobile-seat-table-follower-popup"
    :visible.sync="visible"
    :show-header="false"
    fill-body-section
  >
    <mobile-popup-tabs
      v-if="visible"
      v-model="tabName"
    >
      <mobile-popup-tab-pane
        :label="$lang('seatTable.myInfo')"
        name="my-info"
      >
        <template v-if="seatInfo">
          <div class="c-mobile-seat-table-follower-popup__user">
            <img
              class="c-mobile-seat-table-follower-popup__user__avatar"
              :src="avatar"
            />
            <div class="c-mobile-seat-table-follower-popup__user__right">
              <div class="c-mobile-seat-table-follower-popup__user__nick g-singleline">
                {{ nickname }}
              </div>
              <div
                v-if="seatInfo.position"
                class="c-mobile-seat-table-follower-popup__user__position g-singleline"
              >
                {{ seatInfo.position }}
              </div>
            </div>
          </div>
          <div
            v-if="seatInfo.intro"
            class="c-mobile-seat-table-follower-popup__intro"
          >
            {{ seatInfo.intro }}
          </div>
        </template>
      </mobile-popup-tab-pane>

      <mobile-popup-tab-pane
        :label="$lang('seatTable.follow')"
        name="follow"
      >
        <iar-mobile-seat-follow-list
          ref="followRef"
          :seat-table-sdk="seatTableSdk"
          type="follow"
          :empty-text="$lang('base.noData')"
          @show-user-card="onShowUserCard"
        />
      </mobile-popup-tab-pane>

      <mobile-popup-tab-pane
        :label="$lang('seatTable.beFollowed')"
        name="beFollowed"
      >
        <iar-mobile-seat-follow-list
          ref="beFollowedRef"
          :seat-table-sdk="seatTableSdk"
          type="befollow"
          :empty-text="$lang('base.noData')"
          @show-user-card="onShowUserCard"
        />
      </mobile-popup-tab-pane>
    </mobile-popup-tabs>
  </mobile-popup>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { appEvents, useEventBusListener } from '@/app/app-events';

import MobilePopup from '@/components/common-base/popup/mobile-popup.vue';
import MobilePopupTabs from '@/components/common-base/tabs/mobile-popup-tabs/mobile-popup-tabs.vue';
import MobilePopupTabPane from '@/components/common-base/tabs/mobile-popup-tabs/mobile-popup-tab-pane.vue';
import { getIarComponent } from '@/components/page-watch-common/interactive-receive/load-iar-ui';

import { useSimpleVisible } from '@/hooks/behaviors/use-simple-visible';

import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useViewerStore } from '@/store/use-viewer-store';

import { useSeatTable } from '../use-seat-table';

const IarMobileSeatFollowList = getIarComponent('MobileSeatFollowList');

const { seatTableSdk, onShowUserCard } = useSeatTable();

const { seatInfo, avatar, nickname } = storeDefinitionToRefs(useViewerStore);

const { visible, setVisible } = useSimpleVisible(false);

const tabName = ref('my-info');

const followRef = ref();

const beFollowedRef = ref();

/** 刷新关注列表 */
function refreshFollowerList(type: string) {
  switch (type) {
    case 'follow':
      followRef.value.init();
      break;
    case 'beFollowed':
      beFollowedRef.value.init();
      break;
  }
}

watch(
  () => tabName.value,
  () => {
    refreshFollowerList(tabName.value);
  },
);

useEventBusListener(appEvents.interaction.RefreshSeatTableFollowList, () => {
  if (!visible.value) {
    return;
  }
  refreshFollowerList(tabName.value);
});

useEventBusListener(appEvents.interaction.OpenSeatTableFollowerPopup, (_visible = true) => {
  tabName.value = 'my-info';
  setVisible(_visible);
});
</script>

<style lang="scss">
.c-mobile-seat-table-follower-popup {
  .c-mobile-popup__content {
    border-radius: 8px 8px 0 0 !important;
  }
}

.c-mobile-seat-table-follower-popup__user {
  display: flex;
  align-items: center;
  padding: 32px 24px 20px;
}
.c-mobile-seat-table-follower-popup__user__avatar {
  flex-shrink: 0;
  width: 60px;
  height: 60px;
  margin-right: 12px;
  border-radius: 50%;
}
.c-mobile-seat-table-follower-popup__user__right {
  flex: 1;
  overflow: hidden;
}
.c-mobile-seat-table-follower-popup__user__nick {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}
.c-mobile-seat-table-follower-popup__user__position {
  margin-top: 10px;
  font-size: 12px;
  color: #999;
}
.c-mobile-seat-table-follower-popup__intro {
  padding: 0 24px 32px;
  font-size: 12px;
  color: #666;
  text-indent: 2em;
}
</style>
