import {ValidatorOptions} from './types';

export const defaultOptions: ValidatorOptions = {
    bails: true,
    message: 'Field is not valid',
    model: 'modelValue',
    interaction: false,
    immediate: false,
    interpolator: (str, field) => str.replace('$field', field),
};

export const setDefaultOptions = (options: Partial<ValidatorOptions>) => {
    Object.assign(defaultOptions, options);
};
