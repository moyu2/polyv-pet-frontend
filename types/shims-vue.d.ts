declare module '*.vue' {
  import Vue, { ComponentOptions } from 'vue';
  const component: ComponentOptions<Vue>;
  export default component;
}

declare module '*.svga' {
  const content: string;
  export default content;
}

declare module '*.ttf' {
  const content: string;
  export default content;
}

declare module '*.png' {
  const content: string;
  export default content;
}
