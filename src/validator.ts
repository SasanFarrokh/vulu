import { reactive, watchEffect, watch, WatchSource, readonly, DeepReadonly, isReactive, computed, nextTick } from 'vue-demi';
import {flatten, injectVuluContext, isPlainObject, warn} from './utils';
import { Validation, ValidatorFn, ValidatorOptions } from './types';
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
    validators: Record<string, ValidatorFn> | ValidatorFn[] | ValidatorFn,
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

    const v: Validation = reactive({
        errors: [] as string[],
        failedRules: {} as Record<string, string[]>,
        aria: {},

        pending: false,
        invalid: false,
        dirty: false,
        validated: false,

        reset: () => {
            v.failedRules = {};
        },
        validate: async () => {
            const currentValue = getValue(value);

            v.reset();
            v.pending = true;
            try {
                const { failedRules } = await validate(name, currentValue, validatorsArray.value, { ...defaultOptions, ...options });
                v.pending = false;

                v.validated = true;
                v.failedRules = failedRules;
                return Object.keys(failedRules).length === 0;
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

    if (!options.interaction) {
        // Simple value watch
        watch(isReactive(options) ? [options, value] : value, () => {
            v.touch();
            v.validate();
        }, {
            immediate: options.immediate,
        });
    } else {
        // Based on Element UX
        v.on = {
            async input(e) {
                const target = e.target as HTMLInputElement;
                if (target) {
                    if (target.tagName === 'SELECT') return;
                }

                let shouldTouch = false;
                shouldTouch = shouldTouch || options.interaction === 'aggressive';
                shouldTouch = shouldTouch || options.interaction === 'eager' && v.errors.length > 0;


                if (shouldTouch) {
                    v.touch();
                }

                await nextTick();
                await v.validate();
            },
            async change() {
                v.dirty = true;
                let shouldValidate = false;
                shouldValidate = shouldValidate || options.interaction === 'lazy';
                shouldValidate = shouldValidate || options.interaction === 'eager' && v.errors.length === 0;
                shouldValidate = shouldValidate || options.interaction === 'aggressive';

                if (shouldValidate) {
                    await nextTick();
                    await v.validate();
                }
            }
        };
    }

    // context;
    const context = injectVuluContext();
    if (context) {
        context.addValidation(name, v);
    }

    return readonly(v);
}
