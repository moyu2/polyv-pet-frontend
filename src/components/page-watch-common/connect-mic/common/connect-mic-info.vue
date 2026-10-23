<!-- @file 连麦信息 -->
<template>
  <div class="c-connect-mic-info">
    <div class="c-connect-mic-info__content">
      <connect-microphone
        class="c-connect-mic-info__microphone"
        :is-audio-muted="isAudioMuted"
        :current-volume="currentVolume"
      />
      <p class="c-connect-mic-info__nick g-singleline">{{ nickname }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import ConnectMicrophone from './connect-microphone.vue';
import { PropUtils } from '@polyv/vue-components';

defineProps({
  /** 昵称 */
  nickname: PropUtils.string,
  /** 是否关闭麦克风，默认：false */
  isAudioMuted: PropUtils.bool.def(false),
  /** 当前音量，默认：0 */
  currentVolume: PropUtils.number.def(0),
});
</script>

<style lang="scss">
.c-connect-mic-info {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 48px;
  background-image: url(../imgs/item-bottom-bar.png);
  background-repeat: no-repeat;
  background-size: 100% 100%;
}

.c-connect-mic-info__content {
  position: absolute;
  bottom: 4px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  width: 100%;
  height: 20px;
  padding-left: 4px;
}

.c-connect-mic-info__microphone {
  flex-shrink: 0;
  margin-right: 4px;
}

.c-connect-mic-info__nick {
  font-size: 14px;
  line-height: 20px;
  color: $--color-white;
}
</style>
