import { ValidationContext } from './types';
import { ComponentInternalInstance, getCurrentInstance, inject } from 'vue';

// eslint-disable-next-line @typescript-eslint/ban-types
export const isPlainObject = (x: unknown): x is Record<string, unknown> => String(x) === '[object Object]';

export const warn = (x: string): void => console.warn(`[VULU]: ${x}`);

export const flatten = <T>(x: unknown[]): T[] => {
    let arr: T[] = [];
    x.forEach(item => Array.isArray(item) ? arr = arr.concat(item as T[]) : arr.push(item as T));
    return arr;
};

export const VULU = Symbol('vulu');
export const VULU_CONTEXT = Symbol('vulu-context');

export function injectVuluContext(): ValidationContext | null {
    const vm = getCurrentInstance() as ComponentInternalInstance & { provides: { [VULU_CONTEXT]: ValidationContext } };

    return vm ? (vm.provides[VULU_CONTEXT] || inject(VULU_CONTEXT, null)) : null;
}
