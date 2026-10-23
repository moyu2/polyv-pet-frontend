import Schema from 'async-validator';

// 将内部的 console.waring 禁用掉
// eslint-disable-next-line @typescript-eslint/no-empty-function
Schema.warning = () => {};

export type { Rules as ValidatorRules, Rule as ValidatorRule } from 'async-validator';

export default Schema;
