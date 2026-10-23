<!-- @file 竖屏端聊天室文件分享消息 -->
<template>
  <portrait-msg-container class="c-portrait-file-msg">
    <div
      class="c-portrait-file-msg__content pws-dark-basic-bg-10 pws-light-basic-bg-40"
      @click="toDownloadFile"
    >
      <div
        class="c-portrait-file-msg__icon"
        :class="{
          'c-portrait-file-msg__icon--doc': ['doc', 'docx'].includes(fileSuffix),
          'c-portrait-file-msg__icon--ppt': ['ppt', 'pptx'].includes(fileSuffix),
          'c-portrait-file-msg__icon--xls': ['xls', 'xlsx'].includes(fileSuffix),
          'c-portrait-file-msg__icon--pdf': ['pdf'].includes(fileSuffix),
        }"
      ></div>

      <span>{{ fileName }}</span>
    </div>
  </portrait-msg-container>
</template>

<script setup lang="ts">
import PortraitMsgContainer from '../_msg-container/portrait-msg-container.vue';
import { useFileMsg } from './use-file-msg';

const { fileName, fileSuffix, toDownloadFile } = useFileMsg();
</script>

<style lang="scss">
.c-portrait-file-msg__content {
  display: flex;
  padding: 7px 8px;
  line-height: 20px;
  cursor: pointer;
  border-radius: 8px;

  span {
    @include multiline-text;
  }
}
.c-portrait-file-msg__icon {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  margin-right: 8px;
  background-repeat: no-repeat;
  background-size: contain;
}
.c-portrait-file-msg__icon--doc {
  background-image: url(./imgs/icon_doc.svg);
}
.c-portrait-file-msg__icon--ppt {
  background-image: url(./imgs/icon_ppt.svg);
}
.c-portrait-file-msg__icon--xls {
  background-image: url(./imgs/icon_xls.svg);
}
.c-portrait-file-msg__icon--pdf {
  background-image: url(./imgs/icon_pdf.svg);
}
</style>
