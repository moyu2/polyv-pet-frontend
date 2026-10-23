import { PropUtils, VueProps, emitFunc, VueEmit } from '@polyv/vue-components';
import { computed, onMounted, ref } from 'vue';

export interface FormProtocolInstance {
  /** 打开协议 */
  openProtocol: (a: HTMLAnchorElement) => void;
}

export const formProtocolProps = () => ({
  /** 是否选中 */
  value: PropUtils.bool.def(false),
  /** 协议内容 */
  content: PropUtils.string,
});

export const formProtocolEmits = () => ({
  input: emitFunc<boolean>(),
});

export const useFormProtocol = (options: {
  props: VueProps<typeof formProtocolProps>;
  emit: VueEmit<typeof formProtocolEmits>;
  onProtocolClick: (el: HTMLAnchorElement) => void;
}) => {
  const { props, emit, onProtocolClick } = options;

  const checkboxChecked = computed(() => props.value);

  function onCheckboxChange(checked: boolean) {
    emit('input', checked);
  }

  const protocolContentRef = ref<HTMLDivElement>();

  const contentHtml = computed(() => props.content);

  onMounted(() => {
    const protocolContent = protocolContentRef.value;
    if (!protocolContent) return;

    protocolContent.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', event => {
        const isHttps = a.href.includes('https://');
        if (!isHttps) {
          console.warn('需要使用 http 协议的链接');
          return;
        }
        event.preventDefault();
        onProtocolClick(event.target as HTMLAnchorElement);
      });
    });
  });

  return {
    checkboxChecked,
    onCheckboxChange,

    protocolContentRef,
    contentHtml,
  };
};
