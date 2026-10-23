<!-- @file 竖屏滚动公告 -->
<template>
  <iar-mobile-announcement-bar
    class="c-portrait-announcement-bar"
    v-show="announcementVisible"
    :announcement-sdk="announcementSdk"
    :client-width="clientWidth"
    @to-show="setAnnouncementVisible(true)"
    @to-hide="setAnnouncementVisible(false)"
  />
</template>

<script setup lang="ts">
import { getIarComponent } from '@/components/page-watch-common/interactive-receive/load-iar-ui';
import { useAnnouncement } from './hooks/use-announcement';

const IarMobileAnnouncementBar = getIarComponent('MobileAnnouncementBar');

const clientWidth = document.body.clientWidth;

const { announcementSdk, announcementVisible, setAnnouncementVisible } = useAnnouncement();
</script>
