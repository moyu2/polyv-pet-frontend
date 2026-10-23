import { getSessionStorage, setSessionStorage } from '@/assets/utils/storage';
import { useSimpleVisible } from '@/hooks/behaviors/use-simple-visible';
import { useChannelStore } from '@/store/use-channel-store';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import { useWeixinStore } from '@/store/use-weixin-store';
import { YN } from '@polyv/live-watch-sdk';
import { ynToBool } from '@polyv/utils/boolean';
import { computed, onMounted } from 'vue';

let seatBg = require('./imgs/seat-bg.png');
const isAbsoluteBg = seatBg?.startsWith('//') || /^http(s?):/.test(seatBg);
const isBase64 = typeof seatBg === 'string' && seatBg?.indexOf('data:image') > -1;
if (!isBase64 && !isAbsoluteBg && location.origin.startsWith('http://localhost')) {
  // 开发环境
  seatBg = location.origin.replace(/^http:\/\/localhost/, 'http://0.0.0.0') + seatBg;
}

export const useSeatTableGuestCard = () => {
  const channelStore = useChannelStore();
  const interactReceiveStore = useInteractReceiveStore();
  const weixinStore = useWeixinStore();

  const { visible, setVisible, close } = useSimpleVisible(false);

  const storageKey = `plv-closed-guest-card-${channelStore.channelId}`;

  function checkVisible() {
    const storageVal = getSessionStorage(storageKey);
    if (!ynToBool(storageVal, YN.N) && weixinStore.weixinAuthorized) {
      setVisible(true);
    }
  }

  function closeGuestCard() {
    close();
    setSessionStorage(storageKey, YN.Y);
  }

  onMounted(() => {
    checkVisible();
  });

  const posterSeatInfo = computed(() => {
    const { seatCustomText, seatCustomTextEnabled } = interactReceiveStore.interactSetting;
    const seatPosition = interactReceiveStore.seatPosition;

    if (!seatPosition && !seatCustomTextEnabled) {
      return [];
    }

    if (!seatPosition && seatCustomText) {
      return [
        {
          type: 'text',
          content: seatCustomText,
          fontSize: 35,
          x: 130,
          y: 514,
          color: '#FFFFFF',
          fontWeight: 700,
          isSeatCustomText: true,
        },
      ];
    }

    if (!seatPosition) {
      return [];
    }

    const rowText = `${seatPosition.row}`.padStart(2, '0');
    const columnText = `${seatPosition.column}`.padStart(2, '0');

    return [
      {
        type: 'text',
        content: rowText,
        fontSize: 35,
        x: 213,
        y: 514,
        color: '#FFFFFF',
        fontWeight: 700,
      },
      {
        type: 'text',
        content: columnText,
        fontSize: 35,
        x: 280,
        y: 514,
        color: '#FFFFFF',
        fontWeight: 700,
      },
      {
        type: 'img',
        x: 37,
        y: 512,
        width: 301,
        url: seatBg,
      },
    ];
  });

  return {
    visible,
    posterSeatInfo,
    closeGuestCard,
  };
};
