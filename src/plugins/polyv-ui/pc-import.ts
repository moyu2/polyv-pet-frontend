/* eslint-disable import/first */
/**
 * @file polyv-ui PC 端组件引入与导出入口
 */
import '@polyv/polyv-ui/lib-admin/theme/front-din-pro.css';
import './cover-styles.scss';

import '@polyv/polyv-ui/lib-front/theme/like.css';
export { default as PlvLike } from '@polyv/polyv-ui/lib-front/like';

import '@polyv/polyv-ui/lib-front/theme/carousel.css';
import '@polyv/polyv-ui/lib-front/theme/carousel-item.css';
export { default as PlvCarousel } from '@polyv/polyv-ui/lib-front/carousel';
export { default as PlvCarouselItem } from '@polyv/polyv-ui/lib-front/carousel-item';

import '@polyv/polyv-ui/lib-front/theme/area-picker.css';
export { default as PlvAreaPicker } from '@polyv/polyv-ui/lib-front/area-picker';

import '@polyv/polyv-ui/lib-front/theme/emotional-feedback.css';
export { default as PlvEmotionalFeedback } from '@polyv/polyv-ui/lib-front/emotional-feedback';

import '@polyv/polyv-ui/lib-admin/theme/switch.css';
export { default as PlvSwitch } from '@polyv/polyv-ui/lib-admin/switch';
