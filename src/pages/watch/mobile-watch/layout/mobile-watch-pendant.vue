<!-- @file 移动端页面常驻挂件 -->
<template>
  <div
    class="c-mobile-watch-pendant"
    :class="{
      'c-mobile-watch-pendant--qa': mobileMenuCurrentName === TAB_NAME_QA,
      'c-mobile-watch-pendant--seat': mobileMenuCurrentName === TAB_NAME_SEAT,
    }"
  >
    <!-- 邀请海报 -->
    <mobile-invite-poster-entry
      v-if="mobileWatchInvitePendantVisible"
      class="c-mobile-watch-pendant__item"
    />

    <!-- 更多 -->
    <mobile-more-entrance
      v-if="morePendantVisible"
      class="c-mobile-watch-pendant__item"
      :theme="morePendantTheme"
    />

    <!-- 云席挂件 -->
    <mobile-seat-table-pendant
      v-if="mobileMenuCurrentName === TAB_NAME_SEAT"
      class="c-mobile-watch-pendant__item"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import { useInviteStore } from '@/store/use-invite-store';
import { useChannelMenuStore } from '@/store/use-channel-menu-store';
import { useLayoutStore } from '@/store/use-layout-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';

import MobileMoreEntrance from '@/components/page-watch-common/more-popup/mobile-more-entrance/mobile-more-entrance.vue';
import MobileSeatTablePendant from '@/components/page-watch-common/interactive-receive/seat-table/seat-table-pendant/mobile-seat-table-pendant.vue';
import MobileInvitePosterEntry from '@/components/page-watch-common/invite/mobile-invite-poster-entry/mobile-invite-poster-entry.vue';

import { TAB_NAME_INVITE_RANK, TAB_NAME_QA, TAB_NAME_SEAT } from '@/assets/constants/tab-name';
import { ThemeColorMode } from '@/themes/type/theme-color-mode';

const { mobileWatchInvitePendantVisible } = storeDefinitionToRefs(useInviteStore);

const { mobileMenuCurrentName } = storeDefinitionToRefs(useLayoutStore);

const { chatMenuData } = storeDefinitionToRefs(useChannelMenuStore);

const morePendantVisible = computed(() => {
  return !chatMenuData.value.visible;
});

const morePendantTheme = computed(() => {
  // 由于邀请榜菜单颜色过浅，图标必须使用深色
  if (mobileMenuCurrentName.value === TAB_NAME_INVITE_RANK) {
    return ThemeColorMode.Dark;
  }

  return undefined;
});
</script>

<style lang="scss">
.c-mobile-watch-pendant {
  position: absolute;
  right: 16px;
  bottom: 86px;
  z-index: $--zIndex-pendant;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.c-mobile-watch-pendant--qa {
  bottom: 128px;
}

.c-mobile-watch-pendant--seat {
  bottom: 48px;
}

.c-mobile-watch-pendant {
  margin-top: 12px;
}

.c-mobile-watch-pendant__item + .c-mobile-watch-pendant__item {
  margin-top: 12px;
}

.c-mobile-watch-pendant__item--more {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;

  span {
    display: flex;
    font-size: 36px;
  }
}
</style>
