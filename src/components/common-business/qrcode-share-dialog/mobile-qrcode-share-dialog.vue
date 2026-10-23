<!-- @file Mobile 端 Web 二维码购买弹窗 -->
<template>
  <mobile-dialog
    :visible.sync="visible"
    :title="$lang('qrCodeShareDialog.title')"
    :show-footer="false"
  >
    <div class="c-mobile-qrcode-share-modal">
      <div class="c-mobile-qrcode-share-modal-tip">{{ $lang('qrCodeShareDialog.tip') }}</div>
      <div class="c-mobile-qrcode-share-modal-qrcode-wrap">
        <img
          class="c-mobile-qrcode-share-modal-qrcode"
          :src="shareQrCodeUrl"
          alt=""
        />
      </div>
      <button
        ref="copyBtnRef"
        class="c-mobile-qrcode-share-modal-copy-btn"
        @click="copyShareWatchUrl"
      >
        {{ $lang('qrCodeShareDialog.copyBtnText') }}
      </button>
    </div>
  </mobile-dialog>
</template>

<script lang="ts" setup>
import { useShareStore } from '@/store/use-share-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import MobileDialog from '@/components/common-base/dialog/mobile-dialog/mobile-dialog.vue';
import { useQrcodeShareDialog } from './use-qrcode-share-dialog';
import { useCopyText } from '@/assets/utils/copy';

const { shareQrCodeUrl, shareWatchUrl } = storeDefinitionToRefs(useShareStore);
const { visible } = useQrcodeShareDialog();

const { copyText, toastCopySuccess } = useCopyText();

/** 复制分享的观看页地址 */
async function copyShareWatchUrl() {
  await copyText(shareWatchUrl.value);
  toastCopySuccess();
}
</script>

<style lang="scss">
.c-mobile-qrcode-share-modal {
  padding: 20px 40px 32px;
  font-size: 14px;

  .c-mobile-qrcode-share-modal-tip {
    margin-bottom: 12px;
    color: rgba(0, 0, 0, 0.4);
    text-align: center;
  }

  .c-mobile-qrcode-share-modal-qrcode-wrap {
    width: 200px;
    height: 200px;
    padding: 12px;
    margin: auto;
    border: 1px solid #cccccc;
    border-radius: 4px;
  }

  .c-mobile-qrcode-share-modal-qrcode {
    display: block;
    width: 100%;
    height: 100%;
  }

  .c-mobile-qrcode-share-modal-copy-btn {
    display: block;
    width: 100%;
    height: 40px;
    margin-top: 12px;
    line-height: 40px;
    color: #fff;
    background: #f15d5d;
    border: 1px solid #f15d5d;
    border-radius: 40px;
    outline: none;
  }
}
</style>
