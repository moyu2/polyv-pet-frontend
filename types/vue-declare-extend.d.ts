import { translate } from '../src/assets/lang';
import { defineComponent as _defineComponent } from 'vue';

declare global {
  const defineOptions: typeof _defineComponent;
}

declare module 'vue/types/vue' {
  interface Vue {
    $lang: typeof translate;
  }
}
