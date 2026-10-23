/* eslint-disable sonarjs/no-duplicate-string */
import { CSSProperties } from 'vue';
import { ThemeColorMode } from '@/themes/type/theme-color-mode';
import { LikeEffectType } from '@polyv/live-watch-sdk';
import type { WatchThemeStyleConfig, BgConfig } from '@/themes/type/theme-config';
export type { WatchThemeStyleConfig, BgConfig };

/**
 * 根据 bgConfig 生成 bgStyle 供界面使用
 * @param bgConfig 背景配置
 * @returns CSS 样式对象
 */
export function generateBgStyle(bgConfig?: BgConfig): CSSProperties {
  if (!bgConfig) return {};

  const { type, url, gradient, color, style } = bgConfig;
  let result: CSSProperties = {};

  switch (type) {
    case 'border-image':
      if (url) {
        result.borderImageSource = `url(${url})`;
      }
      break;
    case 'background-image':
      // url 优先级大于 gradient
      if (url) {
        result.backgroundImage = `url(${url})`;
      } else if (gradient) {
        result.backgroundImage = gradient;
      }
      break;
    case 'background-color':
      result.backgroundColor = color;
      break;
  }

  result = Object.assign(result, style);

  return result;
}

export function getSprintThemeConfig(): WatchThemeStyleConfig {
  return {
    mode: ThemeColorMode.Dark,
    themeColor: '#a20a1f',
    primaryColor: '#FF5252',
    themeMaskOpacity: 0,
    common: {
      player: {
        cover: 'https://s2.videocc.net/watch-theme/spring/v1/assets/common/player-cover.png',
      },
      chat: {
        msgInput: {
          bgConfig: {
            type: 'background-image',
            url: '',
            gradient:
              'linear-gradient(180deg, rgba(254, 47, 32, 0.5) 0%, rgba(252, 124, 77, 0.5) 100%)',
            color: '',
            style: {},
          },
          borderColor: 'rgba(255, 185, 113, 0.5)',
        },
        btn: {
          more: {
            iconUrl: 'https://s2.videocc.net/watch-theme/spring/v1/assets/common/chat-btn-more.png',
          },
          donate: {
            iconUrl:
              'https://s2.videocc.net/watch-theme/spring/v1/assets/common/chat-btn-donate.png',
          },
          cart: {
            iconUrl: 'https://s2.videocc.net/watch-theme/spring/v1/assets/common/chat-btn-cart.png',
            countVisible: false,
          },
          like: {
            iconUrl: 'https://s2.videocc.net/watch-theme/spring/v1/assets/common/chat-btn-like.png',
            countBg: '#fee1bf',
            countColor: '#d84835',
            effectType: LikeEffectType.Festival,
          },
        },
      },
      normalBtn: {
        bgConfig: {
          type: 'background-image',
          url: '',
          gradient: 'linear-gradient(97deg, #FED298 3%, #FFF5DA 50%, #FED6A3 100%)',
          color: '',
          style: {},
        },
        borderColor: '#ffb971',
        color: '#e92903',
      },
      introArea: {
        bgConfig: {
          type: 'background-image',
          url: '',
          gradient:
            'linear-gradient(180deg, rgba(254, 47, 32, 0.5) 0%, rgba(252, 124, 77, 0.5) 100%)',
          color: '',
          style: {},
        },
      },
      pendant: {
        pushCardForQrCode:
          'https://s2.videocc.net/watch-theme/spring/v1/assets/common/pendant-qrcode-card.png',
        pushCardForNormal:
          'https://s2.videocc.net/watch-theme/spring/v1/assets/common/pendant-red-packet-card.png',
        coupon: 'https://s2.videocc.net/watch-theme/spring/v1/assets/common/pendant-coupon.png',
        feedback: 'https://s2.videocc.net/watch-theme/spring/v1/assets/common/pendant-feedback.png',
        lottery: 'https://s2.videocc.net/watch-theme/spring/v1/assets/common/pendant-lottery.png',
        conditionLottery:
          'https://s2.videocc.net/watch-theme/spring/v1/assets/common/pendant-condition-lottery.png',
        luckyLottery:
          'https://s2.videocc.net/watch-theme/spring/v1/assets/common/pendant-plat-lottery.png',
        invitePoster:
          'https://s2.videocc.net/watch-theme/spring/v1/assets/common/pendant-poster.png',
        redPacketRain:
          'https://s2.videocc.net/watch-theme/spring/v1/assets/common/pendant-red-packet-rain.png',
        redPacket:
          'https://s2.videocc.net/watch-theme/spring/v1/assets/common/pendant-red-packet.png',
        redPacketPwd:
          'https://s2.videocc.net/watch-theme/spring/v1/assets/common/pendant-red-packet-pwd.png',
        taskPrizeEn:
          'https://s2.videocc.net/watch-theme/spring/v1/assets/common/pendant-task-prize-en.png',
        taskPrizeZh:
          'https://s2.videocc.net/watch-theme/spring/v1/assets/common/pendant-task-prize-zh.png',
        topicPk: 'https://s2.videocc.net/watch-theme/spring/v1/assets/common/pendant-topic-pk.png',
        vote: 'https://s2.videocc.net/watch-theme/spring/v1/assets/common/pendant-vote.png',
      },
    },
    mobile: {
      splash: {
        subscribeArea: {
          bgConfig: {
            type: 'border-image',
            url: 'https://s2.videocc.net/watch-theme/spring/v1/assets/common/subscribe-bg.png',
            color: '',
            style: {
              'border-image-slice': '30 fill',
              'border-image-width': '15px',
              'border-image-repeat': 'stretch',
            },
          },
          countBg: '#FFF2DD',
          countColor: '#E92903',
        },
      },
      menu: {
        bgConfig: {
          type: 'background-image',
          url: 'https://s2.videocc.net/watch-theme/spring/v1/assets/mobile/menu-bg.jpg',
          color: '',
          style: {},
        },
        item: {
          fontColor: '#FFFFFF',
        },
        activeItem: {
          bgConfig: {
            type: 'background-image',
            url: '',
            gradient: 'linear-gradient(110deg, #FED298 3%, #FFF5DA 50%, #FED6A3 100%)',
            color: '',
            style: {},
          },
          borderColor: '#FFB971',
          icon: 'https://s2.videocc.net/watch-theme/spring/v1/assets/mobile/menu-active-item-icon-right.png',
          fontColor: '#b63209',
          underline: false,
        },
      },
      chat: {
        bgConfig: {
          type: 'background-image',
          url: 'https://s2.videocc.net/watch-theme/spring/v1/assets/mobile/chat-bg.jpg',
          color: '',
          style: {},
        },
      },
    },
    portrait: {
      chat: {
        bgConfig: {
          type: 'background-image',
          url: 'https://s2.videocc.net/watch-theme/spring/v1/assets/portrait/chat-bg.jpg',
          color: '',
          style: {},
        },
      },
    },
  };
}

