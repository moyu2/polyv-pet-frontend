import { getCurrentInstance } from 'vue';

export type ComponentInternalInstance = Exclude<ReturnType<typeof getCurrentInstance>, null>;
