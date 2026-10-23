<!-- @file PC 端底部菜单栏 -->
<template>
  <div
    v-if="bottomMenuList.length"
    class="c-pc-watch-bottom-menu"
    :class="useNewTheme ? [] : [skinColorIgnoreClass]"
  >
    <pc-normal-tabs
      v-model="pcBottomTabCurrentName"
      ref="pcBottomMenuRef"
    >
      <template v-for="(menu, index) in bottomMenuList">
        <!-- 直播介绍 -->
        <pc-normal-tab-pane
          v-if="menu.menuType === ChannelMenuType.Desc"
          :key="`decs-${index}`"
          :label="menu.name"
          :name="menu.menuUniqueKey"
          lazy-load
        >
          <pc-rich-text-render
            :html-content="channelDescription"
            :should-compress-imgs="compressImageEnabled"
          />
        </pc-normal-tab-pane>

        <!-- 回放 -->
        <pc-normal-tab-pane
          v-if="
            menu.menuType === ChannelMenuType.Previous &&
            ![LiveStatus.Live, LiveStatus.Stop].includes(liveStatus)
          "
          :key="`playback-${index}`"
          :label="menu.name"
          :name="menu.menuUniqueKey"
          lazy-load
        >
          <pc-playback-list />
        </pc-normal-tab-pane>

        <!-- 自定义图文 -->
        <pc-normal-tab-pane
          v-if="menu.menuType === ChannelMenuType.Text"
          :key="`text-${index}`"
          :label="menu.name"
          :name="menu.menuUniqueKey"
          lazy-load
        >
          <pc-rich-text-render :html-content="menu.content" />
        </pc-normal-tab-pane>

        <!-- 图文直播 -->
        <pc-normal-tab-pane
          v-if="menu.menuType === ChannelMenuType.Tuwen"
          :key="`tuwen-${index}`"
          :label="menu.name"
          :name="menu.menuUniqueKey"
          lazy-load
        >
          <pc-tuwen-live v-if="iarSdkLoaded" />
        </pc-normal-tab-pane>

        <!-- 推广外链 -->
        <pc-normal-tab-pane
          v-if="menu.menuType === ChannelMenuType.Iframe"
          :key="`iframe-${index}`"
          :label="menu.name"
          :name="menu.menuUniqueKey"
          hack-weixin-btn
        >
          <template #default="{ weixinBtnId }">
            <pc-promote-external-link
              :content="menu.content"
              :link-type="menu.linkType"
              :open-type="menu.iframeOpenType"
              :weixin-btn-selector="weixinBtnId"
              :is-active="pcBottomTabCurrentName === menu.menuId"
            />
          </template>
        </pc-normal-tab-pane>

        <!-- 多会场列表（竖向） for 主会场 -->
        <pc-normal-tab-pane
          v-if="menu.menuType === ChannelMenuType.MultiMeeting && !isSubChannel"
          :key="`multi-meeting-${index}`"
          :label="menu.name"
          :name="menu.menuUniqueKey"
          lazy-load
        >
          <pc-multi-meeting-portrait />
        </pc-normal-tab-pane>

        <!-- 云席 -->
        <pc-normal-tab-pane
          v-if="menu.menuType === ChannelMenuType.Seat"
          :key="`seat-${index}`"
          :label="menu.name"
          :name="menu.menuUniqueKey"
          lazy-load
        >
          <pc-seat-table />
        </pc-normal-tab-pane>
      </template>

      <!-- 多会场列表（竖向） for 分会场 -->
      <pc-normal-tab-pane
        v-if="multiMeetingMenuData.visible && isSubChannel"
        :label="multiMeetingMenuData.label"
        :name="TAB_NAME_MULTI_MEETING"
        lazy-load
      >
        <pc-multi-meeting-portrait />
      </pc-normal-tab-pane>
    </pc-normal-tabs>
  </div>
</template>

<script setup lang="ts">
import { computed, unref, onMounted, ref, watch, nextTick } from 'vue';

import {
  TAB_NAME_PLAYBACK,
  TAB_NAME_TUWEN_LIVE,
  TAB_NAME_MULTI_MEETING,
  TAB_NAME_SEAT,
} from '@/assets/constants/tab-name';
import PcNormalTabs from '@/components/common-base/tabs/pc-normal-tabs/pc-normal-tabs.vue';
import PcNormalTabPane from '@/components/common-base/tabs/pc-normal-tabs/pc-normal-tab-pane.vue';
import PcRichTextRender from '@/components/common-base/rich-text-render/pc-rich-text-render.vue';
import PcTuwenLive from '@/components/page-watch-common/interactive-receive/tuwen-live/pc-tuwen-live.vue';
import PcPromoteExternalLink from '@/components/page-watch-common/promote-external-link/pc-promote-external-link.vue';
import PcPlaybackList from '@/components/page-watch-common/playback-list/pc-playback-list/pc-playback-list.vue';
import PcMultiMeetingPortrait from '@/components/page-watch-common/multi-meeting/pc-multi-meeting/pc-multi-meeting-portrait.vue';
import PcSeatTable from '@/components/page-watch-common/interactive-receive/seat-table/pc-seat-table.vue';
import { TabsInstance } from '@/components/common-base/tabs/hooks/types';