export function getDefaultWatchThemeConfig(): WatchThemeStyleConfig {
  const defaultWatchThemeStyleConfig: WatchThemeStyleConfig = {
    mode: ThemeColorMode.Dark,
    themeColor: '#202127',
    primaryColor: '#3F76FC',
    themeMaskOpacity: 0,
    common: {
      player: {
        cover: '',
      },
      chat: {
        msgInput: {
          bgConfig: {
            type: 'background-image',
            url: '',
            color: '',
            style: {},
          },
          borderColor: '',
        },
        btn: {
          donate: {
            iconUrl: '',
          },
          cart: {
            iconUrl: '',
            countVisible: true,
          },
          like: {
            iconUrl: '',
            countBg: '',
            countColor: '',
            effectType: LikeEffectType.System,
          },
          more: {
            iconUrl: '',
          },
        },
      },
      normalBtn: {
        bgConfig: {
          type: 'background-image',
          url: '',
          color: '',
          style: {},
        },
        borderColor: '',
        color: '',
      },
      introArea: {
        bgConfig: {
          type: 'background-image',
          url: '',
          color: '',
          style: {},
        },
      },
      pendant: {
        pushCardForQrCode: '',
        pushCardForNormal: '',
        coupon: '',
        feedback: '',
        lottery: '',
        conditionLottery: '',
        luckyLottery: '',
        invitePoster: '',
        redPacketRain: '',
        redPacketPwd: '',
        redPacket: '',
        taskPrizeEn: '',
        taskPrizeZh: '',
        topicPk: '',
        vote: '',
      },
    },
    mobile: {
      splash: {
        subscribeArea: {
          bgConfig: {
            type: 'background-image',
            url: 'http://liveimages.videocc.net/uploaded/images/2026/03/hga39ypr04.png',
            color: '',
            style: {},
          },
          countBg: '',
          countColor: '',
        },
      },
      menu: {
        bgConfig: {
          type: 'background-image',
          url: '',
          color: '',
          style: {},
        },
        item: {
          fontColor: '',
        },
        activeItem: {
          bgConfig: {
            type: 'background-image',
            url: '',
            color: '',
            style: {},
          },
          borderColor: '',
          icon: '',
          fontColor: '',
          underline: true,
        },
      },
      chat: {
        bgConfig: {
          type: 'background-image',
          url: '',
          color: '',
          style: {},
        },
      },
    },
    portrait: {
      chat: {
        bgConfig: {
          type: 'background-image',
          url: '',
          color: '',
          style: {},
        },
      },
    },
  };

  return defaultWatchThemeStyleConfig;
}
