<!-- @file 竖屏公告入口 -->
<template>
  <div class="c-portrait-announcement-entrance">
    <div
      class="c-portrait-announcement-entrance__inner"
      @click="onShowList"
    >
      <span class="c-portrait-announcement-entrance__icon g-img-contain"></span>
      <span class="c-portrait-announcement-entrance__title">
        {{ $lang('interact.announcement.title') }}
      </span>
    </div>

    <div class="c-portrait-announcement-entrance__render">
      <iar-bulletin-bubble
        :announcement-sdk="announcementSdk"
        @show-detail="onShowDetail"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { appEvents } from '@/app/app-events';
import { useGlobalInject } from '@/app/use-global-inject';
import { getIarComponent } from '@/components/page-watch-common/interactive-receive/load-iar-ui';

const IarBulletinBubble = getIarComponent('BulletinBubble');

const { getEmitter, getWatchCore } = useGlobalInject();

const watchCore = getWatchCore();
/** 公告 SDK 实例 */
const announcementSdk = watchCore.interactReceive.getAnnouncement();

function onShowList() {
  getEmitter().emit(appEvents.interaction.OpenBulletinPopup);
}

function onShowDetail(data: unknown) {
  getEmitter().emit(appEvents.interaction.OpenAnnouncementDetail, data);
}
</script>

<style lang="scss">
.c-portrait-announcement-entrance {
  position: relative;
  display: inline-flex;
}
.c-portrait-announcement-entrance__inner {
  display: flex;
  align-items: center;
  height: 20px;
  padding: 0 8px;
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 16px;
}
.c-portrait-announcement-entrance__icon {
  width: 12px;
  height: 12px;
  margin-right: 2px;
  background-image: url(./imgs/icon-bulletin.png);
}
.c-portrait-announcement-entrance__title {
  font-size: 12px;
  color: $--color-white;
  white-space: nowrap;
}

.c-portrait-announcement-entrance__render {
  position: absolute;
  top: 36px;
  right: 0;
  z-index: 30;
  .plv-iar-bulletin__top-bubble-label::before {
    left: 75%;
    margin-left: -10px;
  }
}
</style>
