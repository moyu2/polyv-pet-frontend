import { askEvents } from './ask';
import { docEvents } from './doc';
import { playerEvents } from './player';
import { globalEvents } from './global';
import { chatEvents } from './chat';
import { donateEvents } from './donate';
import { interactionEvents } from './interaction';
import { inviteEvents } from './invite';
import { microActivityEvents } from './microActivity';
import { financeEvents } from './finance';
import { connectMicEvents } from './connectMic';
import { portraitEvents } from './portrait';
import { withdrawEvents } from './withdraw';
import { iarEvents } from './iar';
import { productEvents } from './product';
import { liveActivityEvents } from './live-activity';

/**
 * 给模块事件加上模块名限定，如 chat 模块 { ALTER_MSG: 'ALTER_MSG' } -> { ALTER_MSG: 'chat.ALTER_MSG' }
 */
function generateRealEvents<T extends Record<string, string>>(
  eventKey: string,
  flatEventMap: T,
): T {
  return Object.entries(flatEventMap)
    .map(([key, value]) => {
      return {
        key,
        value: `${eventKey}.${value}`,
      };
    })
    .reduce((accu, cur) => {
      if (!accu[cur.key]) {
        accu[cur.key] = cur.value;
      }
      return accu;
    }, {} as Record<string, string>) as T;
}

export const events = {
  ask: generateRealEvents('ask', askEvents),
  doc: generateRealEvents('doc', docEvents),
  player: generateRealEvents('player', playerEvents),
  global: generateRealEvents('global', globalEvents),
  chat: generateRealEvents('chat', chatEvents),
  donate: generateRealEvents('donate', donateEvents),
  interaction: generateRealEvents('interaction', interactionEvents),
  invite: generateRealEvents('invite', inviteEvents),
  withdraw: generateRealEvents('withdraw', withdrawEvents),
  portrait: generateRealEvents('portrait', portraitEvents),
  microActivity: generateRealEvents('microActivity', microActivityEvents),
  finance: generateRealEvents('finance', financeEvents),
  connectMic: generateRealEvents('connectMic', connectMicEvents),
  iar: generateRealEvents('iar', iarEvents),
  product: generateRealEvents('product', productEvents),
  liveActivity: generateRealEvents('liveActivity', liveActivityEvents),
};
