import { tupleString } from '@/assets/utils/array';
import { isMobile } from '@/assets/utils/browser';
import { numberToFixed } from '@/assets/utils/number';
import { getEventPosition } from '@/assets/utils/utils';
import { PropUtils, useProps, VueProps, emitFunc, VueEmit } from '@polyv/vue-components';
import { computed, onBeforeUnmount, ref, unref, watch } from 'vue';
import { CSSProperties } from 'vue/types/jsx';

export const sliderBarDirections = tupleString('horizontal', 'vertical');
export type SliderBarDirection = typeof sliderBarDirections[number];

export const sliderBarProps = () => ({
  dataTestId: PropUtils.string.def(''),
  /** 绑定值 */
  value: PropUtils.number.def(0),
  /** hover 时放大滑块 */
  hoverToZoom: PropUtils.bool.def(false),
  /** 热区范围 */
  hotAreaSize: PropUtils.number.def(28),
  /** 滑块轨道粗细 */
  sliderTrackSize: PropUtils.number.def(6),
  /** 隐藏轨道圆角 */
  sliderTrackRadiusHide: PropUtils.bool.def(false),
  /** 外层轨道颜色 */
  wrapSliderTrackColor: PropUtils.string.def('rgba(255, 255, 255, .8)'),
  /** 内层轨道颜色 */
  innerSliderTrackColor: PropUtils.string.def('#3082FE'),
  /** 是否跟随多皮肤 */
  followPageSkin: PropUtils.bool.def(true),
  /** 滑块原点大小 */
  sliderDotSize: PropUtils.number.def(14),
  /** 滑块方向 */
  direction: PropUtils.oneOf(sliderBarDirections).def('horizontal'),
  /** 最小值 */
  min: PropUtils.number.def(0),
  /** 最大值 */
  max: PropUtils.number.def(100),
  /** 显示提示 */
  tooltips: PropUtils.bool.def(false),
  /**
   * css 旋转角度，默认为 0
   * @warn 暂时只支持 props.direction='horizontal' 的情况
   * */
  cssRotateAngle: PropUtils.oneOf([0, 90]).def(0),
});

export const sliderBarEmits = () => ({
  input: emitFunc<number>(),
  change: emitFunc<number>(),
  'drag-change': emitFunc<number>(),
});

