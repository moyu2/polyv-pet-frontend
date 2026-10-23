import { translate } from '@/assets/lang';
import { PropUtils, useProps, VueProps } from '@polyv/vue-components';
import { ConnectMicItem, ConnectMicFitType } from '@polyv/live-watch-sdk';
import { computed, nextTick, onBeforeUnmount, onMounted, ref, unref, watch } from 'vue';
import { isMobile } from '@/assets/utils/browser';
import { useDocStore } from '@/store/use-doc-store';
import { useLayoutStore } from '@/store/use-layout-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { appEvents, useEventBusListener } from '@/app/app-events';

export const connectMicItemProps = (fitType = ConnectMicFitType.Contain) => ({
  micItem: PropUtils.object<ConnectMicItem>().isRequired,
  /** 连麦信息是否显示 */
  micInfoVisible: PropUtils.bool.def(true),
  fitType: PropUtils.enum<ConnectMicFitType>().def(fitType),
});

/** 连麦节点 hook */
export const useConnectMicItem = (options: { props: VueProps<typeof connectMicItemProps> }) => {
  const { props } = options;
  const { micInfoVisible } = useProps(props);
  const docStore = useDocStore();

  const wrapRef = ref<HTMLDivElement>();

  const isPause = computed(() => props.micItem.isPlayFail);

  const { isPortraitWatchLayout } = storeDefinitionToRefs(useLayoutStore);

  /** 连麦用户昵称 */
  const micNickname = computed<string>(() => {
    const micItem = props.micItem;
    if (micItem.isTeacher) {
      return translate('connectMic.teacher');
    }
    if (micItem.isSelf) {
      return translate('connectMic.me');
    }
    return micItem.nickname;
  });

  /** 是否关闭麦克风 */
  const isAudioMuted = computed(() => props.micItem.isAudioMuted);

  /** 当前音量，0 ～ 1 */
  const currentVolume = computed(() => props.micItem.currentVolume);

  /** 是否关闭摄像头 */
  const isVideoMuted = computed(() => props.micItem.isVideoMuted);

  /** 是否 sip 电话入座 */
  const isSipUser = computed(() => props.micItem.isSipUser);

  /** 是否本地推流 */
  const isLocal = computed(() => props.micItem.isLocal);

  /** 是否第一画面 */
  const isMaster = computed(() => props.micItem.isMaster);

  /** 当前用户的连麦方式 */
  const currentConnectMicType = computed(() => props.micItem.currentConnectMicType);

  /** 当前是否为观众模式 */
  const isAudience = computed(() => props.micItem.isAudience);

  /** 是否显示共享标志 */
  const showShareIcon = computed(() => {
    return docStore.hasPaintAuth && unref(isLocal);
  });

  /** 是否开启镜像（仅本地流有效） */
  const mirrorEnabled = computed(() => props.micItem.mirrorEnabled);

  watch(
    () => isPause.value,
    (val: boolean) => {
      if (val) {
        document.body.addEventListener(isMobile ? 'touchend' : 'click', resume);
      } else {
        document.body.removeEventListener(isMobile ? 'touchend' : 'click', resume);
      }
    },
  );

  if (isPortraitWatchLayout.value) {
    useEventBusListener(appEvents.portrait.ClickPlayerRegion, resume);
  }

  const checkMediaPaused = () => {
    return (
      wrapRef.value?.querySelector('video')?.paused && wrapRef.value?.querySelector('audio')?.paused
    );
  };

  /**
   * 初始化连麦节点
   */
  async function initMicItem(fit: ConnectMicFitType) {
    await nextTick();
    const micItem = props.micItem;
    const wrapElement = unref(wrapRef);
    if (!wrapElement) {
      return;
    }
    wrapElement.innerHTML = '';

    // 本地流则调用推送方法
    if (micItem.isLocal) {
      micItem.publishStream({
        element: wrapElement,
        control: false,
        fit,
      });
    } else {
      micItem.subscribeStream({
        element: wrapElement,
        control: false,
        fit,
      });
    }
  }

  /**
   * 销毁连麦节点
   */
  function destroyMicItem(): void {
    const micItem = props.micItem;
    micItem.removeStream();
  }

  function resume() {
    console.log('resume');
    const micItem = props.micItem;
    micItem.resumeStream();
  }

  onMounted(() => {
    initMicItem(props.fitType);
  });

  onBeforeUnmount(() => {
    destroyMicItem();
    document.body.removeEventListener(isMobile ? 'touchend' : 'click', resume);
  });

  return {
    wrapRef,
    isPause,
    micInfoVisible,
    micNickname,
    isAudioMuted,
    currentVolume,
    isVideoMuted,
    isSipUser,
    isLocal,
    isMaster,
    currentConnectMicType,
    showShareIcon,
    mirrorEnabled,
    resume,
    checkMediaPaused,
    isAudience,
  };
};
