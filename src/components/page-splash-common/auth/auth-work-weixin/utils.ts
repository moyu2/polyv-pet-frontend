/**
 * 企微二维码样式转换base64
 */
import { Base64 } from 'js-base64';

export const getWwLoginStyle = () => {
  const style = `
    .impowerBox .qrcode {width: 200px;}
    .impowerBox .title {display: none;}
    .impowerBox .info {width: 200px;}
    .status_icon {display: none  !important}
    .impowerBox .status {text-align: center;}
  `;
  return `data:text/css;base64,${Base64.encode(style)}`;
};
