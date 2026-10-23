/* eslint-disable sonarjs/cognitive-complexity */
import { computed, nextTick, onBeforeUnmount, onMounted, ref, unref, watch } from 'vue';
import AlloyFinger from 'alloyfinger';

import { PlvPopperManager } from '@/plugins/polyv-ui/admin-import';
import { Transform } from '@/plugins/alloy-finger/transform';

import { useAppendTo } from '@/hooks/behaviors/use-append-to';

import { PropUtils, VueProps, emitFunc, updateModelEmit, VueEmit } from '@polyv/vue-components';
import { isUndefined } from 'lodash-es';

import { CSSProperties } from 'vue/types/jsx';
import { PopupInstance, PopupHorizontalScreenPosition, PopupTheme } from './types';
import { useScreenOrientHook } from '@/hooks/core/use-screen-orient';
import { isScrollNearBottom } from '@/assets/utils/dom';
import { useFeedBehavior } from '@/hooks/behaviors/use-webview-feed';

export const popupProps = () => ({
  /** 显示状态，默认：false，支持 .sync */
  visible: PropUtils.bool.def(false),
  /** 弹层标题 */
  title: PropUtils.string.def(''),
  /** 是否占满全屏，默认：false */
  fullScreen: PropUtils.bool.def(false),
  /** 占满除播放器以外的主体区域，默认：false */
  fillBodySection: PropUtils.bool.def(false),
  /** 是否显示头部标题区，默认：true */
  showHeader: PropUtils.bool.def(true),
  /** 是否插入到 body 中，默认：true */
  appendToBody: PropUtils.bool.def(true),
  /** 是否显示关闭，默认：true */
  closable: PropUtils.bool.def(true),
  /** 是否显示返回，默认：false */
  backable: PropUtils.bool.def(false),
  /** 在点击返回时自动关闭，默认：false */
  backAutoClose: PropUtils.bool.def(false),
  /** 点击蒙层关闭弹窗，默认：true */
  closeOnClickMask: PropUtils.bool.def(true),
  /** 蒙层透明度，默认：0.6 */
  maskOpacity: PropUtils.number.def(0.6),
  /** 弹层主体样式 */
  contentStyle: PropUtils.object<CSSProperties>().def({}),
  /** 弹层主题 class */
  contentClass: PropUtils.string,
  /** 是否使用弹出层管理器，集中控制弹窗层级，默认：true */
  usePopperManager: PropUtils.bool.def(true),
  /** 窗口尺寸变化时是否重设样式，默认：false */
  updateOnResize: PropUtils.bool.def(false),
  /** 弹层主题，默认：default */
  theme: PropUtils.enum<PopupTheme>().def(PopupTheme.Default),
  /** 忽略主体最大高度，默认：false */
  ignoreContentMaxHeight: PropUtils.bool.def(false),
  /** 弹层主体高度 */
  contentHeight: PropUtils.number,
  /** 弹层主体使用页面高度百分比，0～1，默认：false */
  contentPercentHeight: PropUtils.oneOfType<boolean | number>([Boolean, Number]).def(false),
  /** 隐藏 header 的底部边框，默认：false */
  hideHeaderBorder: PropUtils.bool.def(false),
  /** 弹层主体背景色 */
  contentBackground: PropUtils.string,
  /** 是否使用动画显隐，默认：true */
  useTransition: PropUtils.bool.def(true),
  /**
   * 是否使用纵向拖拽，默认：false
   * 注意，使用拖拽功能，弹窗主体高度为 100%，具体内容高度需要外部组件搭配 drag-vertical 钩子自行计算
   * */
  draggable: PropUtils.bool.def(false),
  /** 弹窗主体距离顶部的百分比距离，0～1，默认 0  */
  contentPercentTop: PropUtils.number.def(0),
  /** 强制横屏展示 */
  forceHorizontalScreen: PropUtils.bool.def(false),
  /** 屏幕横屏下的弹窗位置，默认为 right */
  horizontalScreenPosition: PropUtils.enum<PopupHorizontalScreenPosition>().def(
    PopupHorizontalScreenPosition.Right,
  ),
  /** 强制展示滚动条，默认： false */
  forceShowBodyScrollbar: PropUtils.bool.def(false),
});

