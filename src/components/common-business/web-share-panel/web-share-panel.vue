<!-- @file PC 端 Web 平台分享面板组件 -->
<template>
  <div class="c-web-share-panel">
    <div class="c-web-share-panel__main">
      <div class="c-web-share-panel__main__list">
        <a
          v-for="(item, index) in webShareList"
          :key="index"
          class="c-web-share-panel__main__list__item"
          :href="item.url"
          target="_blank"
          rel="noopener"
        >
          <div
            class="c-web-share-panel__main__list__item__icon"
            :style="{
              backgroundImage: `url(${item.icon})`,
            }"
          ></div>
          <div class="c-web-share-panel__main__list__item__title">{{ item.title }}</div>
        </a>
      </div>

      <div class="c-web-share-panel__main__url">
        <input
          type="text"
          class="c-web-share-panel__main__url__input"
          readonly
          :value="shareWatchUrl"
        />
        <div
          class="c-web-share-panel__main__url__button"
          @click="copyShareWatchUrl"
        >
          {{ $lang('copy.link') }}
        </div>
      </div>
    </div>

    <div class="c-web-share-panel__qrcode">
      <div class="c-web-share-panel__qrcode__img">
        <img :src="shareQrCodeUrl" />
      </div>
      <p class="c-web-share-panel__qrcode__tips">
        <i class="c-web-share-panel__qrcode__icon"></i>
        <span class="c-web-share-panel__qrcode__text">{{ $lang('share.wxScan') }}</span>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useShareStore } from '@/store/use-share-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useCopyText } from '@/assets/utils/copy';

const { shareWatchUrl, webShareList, shareQrCodeUrl } = storeDefinitionToRefs(useShareStore);

const shareStore = useShareStore();

const { copyText, toastCopySuccess } = useCopyText();

/** 复制分享的观看页地址 */
async function copyShareWatchUrl() {
  await copyText(shareStore.shareWatchUrl);
  toastCopySuccess();
}
</script>

<style lang="scss">
.c-web-share-panel {
  display: flex;
  padding: 32px 0;
  color: $--font-color-primary;
  background: #fff;
  border-radius: 5px;
  box-shadow: $--shadow-dialog;
}

.c-web-share-panel__main {
  flex-shrink: 0;
  padding: 0 32px;
}

.c-web-share-panel__main__list {
  display: flex;
}

.c-web-share-panel__main__list__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 58px;
  text-decoration: none;

  &:not(:nth-child(1)) {
    margin-left: 14px;
  }
}

.c-web-share-panel__main__list__item__icon {
  width: 40px;
  height: 40px;
  background-repeat: no-repeat;
  background-size: 100% 100%;
}

.c-web-share-panel__main__list__item__title {
  margin-top: 6px;
  font-size: 14px;
  line-height: 17px;
  color: $--font-color-primary;
  text-align: center;
  white-space: nowrap;
}

.c-web-share-panel__main__url {
  box-sizing: border-box;
  display: flex;
  height: 32px;
  margin-top: 24px;
  overflow: hidden;
  border: 1px solid $--border-color-primary;
  border-radius: 2px;
}

.c-web-share-panel__main__url__input {
  flex: 1;
  padding: 0 9px;
  font-size: 12px;
  color: #888;
  background: #f4f4f4;
  border: none;
  outline: none;
}

.c-web-share-panel__main__url__button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  cursor: pointer;
  background: $--color-white;
}

.c-web-share-panel__main + .c-web-share-panel__qrcode {
  border-left: 1px solid $--border-color-primary;
}

.c-web-share-panel__qrcode {
  padding: 0 32px;
}

.c-web-share-panel__qrcode__img {
  position: relative;
  width: 94px;
  height: 94px;
  overflow: hidden;

  img {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 100px;
    height: 100px;
    transform: translate(-50%, -50%);
  }
}

.c-web-share-panel__qrcode__tips {
  display: flex;
  align-items: center;
  width: 94px;
  margin-top: 8px;
  font-size: 14px;
}

.c-web-share-panel__qrcode__icon {
  width: 18px;
  height: 18px;
  margin-right: 4px;
  background-image: url(./imgs/icon-share-wechat.png);
  background-position: center;
  background-size: cover;
}

.c-web-share-panel__qrcode__text {
  flex: 1;
}
</style>
