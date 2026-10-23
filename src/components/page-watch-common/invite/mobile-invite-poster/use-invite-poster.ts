import { useGlobalInject } from '@/app/use-global-inject';
import { PropUtils, VueProps } from '@polyv/vue-components';
import { useChannelInfoStore } from '@/store/use-channel-info-store';
import { useCommonStore } from '@/store/use-common-store';
import { InvitePosterData, YN } from '@polyv/live-watch-sdk';
import { ynToBool } from '@polyv/utils/boolean';
import { formatDate } from '@polyv/utils/date';
import { computed, onMounted, ref } from 'vue';
import { CSSProperties } from 'vue/types/jsx';

export const invitePosterProps = () => ({
  type: PropUtils.number.def(0),
  extraInfo: PropUtils.oneOfType([Object, Array]),
});

export const useInvitePoster = (options: { props: VueProps<typeof invitePosterProps> }) => {
  const { getWatchCore } = useGlobalInject();

  const channelInfoStore = useChannelInfoStore();
  const commonStore = useCommonStore();

  const { props } = options;

  const posterData = ref<InvitePosterData>();

  const posterIframeRef = ref<HTMLIFrameElement>();

  const posterIframeStyle = computed<CSSProperties>(() => {
    const iframeWidth = 0.768 * document.documentElement.clientWidth;
    const iframeHeight = (667 / 375) * iframeWidth;
    return {
      width: `${iframeWidth}px`,
      height: `${iframeHeight}px`,
    };
  });

  /** iframe 地址 */
  const iframeUrl = ref('');

  /** 是否加载完成 */
  const loaded = ref(false);

  /** 海报 base64 数据 */
  const posterBase64 = ref('');

  function generateInviteWatchUrl() {
    if (!posterData.value) {
      return '';
    }

    const { promotion, watchParams } = posterData.value;
    let watchUrl = promotion.watchUrl;

    watchUrl = watchUrl + watchParams;

    return watchUrl;
  }

  function generateIframeUrl() {
    if (!posterData.value) {
      return;
    }

    const watchCore = getWatchCore();
    const { promotion, useThirdInviteQrcode = false, thirdInviteQrcodeUrl = '' } = posterData.value;

    const { type = 1 } = props;

    let startTime = '';
    if (channelInfoStore.liveStartTime) {
      startTime = formatDate(channelInfoStore.liveStartTime, 'YYYY/MM/DD hh:mm:ss');
    }

    let footerText = '';
    const footerSetting = watchCore.channel.getPageFooterSetting();
    if (footerSetting.footerEnabled && footerSetting.footerText) {
      footerText = footerSetting.footerText;
    }

    const params = {
      type,
      name: channelInfoStore.channelTitle,
      publisher: channelInfoStore.channelPublisher,
      startTime,
      watchUrl: generateInviteWatchUrl(),
      inviteCoverImage:
        promotion.inviteCoverImage || commonStore.plvDefaultResource.defaultSplashImg,
      customUserType: promotion.customUserType,
      footerText,
      // 为空的时候默认会用 watchUrl 去生成二维码
      qrCode: useThirdInviteQrcode ? thirdInviteQrcodeUrl : '',
    };

    iframeUrl.value = watchCore.invite.getInvitePosterUrl(params);
  }

  function postCustomPosterData() {
    if (!posterData.value) {
      return;
    }

    const promotion = posterData.value.promotion;
    if (!promotion) {
      return;
    }
    const {
      // 海报图片链接(底图)
      invitePosterImageUrl,

      // 昵称开关
      invitePosterNickNameEnabled,
      // 昵称x位置
      nickNamePositionX = 0,
      // 昵称y位置
      nickNamePositionY = 0,
      // 昵称字号
      nickNameSize = 18,
      // 昵称颜色
      nickNameColor = '#FFFFFF',

      // 头像开关
      invitePosterAvatarEnabled,
      // 头像x位置
      avatarPositionX = '0',
      // 头像y位置
      avatarPositionY = '0',
      // 头像大小
      avatarSize = 50,

      // 二维码x位置
      qrCodePositionX = 0,
      // 二维码y位置
      qrCodePositionY = 0,
      // 二维码大小
      qrCodeSize = 100,
    } = promotion;

    const data: UniversalParams<unknown> = {
      invitePosterImageUrl,

      invitePosterNickNameEnabled: ynToBool(invitePosterNickNameEnabled, YN.Y),
      nickNamePositionX,
      nickNamePositionY,
      nickNameSize,
      nickNameColor,

      invitePosterAvatarEnabled: ynToBool(invitePosterAvatarEnabled, YN.Y),
      avatarPositionX,
      avatarPositionY,
      avatarSize,

      qrCodePositionX,
      qrCodePositionY,
      qrCodeSize,
      nicknameFontWeight: 700,
    };
    // 额外海报信息
    if (props.extraInfo) {
      data.extraInfo = props.extraInfo;
    }

    const posterIframe = posterIframeRef.value;

    if (posterIframe) {
      posterIframe.contentWindow?.postMessage(
        {
          event: 'customPosterData',
          data,
        },
        '*',
      );
    }
  }

  function onWindowMessage(e: MessageEvent) {
    const data = e.data;
    const watchCore = getWatchCore();
    const domainInfo = watchCore.domain.getDomainInfo();
    if (!e.origin.startsWith(domainInfo.watchPageDomain)) {
      return;
    }
    if (typeof data === 'string' && data.indexOf('data:image') > -1) {
      loaded.value = true;
      posterBase64.value = data;
    } else if (data && data.event === 'getCustomPosterData') {
      postCustomPosterData();
    }
  }

  function listenEvents() {
    window.addEventListener('message', onWindowMessage);
  }

  onMounted(async () => {
    const watchCore = getWatchCore();
    posterData.value = await watchCore.invite.getInvitePosterData();
    generateIframeUrl();
    listenEvents();
  });

  return {
    iframeUrl,
    posterIframeRef,
    posterIframeStyle,
    loaded,
    posterBase64,
  };
};