export const useSliderBar = (options: {
  props: VueProps<typeof sliderBarProps>;
  emit: VueEmit<typeof sliderBarEmits>;
}) => {
  const { props, emit } = options;

  /** 当前的进度值 */
  const currentValue = ref(0);
  /** 当前是否正在拖拽中 */
  const isDragging = ref(false);
  const { hoverToZoom, tooltips } = useProps(props);

  /**
   * 滑块方向为横向，且 CSS 旋转角度为 90 度
   */
  const isRotateHorizontal = computed(() => {
    return props.direction === 'horizontal' && props.cssRotateAngle === 90;
  });

  watch(
    () => props.value,
    () => (currentValue.value = props.value),
    {
      immediate: true,
    },
  );
  watch(
    () => unref(currentValue),
    () => {
      if (unref(currentValue) !== props.value) {
        emit('input', unref(currentValue));
        emit('change', unref(currentValue));
      }
    },
  );

  /** 热区样式 */
  const containerStyle = computed(() => {
    const styles: CSSProperties = {};

    switch (props.direction) {
      case 'horizontal':
        styles.height = `${props.hotAreaSize}px`;
        break;
      case 'vertical':
        styles.width = `${props.hotAreaSize}px`;
        break;
    }

    return styles;
  });

  /** 外层轨道样式 */
  const wrapTrackStyle = computed(() => {
    const styles: CSSProperties = {
      background: props.wrapSliderTrackColor,
      borderRadius: `${props.sliderTrackSize}px`,
    };

    if (props.sliderTrackRadiusHide) {
      styles.borderRadius = 0;
    }

    switch (props.direction) {
      case 'horizontal':
        styles.height = `${props.sliderTrackSize}px`;
        break;
      case 'vertical':
        styles.width = `${props.sliderTrackSize}px`;
        break;
    }

    return styles;
  });

  /** 内部轨道的长度百分比 */
  const innerTrackLengthPercent = computed(() => {
    const percentNum = (100 * (unref(currentValue) - props.min)) / (props.max - props.min);
    return `${percentNum > 100 ? 100 : percentNum}%`;
  });

  /** 内部轨道样式 */
  const innerTrackStyle = computed(() => {
    const styles: CSSProperties = {
      background: props.innerSliderTrackColor,
    };

    switch (props.direction) {
      case 'horizontal':
        styles.width = unref(innerTrackLengthPercent);
        break;
      case 'vertical':
        styles.height = unref(innerTrackLengthPercent);
        break;
    }

    return styles;
  });

  /** 点样式 */
  const sliderDotStyle = computed(() => {
    const styles: CSSProperties = {
      width: `${props.sliderDotSize}px`,
      height: `${props.sliderDotSize}px`,
    };

    switch (props.direction) {
      case 'horizontal':
        styles.left = unref(innerTrackLengthPercent);
        break;
      case 'vertical':
        styles.bottom = unref(innerTrackLengthPercent);
        break;
    }

    return styles;
  });

  const containerRef = ref<HTMLElement>();

  function listenWindowEvent(): void {
    removeListenWindowEvent();
    if (isMobile) {
      window.addEventListener('touchmove', onMouseMove);
      window.addEventListener('touchend', onMouseUp);
      window.addEventListener('touchcancel', onMouseUp);
    } else {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    }
  }

  function removeListenWindowEvent(): void {
    if (isMobile) {
      window.removeEventListener('touchmove', onMouseMove);
      window.removeEventListener('touchend', onMouseUp);
      window.removeEventListener('touchcancel', onMouseUp);
    } else {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    }
  }

  const sliderBarHover = ref(false);

  function setSliderBarHover(isHover: boolean) {
    sliderBarHover.value = isHover;
  }

  function onMouseDown(event: MouseEvent | TouchEvent): void {
    const eventPosition = getEventPosition(event);
    let clientNumber = eventPosition.clientX;
    if (props.direction === 'vertical' || isRotateHorizontal.value) {
      clientNumber = eventPosition.clientY;
    }
    computedValue(clientNumber);
    isDragging.value = true;
    listenWindowEvent();
  }

  function onMouseMove(event: MouseEvent | TouchEvent): void {
    const eventPosition = getEventPosition(event);
    let clientNumber = eventPosition.clientX;
    if (props.direction === 'vertical' || isRotateHorizontal.value) {
      clientNumber = eventPosition.clientY;
    }

    computedValue(clientNumber);

    onTrackMouseMove(event);
  }

  function onMouseUp(): void {
    isDragging.value = false;
    removeListenWindowEvent();
  }

  const trackHoverX = ref(0);
  const trackHoverValue = ref(0);

  function onTrackMouseMove(event: MouseEvent | TouchEvent): void {
    const containerElem = unref(containerRef);
    if (!containerElem) {
      return;
    }
    const bound = containerElem.getBoundingClientRect();
    const eventPosition = getEventPosition(event);
    const hoverX = eventPosition.clientX - bound.left;
    trackHoverX.value = hoverX >= 0 ? hoverX : 0;
    const hoverValue = computedValue(eventPosition.clientX, false);
    if (typeof hoverValue !== 'undefined' && hoverValue >= 0) {
      trackHoverValue.value = hoverValue;
    }
  }

  function computedValue(clientNumber: number, setValue = true): number | undefined {
    const containerElem = unref(containerRef);
    if (!containerElem) {
      return;
    }
    const bound = containerElem.getBoundingClientRect();
    const totalLength =
      props.direction === 'vertical' || isRotateHorizontal.value ? bound.height : bound.width;
    const startPoint =
      props.direction === 'vertical' || isRotateHorizontal.value ? bound.bottom : bound.left;

    let pointLength = clientNumber - startPoint;
    if (props.direction === 'vertical' && pointLength > 0) {
      return;
    }
    if (props.direction === 'horizontal' && pointLength < 0 && !isRotateHorizontal.value) {
      pointLength = 0;
    }
    pointLength = Math.abs(pointLength);

    let percent = pointLength / totalLength;
    if (isRotateHorizontal.value) {
      percent = 1 - percent; // 横向 90 度旋转时，需要获取相反的百分比才是真正需要计算的值
    }
    if (percent > 1) {
      percent = 1;
    } else if (percent < 0) {
      percent = 0;
    }
    const newValue = numberToFixed(props.min + (props.max - props.min) * percent);

    if (setValue && newValue !== unref(currentValue)) {
      currentValue.value = newValue;
      emit('drag-change', newValue);
    }

    return newValue;
  }

  onBeforeUnmount(() => {
    removeListenWindowEvent();
  });

  return {
    currentValue,
    hoverToZoom,
    tooltips,
    isDragging,
    containerStyle,
    wrapTrackStyle,
    innerTrackStyle,
    sliderDotStyle,
    containerRef,
    sliderBarHover,
    setSliderBarHover,
    onMouseDown,
    onMouseUp,
    trackHoverX,
    trackHoverValue,
    onTrackMouseMove,
  };
};
