import 'pinia';

declare module 'pinia' {
  export interface PiniaCustomProperties {
    $uniqueId: string;
  }
}
