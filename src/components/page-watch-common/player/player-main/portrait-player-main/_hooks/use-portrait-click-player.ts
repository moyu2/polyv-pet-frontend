import { appEvents, useEventBusListener } from '@/app/app-events';
import { usePlayerStore } from '@/store/use-player-store';
import { useChannelStore } from '@/store/use-channel-store';
import { usePlayerAction } from '../../../hooks/use-player-action';
import { onBeforeUnmount } from 'vue';
import { usePlayerControl } from '@/components/page-watch-common/player/hooks/use-player-control';
import { useMultiPolyvWatchApp } from '@/hooks/core/use-multi-polyv-watch-app';
import { useIarExternalLinkParams } from '@/components/page-watch-common/interactive-receive/use-iar-external-link-params';
import { formatLink } from '@polyv/utils/external-link';

/**
 * 判断是否点击dom区域
 * @param dom 节点
 * @param event 原生事件
 */
export const checkDomClick = (event: MouseEvent, dom: Element) => {
  if (!dom || !event) return;
  const clickX = event.clientX;
  const clickY = event.clientY;

  const rect = dom.getBoundingClientRect();
  const startX = rect.x;
  const endX = startX + rect.width;
  const startY = rect.y;
  const endY = startY + rect.height;

  return clickX >= startX && clickX <= endX && clickY >= startY && clickY <= endY;
};

/**
 * 竖屏播放器点击处理 hook
 */
export const usePortraitClickPlayer = () => {
  const playerStore = usePlayerStore();
  const channelStore = useChannelStore();
  const { getLinkParams } = useIarExternalLinkParams();
  const { toTryPlay, toPauseInLimit } = usePlayerAction();
  const { noPauseWhenLive } = usePlayerControl();
  const { getAppRootElement } = useMultiPolyvWatchApp();

  /** 记录点击次数 */
  let clickCount = 0;
  /** 清楚点击记录定时器 */
  let clickTimer: number | undefined;

  function clearClickTimer() {
    if (clickTimer) {
      clearTimeout(clickTimer);
      clickTimer = undefined;
    }
  }

  function openUrl(url?: string) {
    if (url) {
      window.open(url, '_blank', 'noopenner=true');
    }
  }

  /** 处理点击播放器区域 */
  function onClickPlayerRegion(event: MouseEvent) {
    // 点击的是外部授权试看到期跳转按钮区域：跳转试看引导地址（参考暖场图跳转范式）
    // 竖屏下轮播屏 z-index 高于播放器，按钮无法直接点击，
    // 点击事件由轮播屏转发到本事件，通过 checkDomClick 坐标判定是否落在 [data-trial-redirect] 按钮区域内。
    const trialRedirectElem =
      getAppRootElement().querySelector('[data-trial-redirect]') ?? undefined;
    const trialInfo = channelStore.externalTrialWatch;
    if (
      trialRedirectElem &&
      checkDomClick(event, trialRedirectElem) &&
      trialInfo?.trialRedirectUrl
    ) {
      try {
        const url = formatLink(trialInfo.trialRedirectUrl, () => ({
          ...getLinkParams(),
        }));
        window.location.href = url;
      } catch (e) {
        console.warn('[portrait-click] trial redirect failed', e);
      }
      return;
    }

    // 判断logo点击
    const logoDom = getAppRootElement().querySelector('.plv-live-logo') ?? undefined;
    if (logoDom && checkDomClick(event, logoDom) && playerStore.logoSetting.logoHref) {
      openUrl(playerStore.logoSetting.logoHref);
      return;
    }

    // 点击的是暖场图片的区域
    const warmupImgElem = getAppRootElement().querySelector('[data-warmup-img]') ?? undefined;
    if (
      warmupImgElem &&
      checkDomClick(event, warmupImgElem) &&
      playerStore.warmUpSetting.warmUpHref
    ) {
      openUrl(playerStore.warmUpSetting.warmUpHref);
      toTryPlay();
      return;
    }

    toTryPlay();

    clickCount++;
    // 双击了播放器区域，暂停播放
    if (clickCount === 2 && !noPauseWhenLive.value) {
      toPauseInLimit();
      clickCount = 0;
    }

    clearClickTimer();
    clickTimer = window.setTimeout(() => {
      clearClickTimer();
      clickCount = 0;
    }, 200);
  }

  onBeforeUnmount(() => {
    clearClickTimer();
  });

  useEventBusListener(appEvents.portrait.ClickPlayerRegion, onClickPlayerRegion);

  return {
    onClickPlayerRegion,
  };
};
