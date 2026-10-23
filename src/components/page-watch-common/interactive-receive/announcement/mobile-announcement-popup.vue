<!-- @file 移动端公告弹层 -->
<template>
  <mobile-popup
    class="c-mobile-announcement-popup"
    fill-body-section
    :update-on-resize="true"
    :force-horizontal-screen="mobilePlayerIsPageFullscreen"
    :title="announcementTitle"
    :visible.sync="announcementVisible"
    :backable="listBtnVisible || isShowDetailing"
    @after-leave="onCloseDialog"
    @click-back="onClickBack"
  >
    <template
      v-if="listBtnVisible"
      #back-btn
    >
      <div class="c-mobile-announcement-popup__list-btn">
        {{ $lang('interact.announcement.titleList') }}
      </div>
    </template>

    <iar-mobile-bulletin
      ref="announcementRef"
      :announcement-sdk="announcementSdk"
      @show-detail-from-socket="onShowDetailFromSocket"
      @hide="setAnnouncementVisible(false)"
      @title-change="onTitleChange"
      @look-over="onLookover"
      @has-bulletin="onHasBulletin"
    />
  </mobile-popup>
</template>

<script setup lang="ts">
import MobilePopup from '@/components/common-base/popup/mobile-popup.vue';

import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useLayoutStore } from '@/store/use-layout-store';

import { useAnnouncement } from './hooks/use-announcement';
import { getIarComponent } from '@/components/page-watch-common/interactive-receive/load-iar-ui';

const IarMobileBulletin = getIarComponent('MobileBulletin');

const { mobilePlayerIsPageFullscreen } = storeDefinitionToRefs(useLayoutStore);

const {
  listBtnVisible,
  isShowDetailing,
  announcementRef,
  announcementSdk,
  announcementVisible,
  announcementTitle,
  onTitleChange,
  setAnnouncementVisible,
  onShowDetailFromSocket,
  onCloseDialog,
  onLookover,
  onClickBack,
  onHasBulletin,
} = useAnnouncement();
</script>

<style lang="scss">
.c-mobile-announcement-popup__list-btn {
  padding-left: 16px;
  font-size: 14px;
  color: #666;
}
</style>
