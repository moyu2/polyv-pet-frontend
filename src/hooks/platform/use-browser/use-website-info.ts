export const useWebsiteInfo = () => {
  function setTitle(value: string) {
    window.document.title = value;
  }

  function setMeta(key: string, value: string) {
    const $meta = document.createElement('meta');
    $meta.setAttribute('name', key);
    $meta.setAttribute('content', value);
    document.head.appendChild($meta);
  }

  /**
   * 设置图标元素
   * @param href 链接
   */
  function setFavIconElem(href: string): void {
    let favIconNode = document.querySelector<HTMLLinkElement>('link[rel*=icon]');
    if (!favIconNode) {
      favIconNode = document.createElement('link');
      window.document.head.appendChild(favIconNode);
    }
    favIconNode.rel = 'shortcut icon';
    favIconNode.type = 'image/x-icon';
    favIconNode.href = href;
  }

  return {
    setTitle,
    setMeta,
    setFavIconElem,
  };
};
