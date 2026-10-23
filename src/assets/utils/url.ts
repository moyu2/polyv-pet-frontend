/**
 * @file 与地址有关的工具方法
 */
import { concat as appendToURL, IQSStringifyOptions, parse } from '@polyv/utils/querystring';
import { changeProtocol } from '@polyv/utils/net';
import { isString } from 'lodash-es';

/**
 * 将 url 修改成当前访问协议/补全协议头
 * @param url 目标 url
 */
export function fitProtocol(url: string, excludePrefixList: string[] = ['blob']): string {
  const matchRs = /^(http(s?)):/.exec(location.href);
  const protocol = (matchRs && matchRs[1]) || 'https';

  const isExclude = excludePrefixList.some(prefix => url.startsWith(prefix));

  return isExclude ? url : changeProtocol(url, protocol);
}

/**
 * 将新的参数拼接到 url 中
 * @desc 和 appendToURL 不一样的地方在于会将参数去重，只保留最新的值
 * @param {string} url - url 字符串
 * @param {object} query - 需要添加的查询参数
 * @returns 拼接后的 url 字符串
 */
export function appendUrl<T extends object>(
  url: string,
  query: T,
  options?: Readonly<IQSStringifyOptions> & {
    /** 禁止的参数 */
    forbiddenFields: string[];
  },
): string {
  const searchIndex = url.indexOf('?');
  let searchParams = {} as { [key: string]: string | string[] };
  let host = url;
  if (searchIndex !== -1) {
    host = url.slice(0, searchIndex);
    searchParams = parse(url.slice(searchIndex + 1));
  }

  const payload = Object.assign({}, searchParams, query);
  if (options && Array.isArray(options.forbiddenFields)) {
    options?.forbiddenFields.forEach(field => {
      delete payload[field];
    });
  }

  return appendToURL(host, payload, options);
}

/**
 * 打开链接
 */
export function openLink(href?: string) {
  if (!href) return;
  window.open(href, '_blank');
}

/**
 * 为保利威重定向 url 增加自定义参数
 */
export function appendRedirectUrlParams<T extends object>(
  url: string,
  query: T,
  options?: Readonly<IQSStringifyOptions> & {
    /** 禁止的参数 */
    forbiddenFields: string[];
  },
): string {
  if (!url.includes('common/redirect')) return url;

  const urlInstance = new URL(url);
  const searchParams = parse(urlInstance.search && urlInstance.search.slice(1));
  const targetUrl = searchParams.url;

  if (!targetUrl || !isString(targetUrl)) return url;

  const newTargetUrl = appendUrl(
    targetUrl,
    {
      ...query,
    },
    options,
  );

  return appendToURL(`${urlInstance.origin}${urlInstance.pathname}`, {
    ...searchParams,
    url: newTargetUrl,
  });
}
