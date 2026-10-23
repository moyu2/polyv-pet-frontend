/* eslint-disable promise/prefer-await-to-then */
import {
  MicroActivityIframeEventType,
  PlvDevicemotionSwitchEventMessage,
} from '@polyv/live-watch-sdk';

type DeviceMotionEventRequestPermission = () => Promise<string>;

declare global {
  interface Window {
    DeviceMotionEvent: {
      requestPermission: DeviceMotionEventRequestPermission | undefined;
    };
  }
}

/**
 * @class 微活动 iframe 所需设备陀螺仪事件/数据处理逻辑
 */
export class MicroActivityDeviceMotion {
  static $iframe: HTMLIFrameElement | null = null;

  static hasGranted = false;

  static setIframe($iframe: HTMLIFrameElement | null) {
    MicroActivityDeviceMotion.$iframe = $iframe;
  }

  static bindDeviceMotionEvent() {
    if (typeof window.DeviceMotionEvent !== 'function') {
      alert('您的手机不支持摇一摇功能~');
      return;
    }

    if (typeof window.DeviceMotionEvent.requestPermission === 'function') {
      // 该方法在 ios13 及以上才能使用
      window.DeviceMotionEvent.requestPermission()
        .then(permissionState => {
          if (permissionState === 'granted') {
            this.setDeviceMotion();
          } else {
            alert('很遗憾，您已拒绝启用摇一摇！');
          }
        })
        .catch(error => {
          alert(error);
        });
    } else {
      this.setDeviceMotion();
    }
  }

  static setDeviceMotion() {
    this.hasGranted = true;
    window.addEventListener('devicemotion', this.handleDevicemotionMessage, false);
  }

  static unbindDeviceMotionEvent() {
    if (this.hasGranted) {
      window.removeEventListener('devicemotion', this.handleDevicemotionMessage, false);
      this.hasGranted = false;
    }
  }

  static handleDevicemotionMessage(e: DeviceMotionEvent) {
    const $iframe = MicroActivityDeviceMotion.$iframe;
    $iframe &&
      $iframe.contentWindow &&
      $iframe.contentWindow.postMessage(
        {
          type: MicroActivityIframeEventType.PLV_DEVICEMOTION_SWITCH,
          data:
            e && e.accelerationIncludingGravity
              ? {
                  accelerationIncludingGravity: {
                    x: e.accelerationIncludingGravity.x,
                    y: e.accelerationIncludingGravity.y,
                    z: e.accelerationIncludingGravity.z,
                  },
                }
              : null,
        } as PlvDevicemotionSwitchEventMessage,
        '*',
      );
  }
}
