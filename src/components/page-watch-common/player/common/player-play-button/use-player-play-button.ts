import { PropUtils } from '@polyv/vue-components';

export enum PlayButtonMode {
  /** 三角形的播放按钮 */
  Default = 'default',
  /** 新版三角形的播放按 */
  DefaultNewSkin = 'defaultNewSkin',
  /** 文字提示型的播放按钮 */
  Text = 'text',
}

export const usePlayerPlayButtonProps = () => ({
  /** 播放按钮模式 */
  mode: PropUtils.enum<PlayButtonMode>().def(PlayButtonMode.Default),
});
