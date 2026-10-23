declare module 'alloyfinger' {
  export default class AlloyFinger {
    constructor($el: HTMLElement, options: AlloyFingerOption);
  }
}

interface AlloyFingerOption {
  pressMove?: (evt: TouchEvent & WheelEvent) => void;
  touchStart?: (evt: TouchEvent) => void;
  touchEnd?: (evt: TouchEvent) => void;
  touchMove?: (evt: TouchEvent) => void;
}

declare interface AlloyFingerTransformHTMLElement extends HTMLElement {
  translateY: number;
  translateX: number;
}
