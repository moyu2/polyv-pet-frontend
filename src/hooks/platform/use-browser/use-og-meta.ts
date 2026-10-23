export const useOgMeta = () => {
  function setMeta(key: string, value: string) {
    // 查找是否已存在对应的 meta 标签
    const existingMeta = document.querySelector(`meta[property="${key}"]`);
    if (existingMeta) {
      // 已存在，直接更新 content 值
      existingMeta.setAttribute('content', value);
    } else {
      // 不存在，创建新的 meta 标签
      const $meta = document.createElement('meta');
      $meta.setAttribute('property', key);
      $meta.setAttribute('content', value);
      document.head.appendChild($meta);
    }
  }

  function updateOgMeta(opts: { title?: string; desc?: string; link?: string; imgUrl?: string }) {
    if (opts.title) {
      setMeta('og:title', opts.title);
    }
    if (opts.desc) {
      setMeta('og:description', opts.desc);
    }
    if (opts.link) {
      setMeta('og:url', opts.link);
    }
    if (opts.imgUrl) {
      setMeta('og:image', opts.imgUrl);
    }
  }

  return {
    updateOgMeta,
  };
};
