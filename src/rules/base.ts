import {ValidatorFn} from '../types';

export const isString: ValidatorFn = x => typeof x === 'string';

export const isBoolean: ValidatorFn = x => typeof x === 'boolean';

export const isNumber: ValidatorFn = x => typeof x === 'number' && !isNaN(x);

export const isObject: ValidatorFn = x => !!x && typeof x === 'object' && !Array.isArray(x);

export const isArray: ValidatorFn = x => Array.isArray(x);
