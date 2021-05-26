import { reactive, watchEffect, watch, WatchSource, readonly, DeepReadonly, computed, onBeforeUnmount } from 'vue-demi';
import {flatten, injectVuluContext, isPlainObject, warn} from './utils';
import {Validation, ValidatorFn, ValidatorOptions, Validators} from './types';
import {defaultOptions} from './defaults';

const validate = async (field: string, value: unknown, validators: ValidatorFn[], options: ValidatorOptions) => {
    const failedRules: Record<string, string[]> = {};

    if (!options.optional || ([null, '', undefined] as unknown[]).indexOf(value) === -1) {
        for (let i = 0; i < validators.length; i++) {
            const validator = validators[i];
            const vname = validator.vname || validator.name;
            if (!vname) warn('Do not use anonymous functions as validators, or pass validators as an object');

            let result = await validator(value, options.crossValues);

            if (result === false) {
                result = options.message || ' ';
            }

            if (result != null && result !== true) {
                result = ([] as string[]).concat(result).map(str => options.interpolator(str, field));
                failedRules[vname] = (failedRules[vname] || []).concat(result);

                if (options.bails) {
                    break;
                }
            }
        }
    }
    return {
        failedRules
    };
};

const getValue = (value: WatchSource<unknown>) => typeof value === 'function' ? value() : value.value;

export function useValidator(
    name: string,
    value: WatchSource<unknown>,
    validators: Validators,
    options: Partial<ValidatorOptions> = {},
): DeepReadonly<Validation> {
    const validatorsArray = computed(() => {
        if (isPlainObject(validators)) {
            validators = Object.keys(validators).map((key: string) => {
                const fn = (validators as Record<string, ValidatorFn>)[key];
                fn.vname = key;
                return fn;
            });
        }
        return ([] as ValidatorFn[]).concat(validators);
    });
    validatorsArray.value;

    const v: Validation = reactive({
        errors: [] as string[],
        failedRules: {} as Record<string, string[]>,
        aria: {},

        pending: false,
        invalid: false,
        dirty: options.immediate,
        validated: false,

        reset: () => {
            v.failedRules = {};
        },
        validate: async () => {
            const currentValue = getValue(value);
            if (!validatorsArray.value || !validatorsArray.value.length) {
                warn('No validators assigned');
                return true;
            }

            v.reset();
            v.pending = true;
            try {
                const { failedRules } = await validate(name, currentValue, validatorsArray.value, { ...defaultOptions, ...options });
                v.pending = false;

                v.validated = true;
                v.failedRules = failedRules;

                const isValid = Object.keys(failedRules).length === 0;

                if (isValid) {
                    v.dirty = false;
                }

                return isValid;
            } catch (err) {
                v.pending = false;
                warn(err.message);
            }
            return false;
        },
        touch() {
            v.dirty = true;
        },
        setErrors(errors) {
            v.dirty = true;
            v.failedRules = isPlainObject(errors) ? errors : { '': v.errors = ([] as string[]).concat(errors) };
        }
    } as Validation);

    watchEffect(() => {
        const errors = flatten<string>(Object.values(v.failedRules));
        v.errors = v.dirty ? errors : [];
        v.invalid = !v.validated || errors.length > 0;
    }, { flush: 'sync' });


    watch(value, () => {
        !options.interaction && v.touch();
        options.interaction !== 'lazy' && v.validate();
    });
    if (options.interaction) {
        // Based on Element UX
        v.on = {
            input() {
                if (options.interaction === 'aggressive') {
                    v.touch();
                }
            },
            change() {
                v.touch();
            },
            blur() {
                v.touch();
                v.validate();
            }
        };
    }

    // context;
    const context = injectVuluContext();
    if (context) {
        context.addValidation(name, v);
        onBeforeUnmount(() => {
            context.removeValidation(name);
        });
    }

    return readonly(v);
}
