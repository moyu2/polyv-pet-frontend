<template>
  <div class="c-channel-splash-img">
    <plv-channel-cover
      class="c-channel-splash-img__blur-content"
      :channel-id="renderChannelId"
      :splash-img="renderSplashImg"
      :title="showTitle ? renderChannelTitle : ''"
      :text-cover-bg-id="renderBackgroundId"
      :image-props="{
        gradual: false,
        'blur-background-enabled': blurBackgroundEnabled,
      }"
    />
    <div
      class="c-channel-splash-img__base-info g-singleline"
      v-if="props.baseInfoVisible"
    >
      <div class="c-channel-splash-img__base-info__title g-singleline">
        {{ renderChannelTitle }}
      </div>
      <div class="c-channel-splash-img__base-info__id">
        {{ $lang('base.channelId') }} : {{ renderChannelId }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useGlobalInject } from '@/app/use-global-inject';
import { useResizeOssImage } from '@/hooks/business/use-resize-oss-image';
import { PlvChannelCover } from '@/plugins/polyv-ui/admin-import';
import { useChannelInfoStore } from '@/store/use-channel-info-store';
import { useChannelStore } from '@/store/use-channel-store';
import { useThemeStore } from '@/store/use-theme-store';
import { PropUtils } from '@polyv/vue-components';
import { computed } from 'vue';

const props = defineProps({
  /** 封面地址，不传则使用引导页封面图 */
  coverImg: PropUtils.looseString,
  showTitle: PropUtils.bool.def(true),
  /** 是否展示基础信息 */
  baseInfoVisible: PropUtils.bool.def(false),
  /** 是否背景虚拟化 */
  blurBackgroundEnabled: PropUtils.bool.def(false),
  /** 封面 id */
  splashImgBackgroundId: PropUtils.looseNumber,
  /** 频道名称 */
  channelName: PropUtils.looseString,
  /** 频道号 */
  channelId: PropUtils.oneOfType<string | number>([String, Number]).def(),
});

const { resizeOSSImg } = useResizeOssImage();

const themeStore = useThemeStore();
const channelInfoStore = useChannelInfoStore();
const channelStore = useChannelStore();

const { getWatchCore } = useGlobalInject();

const watchCore = getWatchCore();

const renderChannelId = computed(() => {
  return props.channelId ?? channelStore.channelId;
});

const renderChannelTitle = computed(() => {
  return props.channelName ?? channelInfoStore.channelTitle;
});

const renderBackgroundId = computed(() => {
  return props.splashImgBackgroundId ?? themeStore.splashImgBackgroundId;
});

const renderSplashImg = computed(() => {
  const defaultSource = watchCore.utils.getDefaultResource();

  const coverUrl = props.coverImg ?? themeStore.splashImg;

  if (renderBackgroundId.value && coverUrl === defaultSource.defaultSplashImg) {
    if (!themeStore.watchThemeStyleConfig) {
      return '';
    } else {
      return themeStore.watchThemeStyleConfig.common.player.cover;
    }
  }

  return resizeOSSImg(coverUrl, 1280, 720);
});
</script>

<style lang="scss">
.c-channel-splash-img {
  position: relative;
  width: 100%;
  height: 100%;

  .c-channel-splash-img__base-info {
    position: absolute;
    bottom: 0;
    left: 0;
    z-index: 1;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    width: 100%;
    height: 70px;
    padding: 14px 12px;
    color: #ffffff;
    background: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.6) 100%);
  }

  .c-channel-splash-img__base-info__title {
    font-size: 14px;
  }
  .c-channel-splash-img__base-info__id {
    font-size: 12px;
  }
}

.c-channel-splash-img__blur-background {
  filter: blur(10px);
}

.c-channel-splash-img__blur-content {
  position: absolute;
  top: 0;
  left: 0;
  object-fit: contain;
}
</style>
