import {ValidatorOptions} from './types';

export const defaultOptions: ValidatorOptions = {
    bails: true,
    optional: false,
    message: 'Field is not valid',
    model: 'modelValue',
    manual: false,
    immediate: false,
    interpolator: (str, field) => str.replace('$field', field),
};

export const setDefaultOptions = (options: Partial<ValidatorOptions>): ValidatorOptions => {
    return Object.assign(defaultOptions, options);
};
