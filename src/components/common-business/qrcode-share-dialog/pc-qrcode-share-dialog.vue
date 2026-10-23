<!-- @file PC 端 Web 二维码购买弹窗 -->
<template>
  <pc-dialog
    :visible.sync="visible"
    :width="400"
    :title="$lang('qrCodeShareDialog.title')"
  >
    <div class="c-pc-qrcode-share-modal">
      <div class="c-pc-qrcode-share-modal-top">
        <span class="c-pc-qrcode-share-modal-label">{{
          $lang('qrCodeShareDialog.linkLabel')
        }}</span>
        <div class="c-pc-qrcode-share-modal-input-box">
          <input
            class="c-pc-qrcode-share-modal-input"
            type="text"
            :value="shareWatchUrl"
            disabled
          />
          <button
            ref="copyBtnRef"
            class="c-pc-qrcode-share-modal-copy-btn"
            @click="copyShareWatchUrl"
          >
            {{ $lang('qrCodeShareDialog.shortCopyBtnText') }}
          </button>
        </div>
      </div>
      <div class="c-pc-qrcode-share-modal-qrcode-wrap">
        <img
          class="c-pc-qrcode-share-modal-qrcode"
          :src="shareQrCodeUrl"
          alt=""
        />
      </div>
      <div class="c-pc-qrcode-share-modal-tip">
        {{ $lang('qrCodeShareDialog.tip2') }}
      </div>
    </div>
  </pc-dialog>
</template>

<script lang="ts" setup>
import { useShareStore } from '@/store/use-share-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import PcDialog from '@/components/common-base/dialog/pc-dialog/pc-dialog.vue';
import { useQrcodeShareDialog } from './use-qrcode-share-dialog';
import { useCopyText } from '@/assets/utils/copy';

const { shareWatchUrl, shareQrCodeUrl } = storeDefinitionToRefs(useShareStore);
const { visible } = useQrcodeShareDialog();

const { copyText, toastCopySuccess } = useCopyText();

/** 复制分享的观看页地址 */
async function copyShareWatchUrl() {
  await copyText(shareWatchUrl.value);
  toastCopySuccess();
}
</script>

<style lang="scss">
.c-pc-qrcode-share-modal {
  padding: 24px;
  font-size: 14px;

  .c-pc-qrcode-share-modal-top {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
  }

  .c-pc-qrcode-share-modal-label {
    flex-shrink: 0;
    margin-right: 12px;
    font-size: 12px;
    color: #3d3d3d;
  }

  .c-pc-qrcode-share-modal-input-box {
    display: flex;
    flex-grow: 1;
    align-items: center;
  }

  .c-pc-qrcode-share-modal-input {
    flex-grow: 1;
    height: 32px;
    padding: 0 12px;
    line-height: 32px;
    color: #9aa4b3;
    background: #f7f8fa;
    border: none;
    border-radius: 4px 0 0 4px;
    outline: none;
  }

  .c-pc-qrcode-share-modal-copy-btn {
    flex-shrink: 0;
    height: 32px;
    padding: 0 12px;
    color: #fff;
    cursor: pointer;
    background: #1755ee;
    border: 1px solid #1755ee;
    border-radius: 0 4px 4px 0;
    outline: none;
  }

  .c-pc-qrcode-share-modal-qrcode-wrap {
    width: 200px;
    height: 200px;
    padding: 12px;
    margin: auto;
    border: 1px solid #cccccc;
    border-radius: 4px;
  }

  .c-pc-qrcode-share-modal-qrcode {
    display: block;
    width: 100%;
    height: 100%;
  }

  .c-pc-qrcode-share-modal-tip {
    margin-top: 20px;
    color: rgba(0, 0, 0, 0.4);
    text-align: center;
  }
}
</style>
