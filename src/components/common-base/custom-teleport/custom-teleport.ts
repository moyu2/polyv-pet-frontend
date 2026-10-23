/**
 * @file 自定义 vue3 的 teleport
 */
import { useVue } from '@/hooks/core/use-vue';
import { PropUtils } from '@polyv/vue-components';
import { defineComponent, nextTick, onBeforeUnmount, onMounted, onUnmounted, watch } from 'vue';
import { $ } from '@polyv/utils/dom';

const customTeleportProps = () => ({
  /** 渲染到某个节点 */
  to: PropUtils.oneOfType<string | HTMLElement>([String, HTMLElement]),
});

export const CustomTeleport = defineComponent({
  name: 'CustomTeleport',
  props: {
    ...customTeleportProps(),
  },
  setup(props, { slots }) {
    const { getCurrentElem, getInstance } = useVue();

    const startComment = document.createComment('teleport start');
    const $startComment = $(startComment);

    const endComment = document.createComment('teleport end');
    const $endComment = $(endComment);

    /** 设置渲染位置的占位 */
    function setTeleportPosition() {
      const elem = getCurrentElem();
      if (!elem) {
        return;
      }
      const $elem = $(elem);
      $startComment.insertBefore($elem);
      $endComment.insertAfter($elem);
    }

    /** 重置元素到初时位置 */
    function resetToDefaultPosition() {
      const elem = getCurrentElem();
      if (!elem) {
        return;
      }
      const $elem = $(elem);
      $elem.insertAfter($startComment);
    }

    function getParentElem() {
      let parentElem: Element | undefined | null;
      if (typeof props.to === 'string') {
        parentElem = document.querySelector(props.to);
      } else if (props.to instanceof Element) {
        parentElem = props.to;
      }
      return parentElem;
    }

    /** 设置节点位置 */
    async function setElemPosition() {
      await nextTick();
      // 没传则重置到初时位置
      if (!props.to) {
        resetToDefaultPosition();
        return;
      }

      const elem = getCurrentElem();
      if (!elem) {
        return;
      }

      const parentElem = getParentElem();
      if (!parentElem) {
        resetToDefaultPosition();
        return;
      }

      const $parentElem = $(parentElem);
      $parentElem.append(elem);
    }

    watch(
      () => props.to,
      () => {
        setElemPosition();
      },
    );

    onMounted(() => {
      setTeleportPosition();
      if (props.to) {
        setElemPosition();
      }
    });

    onBeforeUnmount(() => {
      $startComment.remove();
      $endComment.remove();
    });

    onUnmounted(() => {
      const vm = getInstance();
      if (vm) {
        vm.$destroy();
        const elem = getCurrentElem();
        elem?.remove();
      }
    });

    return () => slots.default && slots.default();
  },
});

export default CustomTeleport;
