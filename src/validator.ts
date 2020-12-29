import { reactive, watchEffect, watch, WatchSource, readonly, DeepReadonly } from 'vue';
import { flatten, isPlainObject, warn } from './utils';
import { Validation, ValidatorFn, ValidatorOptions } from './types';

const validate = async (value: unknown, validators: ValidatorFn[], options: Partial<ValidatorOptions>) => {
    const failedRules: Record<string, string[]> = {};

    for (let i = 0; i < validators.length; i++) {
        const validator = validators[i];
        const vname = validator.vname || validator.name;
        if (!vname) warn('Do not use anonymous functions as validators, or pass validators as an object');

        let result = await validator(value);

        if (result != null && result !== true) {
            result = typeof result === 'boolean' ? (options.defaultMessage || '') : result;
            failedRules[vname] = (failedRules[vname] || []).concat(result);

            if (options.bails) {
                break;
            }
        }
    }
    return {
        failedRules
    };
};

const getValue = (value: WatchSource<unknown>) => typeof value === 'function' ? value() : value.value;

export function useValidator(
    value: WatchSource<unknown>,
    validators: Record<string, ValidatorFn> | ValidatorFn[] | ValidatorFn,
    options: Partial<ValidatorOptions> = {},
): DeepReadonly<Validation> {
    if (isPlainObject(validators)) {
        validators = Object.keys(validators).map((key: string) => {
            const fn = (validators as Record<string, ValidatorFn>)[key];
            fn.vname = key;
            return fn;
        });
    }

    const validatorsArray = ([] as ValidatorFn[]).concat(validators);
    
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
                const { failedRules } = await validate(currentValue, validatorsArray, options);
                v.pending = false;

                if (currentValue != getValue(value)) {
                    return;
                }

                v.validated = true;
                v.failedRules = failedRules;
            } catch (err) {
                v.pending = false;
                warn(err.message);
            }
        },
        touch() {
            v.dirty = true;
        },
    });

    watchEffect(() => {
        v.errors = v.dirty ? flatten<string>(Object.values(v.failedRules)) : [];
        v.invalid = v.errors.length > 0;
    }, { flush: 'sync' });

    if (!options.interaction) {
        // Simple value watch
        watch(value, () => {
            v.touch();
            v.validate();
        }, {
            immediate: options.immediate
        });
    } else {
        // Based on Element UX
        let validatedValue: unknown = {};
        v.on = {
            async input(e) {
                const target = e.target as HTMLInputElement;
                if (target) {
                    if (target.tagName === 'SELECT') return;
                }

                v.dirty = true;
                v.validated = false;

                let shouldValidate = false;
                shouldValidate = shouldValidate || options.interaction === 'aggressive';
                shouldValidate = shouldValidate || options.interaction === 'eager' && v.errors.length > 0;
                shouldValidate = shouldValidate && validatedValue !== getValue(value);

                if (shouldValidate) {
                    await v.validate();
                    validatedValue = getValue(value);
                }
            },
            async change() {
                v.dirty = true;
                v.validated = false;
                let shouldValidate = false;
                shouldValidate = shouldValidate || options.interaction === 'lazy';
                shouldValidate = shouldValidate || options.interaction === 'eager' && v.errors.length === 0;
                shouldValidate = shouldValidate || options.interaction === 'aggressive';
                shouldValidate = shouldValidate && validatedValue !== getValue(value);

                if (shouldValidate) {
                    await v.validate();
                    validatedValue = getValue(value);
                }
            }
        };
    }

    return readonly(v);
}