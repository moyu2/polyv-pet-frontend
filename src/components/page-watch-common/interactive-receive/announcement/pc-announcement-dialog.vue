<!-- @file PC 端公告弹层 -->
<template>
  <pc-dialog
    ref="dialogRef"
    class="c-pc-announcement-dialog"
    draggable
    :visible.sync="announcementVisible"
    :title="announcementTitle"
    :mask="false"
    :mount-el="dialogMountEl"
    :position-computed-elem="positionComputedElem"
    @closed="onCloseDialog"
  >
    <iar-pc-bulletin
      ref="announcementRef"
      :announcement-sdk="announcementSdk"
      @show-detail-from-socket="onShowDetailFromSocket"
      @hide="setAnnouncementVisible(false)"
      @title-change="onTitleChange"
      @has-bulletin="onHasBulletin"
    />
  </pc-dialog>
</template>

<script setup lang="ts">
import PcDialog from '@/components/common-base/dialog/pc-dialog/pc-dialog.vue';
import { getIarComponent } from '@/components/page-watch-common/interactive-receive/load-iar-ui';
import { useAnnouncement } from './hooks/use-announcement';
import { useComputePcDialogForPlayer } from '@/hooks/business/use-compute-pc-dialog-for-player/use-compute-pc-dialog-for-player';

const IarPcBulletin = getIarComponent('PcBulletin');

const {
  announcementRef,
  announcementSdk,
  announcementVisible,
  announcementTitle,
  onTitleChange,
  setAnnouncementVisible,
  onShowDetailFromSocket,
  onCloseDialog,
  onHasBulletin,
} = useAnnouncement();

const {
  dialogRef,

  dialogMountEl,
  positionComputedElem,
} = useComputePcDialogForPlayer();
</script>
