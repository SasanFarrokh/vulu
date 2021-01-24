import {Validation, ValidationContext} from './types';
import {ComponentInternalInstance, getCurrentInstance, inject, InjectionKey} from 'vue-demi';

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

export const propToListener = <T>(obj: Record<string, T>): Record<string, T> => {
    const newObj: Record<string, T> = {};
    for (const key in obj) {
        newObj['on' + key.charAt(0).toUpperCase() + key.slice(1)] = obj[key];
    }
    return newObj;
};

export const extendEventHandlers = ({ ...props }: Record<string, unknown>, newProps: Record<string, unknown>) => {
    for (const key in newProps) {
        const prop = props[key];
        const newProp = newProps[key];
        props[key] = typeof prop === 'function' ? (...args: unknown[]) => {
            (newProp as ((...args: unknown[]) => void))(...args);
            return prop(...args);
        } : newProp;
    }
    return props;
};

export function injectVuluContext(): ValidationContext | null {
    const vm = getCurrentInstance() as ComponentInternalInstance & { provides: { [VULU_CONTEXT]: ValidationContext } };

    return vm ? inject(VULU_CONTEXT, vm?.provides[VULU_CONTEXT] || null) : null;
}
