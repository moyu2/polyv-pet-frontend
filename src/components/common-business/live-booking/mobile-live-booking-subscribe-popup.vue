<!-- @file 移动端直播预约微信公众号弹层 -->
<template>
  <mobile-popup
    :visible.sync="visible"
    :title="$lang('liveBooking.welcome')"
  >
    <div class="c-mobile-live-booking-subscribe-popup">
      <img
        class="c-mobile-live-booking-subscribe-popup__img"
        :src="viewQrCodeImg || wxMpImageUrl || defaultPLVWxImg"
      />
      <p
        v-if="!wxBookingTips"
        class="c-mobile-live-booking-subscribe-popup__desc"
      >
        {{ $lang('liveBooking.subscribe1') }}<br />
        {{ $lang('liveBooking.subscribe2') }}
      </p>
      <p
        v-else
        class="c-mobile-live-booking-subscribe-popup__desc"
      >
        {{ wxBookingTips }}
      </p>
      <normal-button
        :text="$lang('base.ok')"
        block
        :size="ButtonSize.Medium"
        @click="closePopup"
      />
    </div>
  </mobile-popup>
</template>

<script setup lang="ts">
import { ref, unref, computed } from 'vue';
import { ButtonSize } from '@/components/common-base/normal-button/types';
import MobilePopup from '@/components/common-base/popup/mobile-popup.vue';
import NormalButton from '@/components/common-base/normal-button/normal-button.vue';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useLiveBookingStore } from '@/store/use-live-booking-store';
import { SubscribeInstance } from './types';
import { PropUtils } from '@polyv/vue-components';

const props = defineProps({
  /** 是否是其他频道预约 */
  isOtherLive: PropUtils.bool.def(false),
});

const visible = ref(false);

const viewQrCodeImg = ref('');

function openPopup(imgUrl?: string) {
  if (imgUrl) {
    viewQrCodeImg.value = imgUrl;
  }
  visible.value = true;
}

function closePopup() {
  visible.value = false;
}

// 默认公众号二维码图片
const defaultPLVWxImg = require('./imgs/apollo-live-qrcode.jpg');

const {
  wxMpImageUrl: currentWxMpImageUrl,
  wxBookingTips: currentWxBookingTips,
  singleOtherChannelBookingConfig,
} = storeDefinitionToRefs(useLiveBookingStore);

const wxMpImageUrl = computed(() => {
  if (unref(props.isOtherLive)) {
    return unref(singleOtherChannelBookingConfig.value?.wxMpImageUrl);
  }
  return unref(currentWxMpImageUrl);
});

const wxBookingTips = computed(() => {
  if (unref(props.isOtherLive)) {
    return unref(singleOtherChannelBookingConfig.value?.wxBookingTips);
  }
  return unref(currentWxBookingTips);
});

const instance: SubscribeInstance = {
  openPopup,
  closePopup,
};

defineExpose(instance);
</script>

<style lang="scss">
.c-mobile-live-booking-subscribe-popup {
  padding: 24px;
  text-align: center;
}

.c-mobile-live-booking-subscribe-popup__img {
  display: block;
  width: 120px;
  height: 120px;
  margin: 0 auto;
  margin-bottom: 16px;
}

.c-mobile-live-booking-subscribe-popup__desc {
  margin-bottom: 32px;
  font-size: 16px;
  line-height: 20px;
  color: #333;
}
</style>
