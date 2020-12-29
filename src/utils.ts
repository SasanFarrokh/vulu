import {ValidatorFn} from './types';

// eslint-disable-next-line @typescript-eslint/ban-types
export const isPlainObject = (x: object): x is Record<string, ValidatorFn> => x.toString() === '[object Object]';

export const warn = (x: string): void => console.warn(`[VULU]: ${x}`);

export const flatten = <T>(x: unknown[]): T[] => {
    let arr: T[] = [];
    x.forEach(item => Array.isArray(item) ? arr = arr.concat(item as T[]) : arr.push(item as T));
    return arr;
};

export const VULU = Symbol('vulu');
