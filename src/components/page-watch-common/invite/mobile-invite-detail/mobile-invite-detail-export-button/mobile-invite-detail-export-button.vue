<template>
  <div class="c-mobile-invite-detail-popup__content__bottom">
    <!-- 初始状态 -->
    <div
      v-if="!detailLoadStatus"
      :class="[
        'c-mobile-invite-detail-popup__content__bottom__button',
        'c-mobile-invite-detail-popup__content__bottom__button--disabled',
      ]"
    >
      <span>{{ $lang('invite.detail.download') }}</span>
    </div>

    <template v-else>
      <!-- 未开始下载任务 或 下载任务出错 -->
      <div
        v-if="
          detailLoadStatus.type === InviteDetailLoadStatus.UnInit ||
          detailLoadStatus.type === InviteDetailLoadStatus.Error
        "
        :class="['c-mobile-invite-detail-popup__content__bottom__button']"
        @click="handleDownloadDetail"
      >
        <mobile-invite-detail-export-button-loading
          v-if="detailStatusLoading"
          class="c-mobile-invite-detail-popup__content__bottom__loading"
        />
        <span>{{ $lang('invite.detail.download') }}</span>
      </div>

      <!-- 下载任务处理中 -->
      <div
        v-else-if="detailLoadStatus.type === InviteDetailLoadStatus.Loading"
        :class="[
          'c-mobile-invite-detail-popup__content__bottom__button',
          'c-mobile-invite-detail-popup__content__bottom__button--disabled',
        ]"
      >
        <mobile-invite-detail-export-button-loading
          class="c-mobile-invite-detail-popup__content__bottom__loading"
        />
        <span>{{ $lang('invite.detail.downloading') }}</span>
        <span>...</span>
      </div>

      <!-- 下载任务完成 -->
      <template v-else-if="detailLoadStatus.type === InviteDetailLoadStatus.Complete">
        <div
          :class="[
            'c-mobile-invite-detail-popup__content__bottom__button',
            'c-mobile-invite-detail-popup__content__bottom__button--operate',
          ]"
          @click="handleDownloadDetail"
        >
          <mobile-invite-detail-export-button-loading
            v-if="detailStatusLoading"
            is-blue-theme
            class="c-mobile-invite-detail-popup__content__bottom__loading"
          />
          <span>{{ $lang('invite.detail.reDownload') }}</span>
        </div>

        <div
          :class="['c-mobile-invite-detail-popup__content__bottom__button']"
          @click="handleSaveDetail"
        >
          <span>{{ $lang('invite.detail.save') }}</span>
        </div>
      </template>
    </template>
  </div>
</template>

<script setup lang="ts">
import { useInviteDetail } from '../_hooks/use-invite-detail';
import { InviteDetailLoadStatus } from '@polyv/live-watch-sdk';
import MobileInviteDetailExportButtonLoading from './mobile-invite-detail-export-button-loading.vue';

const {
  detailStatusLoading,
  detailLoadStatus,
  getInviteDetailExportStatus,
  stopPollDetailExportStatus,
  isWaitStatusFirstGet,
  handleDownloadDetail,
  handleSaveDetail,
} = useInviteDetail();

function init() {
  isWaitStatusFirstGet.value = true;
  getInviteDetailExportStatus();
}

function destroy() {
  stopPollDetailExportStatus();
}

defineExpose({
  init,
  destroy,
});
</script>

<style lang="scss">
.c-mobile-invite-detail-popup__content__bottom {
  box-sizing: border-box;
  display: flex;
  gap: 16px;
  align-items: center;
  justify-content: space-evenly;
  padding: 16px;
  background: #fff;
  @include iphone-x-pb(16px);
}

.c-mobile-invite-detail-popup__content__bottom__button {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  height: 40px;
  font-size: 14px;
  color: #fff;
  background: linear-gradient(97deg, #ff5031 0%, #ff9e63 98%);
  border: 1px solid transparent;
  border-radius: 24px;
}

.c-mobile-invite-detail-popup__content__bottom__button--medium {
  width: 166px;
  height: 48px;
}

.c-mobile-invite-detail-popup__content__bottom__button--operate {
  color: #ff5252;
  background: #fff;
  border: 1px solid #ff5252;
}

.c-mobile-invite-detail-popup__content__bottom__button--disabled {
  background: rgba(#ff5252, 0.5);
}

.c-mobile-invite-detail-popup__content__bottom__loading {
  margin-right: 4px;
}
</style>
