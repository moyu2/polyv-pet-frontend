import {
  PiniaCustomStateProperties,
  StoreDefinition,
  StoreGetters,
  StoreState,
  storeToRefs,
} from 'pinia';
import { ToRefs } from 'vue';

type StoreDefinitionToRefsRet<SS extends ReturnType<StoreDefinition>> = ToRefs<
  StoreState<SS> & StoreGetters<SS> & PiniaCustomStateProperties<StoreState<SS>>
>;

/**
 * 将 store 定义转成 refs
 * @param storeDefinition store 定义
 */
export const storeDefinitionToRefs = <SD extends StoreDefinition, SS extends ReturnType<SD>>(
  storeDefinition: SD,
): StoreDefinitionToRefsRet<SS> => {
  const store = storeDefinition();
  return storeToRefs(store) as StoreDefinitionToRefsRet<SS>;
};
