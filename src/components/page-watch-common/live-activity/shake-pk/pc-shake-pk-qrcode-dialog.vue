<!-- @file 竞技 PK PC 端引导扫码到移动端访问 -->
<template>
  <pc-dialog
    class="c-pc-shake-pk-qrcode-dialog__dialog"
    :visible.sync="visible"
    :width="375"
    :height="328"
    :title="$lang('liveActivity.shakePkScanTitle')"
    hide-header-border
    round
  >
    <div class="c-pc-shake-pk-qrcode-dialog">
      <div class="c-pc-shake-pk-qrcode-dialog__qrcode-wrap">
        <img
          class="c-pc-shake-pk-qrcode-dialog__qrcode"
          :src="shareQrCodeUrl"
          alt="qrcode"
        />
      </div>
      <p class="c-pc-shake-pk-qrcode-dialog__tip">
        {{ $lang('liveActivity.shakePkScanTip') }}
      </p>
    </div>
  </pc-dialog>
</template>

<script setup lang="ts">
import { useGlobalInject } from '@/app/use-global-inject';
import PcDialog from '@/components/common-base/dialog/pc-dialog/pc-dialog.vue';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useShareStore } from '@/store/use-share-store';
import { onBeforeUnmount, onMounted, ref } from 'vue';

const { getWatchCore } = useGlobalInject();
const { shareQrCodeUrl } = storeDefinitionToRefs(useShareStore);
const visible = ref(false);
let active = true;
let unsubscribeOpenRequested: (() => void) | undefined;

function openQrCodeDialog() {
  visible.value = true;
}

onMounted(async () => {
  try {
    const shakePkTarget = await getWatchCore().liveActivity.getShakePkTarget();
    if (!active) return;

    const event = shakePkTarget.ShakePkEvent.OpenRequested;
    shakePkTarget.eventEmitter.on(event, openQrCodeDialog);
    unsubscribeOpenRequested = () => shakePkTarget.eventEmitter.off(event, openQrCodeDialog);
  } catch (error) {
    console.error('[shake-pk-sdk] QR code dialog target load failed', error);
  }
});

onBeforeUnmount(() => {
  active = false;
  unsubscribeOpenRequested?.();
  unsubscribeOpenRequested = undefined;
});
</script>

<style lang="scss">
.c-pc-shake-pk-qrcode-dialog__dialog .c-pc-dialog__content {
  overflow: hidden;
  background-color: #ffffff;
  background-image: url('./images/pc-shake-pk-qrcode-dialog-bg@2x.png');
  background-repeat: no-repeat;
  background-position: top center;
  background-size: 375px 328px;
  border: none;
  box-shadow: none;
}

.c-pc-shake-pk-qrcode-dialog__dialog .c-pc-dialog__header {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 52px;
  padding: 12px 48px;
  line-height: normal;
  background: transparent;
  border: none;
  border-radius: 16px 16px 0 0;
}

.c-pc-shake-pk-qrcode-dialog__dialog .c-pc-dialog__header h1 {
  width: 100%;
  margin: 0;
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
  font-size: 16px;
  font-weight: 500;
  line-height: 24px;
  color: rgba(0, 0, 0, 0.8);
  text-align: center;
  letter-spacing: 0;
  transform: translateY(1px);
}

.c-pc-shake-pk-qrcode-dialog__dialog .c-pc-dialog__header__close {
  top: 14px;
  right: 12px;
  width: 24px;
  height: 24px;
  font-size: 24px !important;
  color: rgba(0, 0, 0, 0.8);
}

.c-pc-shake-pk-qrcode-dialog__dialog .c-pc-dialog__body {
  overflow: hidden;
}

.c-pc-shake-pk-qrcode-dialog {
  position: relative;
  height: 276px;
  text-align: center;
}

.c-pc-shake-pk-qrcode-dialog__qrcode-wrap {
  position: absolute;
  top: 32px;
  left: 108px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 160px;
  height: 160px;
  overflow: hidden;
  background: #ffffff;
  border: 0.5px solid rgba(0, 0, 0, 0.1);
  border-radius: 6px;
}

.c-pc-shake-pk-qrcode-dialog__qrcode {
  display: block;
  flex-shrink: 0;
  width: 217px;
  max-width: none;
  height: 217px;
  object-fit: contain;
}

.c-pc-shake-pk-qrcode-dialog__tip {
  position: absolute;
  top: 224px;
  left: 50%;
  margin: 0;
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
  color: rgba(0, 0, 0, 0.6);
  white-space: nowrap;
  transform: translateX(-50%);
}
</style>
