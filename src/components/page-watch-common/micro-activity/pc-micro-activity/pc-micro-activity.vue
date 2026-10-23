<!-- @file pc端-微活动 -->
<template>
  <div class="c-pc-micro-activity">
    <iframe
      v-if="iframeUrl"
      ref="microActivityIframeRef"
      class="c-pc-micro-activity__iframe"
      :src="iframeUrl"
    ></iframe>
    <transition name="fade">
      <section
        v-show="isShowQrcode"
        class="c-pc-micro-activity__modal g-mask"
      >
        <div class="c-pc-micro-activity__modal-wrapper">
          <div class="c-pc-micro-activity__modal-content">
            <div class="c-pc-micro-activity__modal-header">
              <h1>{{ $lang('microActivity.wechatScan') }}</h1>
            </div>
            <div class="c-pc-micro-activity__modal-body">
              <div
                class="c-pc-micro-activity__modal-body__border_corner c-pc-micro-activity__modal-body__border_corner_left_top"
              ></div>
              <div
                class="c-pc-micro-activity__modal-body__border_corner c-pc-micro-activity__modal-body__border_corner_right_top"
              ></div>
              <div
                class="c-pc-micro-activity__modal-body__border_corner c-pc-micro-activity__modal-body__border_corner_left_bottom"
              ></div>
              <div
                class="c-pc-micro-activity__modal-body__border_corner c-pc-micro-activity__modal-body__border_corner_right_bottom"
              ></div>
              <div class="img-wrapper">
                <img
                  :src="shareQrCodeUrl"
                  alt="观看页二维码"
                />
              </div>
            </div>
          </div>
          <div
            class="i-close-modal-pc c-pc-micro-activity__modal__close-btn"
            @click="handleModalClose"
          ></div>
        </div>
      </section>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { PropUtils } from '@polyv/vue-components';
import { useShareStore } from '@/store/use-share-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { onMounted, ref, watch } from 'vue';

import { useMicroActivityHook } from '../hooks/use-micro-activity';

const { shareQrCodeUrl } = storeDefinitionToRefs(useShareStore);

const {
  microActivityIframeRef,
  iframeUrl,

  updateIframeUrl,
} = useMicroActivityHook({
  onlyMobileMessageHandler,
});

const props = defineProps({
  isActive: PropUtils.bool.def(false),
});

/** 是否展示二维码 */
const isShowQrcode = ref(false);

watch(
  () => props.isActive,
  () => {
    if (props.isActive) {
      updateIframeUrl();
    }
  },
  {
    immediate: true,
  },
);

onMounted(() => {
  updateIframeUrl();
});

function onlyMobileMessageHandler() {
  isShowQrcode.value = true;
}

function handleModalClose() {
  isShowQrcode.value = false;
}
</script>

<style lang="scss">
.c-pc-micro-activity {
  width: 100%;
  height: 100%;
}
.c-pc-micro-activity__iframe {
  width: 100%;
  height: 100%;
  overflow: auto;
  border: none;
  -webkit-overflow-scrolling: touch;
}

.c-pc-micro-activity__modal {
  position: absolute;
}

.c-pc-micro-activity__modal-wrapper {
  position: absolute;
  top: 40%;
  left: 50%;

  width: 240px;
  height: 240px;

  overflow: inherit;
  transform: translate(-50%, -50%);
}

.c-pc-micro-activity__modal-content {
  box-sizing: border-box;
  display: inline-block;
  padding: 24px 16px 30px 16px;

  overflow: hidden;

  font-size: 16px;
  color: #333333;
  text-align: center;
  background: linear-gradient(135deg, #ffffff 0%, #dff6ff 100%);

  border-radius: 4px;
}

.c-pc-micro-activity__modal-header {
  display: inline-block;
  margin-bottom: 14px;

  word-break: keep-all;
}

.c-pc-micro-activity__modal-body {
  position: relative;

  display: inline-block;
  width: 70%;
  height: 70%;
  padding: 6px;
  .img-wrapper {
    width: 100%;
    height: 100%;
    background: #fff;
    border: 1px solid #4ed1ff;

    img {
      width: 100%;
      height: 100%;
      object-fit: none;
      transform: scale(0.9);
    }
  }
}

.c-pc-micro-activity__modal-body__border_corner {
  position: absolute;
  width: 16px;
  height: 16px;
  border: 1px solid #4ed1ff;
}
.c-pc-micro-activity__modal-body__border_corner_left_top {
  top: 0;
  left: 0;
  border-right: none;
  border-bottom: none;
  // border-top-left-radius: 4px;
}
.c-pc-micro-activity__modal-body__border_corner_right_top {
  top: 0;
  right: 0;
  border-bottom: none;
  border-left: none;
  // border-top-right-radius: 4px;
}
.c-pc-micro-activity__modal-body__border_corner_left_bottom {
  bottom: 0;
  left: 0;
  border-top: none;
  border-right: none;
  // border-bottom-left-radius: 4px;
}
.c-pc-micro-activity__modal-body__border_corner_right_bottom {
  right: 0;
  bottom: 0;
  border-top: none;
  border-left: none;
  // border-bottom-right-radius: 4px;
}

.c-pc-micro-activity__modal__close-btn {
  position: absolute;
  top: 118%;
  left: 50%;
  z-index: -1;
  box-sizing: border-box;
  width: 40px;
  height: 40px;

  cursor: pointer;
  background-image: url('./imgs/icon_close.png');

  background-position: center;
  background-size: 40px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 50%;
  transform: translate(-50%, -50%);
}

.c-pc-micro-activity__modal__close-btn::before {
  position: relative;
  top: -20px;
  display: block;
  height: 1px;
  content: '';
  background-color: rgba(255, 255, 255, 0.5);
  transform: rotate(90deg);
}
</style>
