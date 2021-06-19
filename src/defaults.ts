import {ValidatorOptions} from './types';

export const defaultOptions: ValidatorOptions = {
    bails: true,
    optional: false,
    message: 'Field is not valid',
    immediate: false,
    manual: false,
    interpolator: (str, field) => str.replace('$field', field),
};

export const setDefaultOptions = (options: Partial<ValidatorOptions>): ValidatorOptions => {
    return Object.assign(defaultOptions, options);
};
