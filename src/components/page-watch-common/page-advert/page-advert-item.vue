<template>
  <div class="c-page-advert-item-container">
    <div
      v-if="advert"
      class="c-page-advert__item"
      :class="{
        'c-page-advert__item--link': !!advert.href,
      }"
    >
      <div
        class="c-page-advert__item__click-wrapper"
        @click="handleAdvertClick"
      >
        <template v-if="advert.advertType === PageAdvertType.Text">
          {{ advert.content }}
        </template>
        <template v-else>
          <div
            class="c-page-advert__item__image"
            :style="{
              backgroundImage: `url(${advert.content})`,
            }"
          ></div>
        </template>
      </div>
      <!-- 微信原生按钮 -->
      <div
        v-if="isMobile && shouldShowWeixinBtn"
        ref="weixinBtnRef"
        key="weixin-btn"
        class="c-page-advert__item__weixin-btn"
      ></div>
    </div>

    <mobile-iframe-popup
      v-if="isMobile"
      v-model="iframeVisible"
      :src="iframeUrl"
      :height="460"
    />

    <pc-iframe-popup
      v-if="!isMobile"
      v-model="iframeVisible"
      :src="iframeUrl"
      :height="720"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { PageAdvertType, PageAdvertItem } from '@polyv/live-watch-sdk';
import { PropUtils } from '@polyv/vue-components';
import MobileIframePopup from '@/components/common-base/iframe-popup/mobile-iframe-popup.vue';
import PcIframePopup from '@/components/common-base/iframe-popup/pc-iframe-popup.vue';
import { useAdvert } from '@/hooks/business/use-advert';
import { isMobile } from '@/assets/utils/browser';

const props = defineProps({
  advert: PropUtils.object<PageAdvertItem>(),
});

const shouldShowWeixinBtn = ref(false);

const { weixinBtnRef, iframeVisible, iframeUrl, isWeixinButton, handleAdvertClick } = useAdvert({
  getLinkData: () => {
    console.info('props advert', props.advert);
    if (!props.advert) return null;
    const data = {
      jumpWay: props.advert.jumpWay,
      link: props.advert.link || '',
      pcLink: props.advert.pcLink || '',
      pcLinkJumpWay: props.advert.pcLinkJumpWay || props.advert.jumpWay,
      mobileLink: props.advert.mobileLink || '',
      androidLink: props.advert.androidLink || '',
      iosLink: props.advert.iosLink || '',
      harmonyLink: props.advert.harmonyLink || '',
      mobileAppLink: props.advert.mobileAppLink || '',
      mobileAppLinkJumpWay: props.advert.mobileAppLinkJumpWay || props.advert.jumpWay,
      wxMiniprogramAppId: props.advert.wxMiniprogramAppId || '',
      wxMiniprogramOriginalId: props.advert.wxMiniprogramOriginalId || '',
      wxMiniprogramLink: props.advert.wxMiniprogramLink || '',
    };

    // 旧数据配置了通用链接，则多平台链接全部失效
    if (props.advert.hrefType === 'common') {
      console.info('advert item 进入通用链接');
      data.pcLink = '';
      data.mobileAppLink = '';
      data.androidLink = '';
      data.iosLink = '';
      data.harmonyLink = '';
      data.wxMiniprogramOriginalId = '';
      data.wxMiniprogramAppId = '';
      data.wxMiniprogramLink = '';
    }

    // 旧数据只配置多平台，要把手机端链接放到浏览器链接里使用
    if (props.advert.hrefType === 'multiplatform' && !data.link) {
      console.info('advert item 进入多平台链接');
      data.link = props.advert.mobileLink || '';
    }
    console.info('advert item 最终转换的数据', data);

    return data;
  },
});

onMounted(async () => {
  if (isMobile) {
    shouldShowWeixinBtn.value = await isWeixinButton();
  }
});
</script>

<style lang="scss">
.c-page-advert-item-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  text-align: center;
}

.c-page-advert__item {
  position: relative;
  width: 100%;
  height: 100%;
  font-size: 16px;
  text-decoration: none;
  user-select: none;
}

.c-page-advert__item--link {
  cursor: pointer;
}

.c-page-advert__item__click-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.c-page-advert__item__image {
  display: block;
  width: 100%;
  height: 100%;
  background-size: 100% 100%;
}

.c-page-advert__item__weixin-btn {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 10;
  width: 100%;
  height: 100%;
}

@media (max-width: 1280px) {
  .c-page-advert__item {
    font-size: 14px;
  }
}
</style>