export const popupEmits = () => ({
  ...updateModelEmit<'visible', boolean>('visible'),
  ...updateModelEmit<'useTransition', boolean>('useTransition'),
  /** 进入之后 */
  'after-enter': emitFunc<void>(),
  /** 离开之后 */
  'after-leave': emitFunc<void>(),
  /** 点击返回 */
  'click-back': emitFunc<void>(),
  /** 窗口关闭回调 */
  close: emitFunc<void>(),
  /** 弹窗主体滚动 */
  'body-scroll': emitFunc<UIEvent>(),
  /** 弹窗主体滚动接近底部 */
  'body-scroll-near-bottom': emitFunc<boolean>(),
  /** 上下推拽 */
  'drag-vertical': emitFunc<{ translateY: number }>(),
});

export const usePopup = (options: {
  props: VueProps<typeof popupProps>;
  emit: VueEmit<typeof popupEmits>;
}) => {
  const { props, emit } = options;

  const { toLockFeedDrag, toUnlockFeedDrag } = useFeedBehavior();

  const {
    isVerticalScreenOrientation,
    isHorizontalScreenOrientation,
    updateScreenOrientationModeManually,
  } = useScreenOrientHook({
    autoListen: props.updateOnResize,
  });

  /** 弹层 ref */
  const popupRef = ref<HTMLDivElement | AlloyFingerTransformHTMLElement>();
  /** 弹层主体 ref */
  const popupContentRef = ref<HTMLDivElement | AlloyFingerTransformHTMLElement>();
  /** 弹层主体头部 Ref */
  const popupContentHeaderRef = ref<HTMLDivElement>();
  /** 弹层主体身体 Ref */
  const popupContentBodyRef = ref<HTMLDivElement>();

  /** 弹层外层显示状态 */
  const wrapVisible = ref(false);

  /** 主体显示状态 */
  const contentVisible = ref(false);

  /** 主体计算的高度 */
  const contentComputedHeight = ref<number>();

  /** 主体最大高度 */
  const contentMaxHeight = ref<number>();

  /** 窗口原高度 */
  const pageOriginHeight = ref(document.documentElement.clientHeight || document.body.clientHeight);

  /** 标识位-初次渲染 */
  const firstPaint = ref(true);

  /** 是否需要"可拖拽"提示框 */
  const needDraggableTip = ref(true);

  /**
   * 是否展示"可拖拽"提示框
   * @desc 业务逻辑，配置可拖拽的情况下，第一次打开弹窗时必定展示
   * */
  const draggableTipVisible = computed(() => {
    return props.draggable && firstPaint.value && needDraggableTip.value;
  });

  /** 蒙层样式 */
  const popupMaskStyle = computed(() => {
    return {
      background: `rgba(0, 0, 0, ${props.maskOpacity})`,
    };
  });

  /** 弹层主体渲染高度 */
  const contentRenderHeight = computed(() => {
    if (
      props.draggable ||
      props.fullScreen ||
      props.forceHorizontalScreen ||
      isHorizontalScreenOrientation.value
    ) {
      return '100%';
    }

    if (props.contentHeight) {
      return props.contentHeight;
    }

    let contentPercentHeight = 0;
    if (props.contentPercentHeight === true) {
      contentPercentHeight = 0.6;
    } else if (typeof props.contentPercentHeight === 'number') {
      contentPercentHeight = props.contentPercentHeight;
    }

    if (contentPercentHeight) {
      return document.documentElement.clientHeight * contentPercentHeight;
    }

    return contentComputedHeight.value;
  });

  /** 弹层主体动态类名 */
  const popupContentClass = computed(() => {
    const classList: string[] = [];
    if (isHorizontalScreenOrientation.value || props.forceHorizontalScreen) {
      classList.push(
        `c-mobile-popup__content--screen__horizontal__${props.horizontalScreenPosition}`,
      );
    }

    if (props.theme === PopupTheme.FollowPageSkin) {
      classList.push('pws-mobile-popup__content');
    }

    if (props.contentClass) {
      classList.push(props.contentClass);
    }

    return classList;
  });

  /** 弹层主体样式 */
  const popupContentStyle = computed(() => {
    let style: CSSProperties = {};

    if (props.contentPercentTop) {
      style.top = `${props.contentPercentTop * 100}%`;
    }

    if (!isUndefined(contentRenderHeight.value)) {
      style.height =
        typeof contentRenderHeight.value === 'string'
          ? contentRenderHeight.value
          : `${contentRenderHeight.value}px`;
    }

    if (contentMaxHeight.value && !props.ignoreContentMaxHeight) {
      style.maxHeight = `${contentMaxHeight.value}px`;
    }

    // 如果存在自定义header，则不设置圆角
    if (!props.showHeader) {
      style.borderRadius = 'unset';
    }

    if (props.contentBackground) {
      style.background = props.contentBackground;
    }

    style = Object.assign({}, style, props.contentStyle);

    return style;
  });

  /** 关闭"可拖拽"提示框 */
  function closeDraggableTip() {
    needDraggableTip.value = false;
  }

  /** 点击蒙层 */
  function onClickMask() {
    if (props.closeOnClickMask) {
      closePopup();
    }
  }

  /** 打开弹层 */
  function openPopup() {
    toLockFeedDrag('mobile-popup');
    wrapVisible.value = true;
    contentVisible.value = true;
    updateHeight();
    nextTick(() => {
      if (props.usePopperManager && popupRef.value) {
        PlvPopperManager.openPopper(popupRef.value);
      }
    });
  }

  /** 关闭弹层 */
  function closePopup() {
    toUnlockFeedDrag();
    contentVisible.value = false;
    emit('close');
    emit('update:visible', false);
  }

  /** 处理进入动画结束之后 */
  function onAfterEnter() {
    emit('update:useTransition', true);
    emit('after-enter');
  }

  /** 处理离开动画结束之后 */
  function onAfterLeave() {
    wrapVisible.value = false;
    emit('update:useTransition', true);
    emit('after-leave');
    if (props.draggable) {
      const $popupContent = popupRef.value as AlloyFingerTransformHTMLElement;
      $popupContent.translateY = 0;
    }
  }

  /** 处理点击返回 */
  function onClickBack() {
    if (props.backAutoClose) {
      closePopup();
    }
    emit('click-back');
  }

  function onPopupBodyScroll(evt: UIEvent) {
    emit('body-scroll', evt);
    emitBodyScrollNearBottom();
  }

  /** 获取弹窗主体头部的高度 */
  function getPopupContentHeaderHeight() {
    return (popupContentHeaderRef.value && popupContentHeaderRef.value.clientHeight) || 50;
  }

  /** 绑定 touch 行为 */
  function bindTouchBehavior() {
    const $popup = popupRef.value;
    const $popupContentHeader = popupContentHeaderRef.value;

    if (!$popup || !$popupContentHeader) return;

    const contentPercentTop = props.contentPercentTop;
    const documentHeight = document.documentElement.clientHeight;
    const minY = documentHeight * contentPercentTop;
    const maxY = documentHeight - minY - getPopupContentHeaderHeight();

    // 在 $popup 上挂载 css-transform 钩子
    const $transformPanel = Transform($popup);

    new AlloyFinger($popupContentHeader, {
      pressMove: evt => {
        const translateY = $transformPanel.translateY + evt.deltaY;
        if (translateY <= -minY || $transformPanel.translateY > maxY) {
          evt.preventDefault();
          return;
        }
        $transformPanel.translateY = translateY > maxY ? maxY : translateY;
        emit('drag-vertical', { translateY });
        evt.preventDefault();
      },
    });
  }

  watch(
    () => props.visible,
    () => {
      if (props.visible) {
        openPopup();
        if (props.draggable && firstPaint.value) {
          nextTick(() => {
            bindTouchBehavior();
          });
        }
      } else {
        closePopup();
        closeDraggableTip();
        firstPaint.value = false;
      }
    },
  );

  // 更新高度信息
  async function updateHeight() {
    contentComputedHeight.value = undefined;
    contentMaxHeight.value = undefined;
    // 手动更新屏幕旋转模式，减少性能开销
    updateScreenOrientationModeManually();
    await nextTick();
    setContentHeight();
    emitBodyScrollNearBottom();
  }

  watch(
    () => props.fillBodySection,
    () => {
      updateHeight();
    },
  );

  function emitBodyScrollNearBottom() {
    const isNearBottom = isScrollNearBottom(popupContentBodyRef.value);
    emit('body-scroll-near-bottom', isNearBottom);
  }

  /**
   * 设置主题高度
   * 限高，最高不遮盖播放器区域
   * 在安卓手机上，软键盘弹起会导致页面高度变化，如果当前页面高度小于初始高度，popper高度按初始高度计算
   */
  function setContentHeight() {
    const popupEl = unref(popupRef);
    if (!popupEl) return;

    if (
      props.draggable ||
      props.fullScreen ||
      props.forceHorizontalScreen ||
      isHorizontalScreenOrientation.value
    ) {
      return;
    }

    const ratio = 16 / 9;
    const playerHeight = window.innerWidth / ratio;
    const currentPageHeight = document.documentElement.clientHeight || document.body.clientHeight;
    const isCompressed = currentPageHeight < pageOriginHeight.value;
    const bodyClientHeight = isCompressed ? pageOriginHeight.value : popupEl.offsetHeight;
    // 高度遮盖播放器，或始终需要占满除播放器以外高度（横屏状态除外，横屏状态没有最大高度，可以遮挡播放器）
    const maxHeight = bodyClientHeight - playerHeight;

    contentMaxHeight.value = maxHeight;
    if (isVerticalScreenOrientation.value && props.fillBodySection) {
      contentComputedHeight.value = maxHeight;
    }
  }

  /** 若浏览器窗口尺寸变化(多窗口、webview 小窗恢复、软键盘弹出)，在弹窗可见情况下，重新调整窗口尺寸 */
  function onPageResize() {
    if (!props.visible) {
      return;
    }
    const isFocusInput =
      document.activeElement instanceof HTMLTextAreaElement ||
      document.activeElement instanceof HTMLInputElement;
    // 软键盘弹出导致窗口变化
    if (isFocusInput && window.innerHeight < screen.availHeight) {
      return;
    }
    setTimeout(() => {
      updateHeight();
    }, 500);
  }

  if (props.appendToBody) {
    useAppendTo(popupRef);
  }

  onMounted(() => {
    if (props.updateOnResize) {
      window.addEventListener('resize', onPageResize);
    }
  });

  onBeforeUnmount(() => {
    if (props.updateOnResize) {
      window.removeEventListener('resize', onPageResize);
    }
  });

  const popupInstance: PopupInstance = {
    openPopup,
    closePopup,
  };

  return {
    wrapVisible,
    contentVisible,
    popupRef,
    popupContentRef,
    popupContentHeaderRef,
    popupContentBodyRef,
    popupMaskStyle,
    popupContentClass,
    popupContentStyle,
    popupInstance,
    onAfterEnter,
    onAfterLeave,
    onClickMask,
    openPopup,
    closePopup,
    onClickBack,
    onPopupBodyScroll,

    firstPaint,
    draggableTipVisible,
    closeDraggableTip,

    isVerticalScreen: isVerticalScreenOrientation,
    isHorizontalScreen: isHorizontalScreenOrientation,
  };
};
