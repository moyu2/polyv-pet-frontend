<!-- @file PC 端连麦空状态 -->
<template>
  <div class="c-pc-connect-mic-placeholder">
    <!-- 未连麦 -->
    <template v-if="connectMicStatus === ConnectMicStatus.NotConnect">
      <pc-icon-video-call
        v-if="connectMicType === ConnectMicType.Video"
        class="c-pc-connect-mic-placeholder__icon pws-pc-connect-mic-desc-icon"
      />
      <pc-icon-voice-call
        v-else
        class="c-pc-connect-mic-placeholder__icon pws-pc-connect-mic-desc-icon"
      />
      <p class="c-pc-connect-mic-placeholder__text g-aside-font-size pws-pc-connect-mic-desc-text">
        {{
          connectMicType === ConnectMicType.Video
            ? $lang('connectMic.agreement')
            : $lang('connectMic.agreement.audio')
        }}
      </p>
    </template>
    <!-- 申请中 -->
    <template v-else-if="connectMicStatus === ConnectMicStatus.Applying">
      <div
        class="c-pc-connect-mic-placeholder__icon c-pc-connect-mic-placeholder__icon--applying g-img-cover pws-pc-connect-mic-applying-icon"
      ></div>
      <p class="c-pc-connect-mic-placeholder__text g-aside-font-size pws-pc-connect-mic-desc-text">
        {{ $lang('connectMic.applying') }}...
      </p>
    </template>
  </div>
</template>

<script setup lang="ts">
import { PcIconVideoCall, PcIconVoiceCall } from '@/components/component-icons/pc/map';

import { ConnectMicType, ConnectMicStatus } from '@polyv/live-watch-sdk';
import { useConnectMicStore } from '@/store/use-connect-mic-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';

const { connectMicType, connectMicStatus } = storeDefinitionToRefs(useConnectMicStore);
</script>

<style lang="scss">
.c-pc-connect-mic-placeholder {
  position: absolute;
  top: 50%;
  left: 0;
  width: 100%;
  padding-bottom: 43px;
  line-height: 25px;
  text-align: center;
  transform: translateY(-50%);
}

.c-pc-connect-mic-placeholder__icon {
  display: flex;
  width: 120px;
  height: 120px;
  margin: 0 auto -4px;
  font-size: 120px !important;
  line-height: 120px;
}

.c-pc-connect-mic-placeholder__icon--applying {
  background-image: url(../imgs/call-connecting.gif);
}
</style>