import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useChannelStore } from '@/store/use-channel-store';
import { useChannelMenuStore } from '@/store/use-channel-menu-store';
import {
  ChannelMenuItem,
  ChannelMenuType,
  DescShowPosition,
  LiveStatus,
} from '@polyv/live-watch-sdk';
import { useChannelInfoStore } from '@/store/use-channel-info-store';
import { useLayoutStore } from '@/store/use-layout-store';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';

import { useQueryParams } from '@/hooks/core/use-query-params';
import { useLangStore } from '@/store/use-lang-store';
import { useSkinColorIgnore } from '@polyv/vue-components';
import { useWatchAppStore } from '@/store/use-watch-app-store';

const { skinColorIgnoreClass } = useSkinColorIgnore();

const { paramGetter } = useQueryParams();

const { useNewTheme } = storeDefinitionToRefs(useWatchAppStore);

const { channelDescription } = storeDefinitionToRefs(useChannelInfoStore);
const { liveStatus, compressImageEnabled, descShowPosition } =
  storeDefinitionToRefs(useChannelStore);
const { channelMenus, multiMeetingMenuData, isSubChannel } =
  storeDefinitionToRefs(useChannelMenuStore);
const { pcBottomTabCurrentName } = storeDefinitionToRefs(useLayoutStore);
const { iarSdkLoaded } = storeDefinitionToRefs(useInteractReceiveStore);
const { currentLang } = storeDefinitionToRefs(useLangStore);

type BottomMenuItem = ChannelMenuItem & { menuUniqueKey: string };

/** 底部菜单栏列表 */
const bottomMenuList = computed<BottomMenuItem[]>(() => {
  // 需要保留展示的菜单类型
  const remainTypeConfig: { [key: string]: string | null } = {
    [ChannelMenuType.Desc]: ChannelMenuType.Desc,
    [ChannelMenuType.Previous]: TAB_NAME_PLAYBACK,
    [ChannelMenuType.Text]: null,
    [ChannelMenuType.Tuwen]: TAB_NAME_TUWEN_LIVE,
    [ChannelMenuType.Iframe]: null,
    [ChannelMenuType.Seat]: TAB_NAME_SEAT,
  };

  if (multiMeetingMenuData.value.visible) {
    remainTypeConfig[ChannelMenuType.MultiMeeting] = TAB_NAME_MULTI_MEETING;
  }

  const remainTypes = Object.keys(remainTypeConfig);

  // 这里要先从 channelMenus 去过滤，才能确保菜单顺序和后台配置的一致
  const menus: BottomMenuItem[] = unref(channelMenus)
    .filter(menu => {
      // PC观看页介绍位置为右侧菜单时，直播介绍不进底部菜单
      if (
        menu.menuType === ChannelMenuType.Desc &&
        unref(descShowPosition) === DescShowPosition.AsideMenu
      ) {
        return false;
      }
      return remainTypes.includes(menu.menuType);
    })
    .map(i => {
      return {
        ...i,
        menuUniqueKey: remainTypeConfig[i.menuType] || i.menuId,
      };
    });

  return menus;
});

const pcBottomMenuRef = ref<TabsInstance>();

onMounted(() => {
  const playBackVid = paramGetter().playBackVid();
  if (playBackVid) {
    const hasPlayBack = bottomMenuList.value.findIndex(
      item => item.menuType === ChannelMenuType.Previous,
    );
    if (hasPlayBack === -1) return;

    if ([LiveStatus.Live, LiveStatus.Stop].includes(liveStatus.value)) {
      return;
    }

    pcBottomMenuRef.value?.setDefaultTabName(TAB_NAME_PLAYBACK);
  }
});

watch(
  () => currentLang.value,
  () => {
    nextTick(() => {
      const existItem = bottomMenuList.value.find(
        i => i.menuUniqueKey === pcBottomTabCurrentName.value,
      );
      if (!existItem) {
        pcBottomMenuRef.value?.setDefaultTabName('');
      }
    });
  },
);

watch(
  () => liveStatus.value,
  () => {
    if (!pcBottomMenuRef.value) return;

    if ([LiveStatus.Live, LiveStatus.Stop].includes(liveStatus.value)) {
      pcBottomMenuRef.value.setDefaultTabName('');
    }
  },
);
</script>
