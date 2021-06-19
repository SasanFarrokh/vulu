import { reactive, watchEffect, watch, WatchSource, readonly, DeepReadonly, computed, onBeforeUnmount, unref } from 'vue-demi';
import {flatten, injectVuluContext, isPlainObject, warn} from './utils';
import {Validation, ValidatorFn, ValidatorOptions, Validators} from './types';
import {defaultOptions} from './defaults';

const validate = async (field: string, value: unknown, validators: ValidatorFn[], options: ValidatorOptions) => {
    const failedRules: Record<string, string[]> = {};

    if (options.optional && ([null, '', undefined] as unknown[]).indexOf(value) >= 0) {
        return { failedRules };
    }
    for (let i = 0; i < validators.length; i++) {
        const validator = validators[i];
        const vname = validator.vname || validator.name;
        if (!vname) warn('Do not use anonymous functions as validators, or pass validators as an object');

        let result = validator(value);
        if (result instanceof Promise) result = await result;

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
    return {
        failedRules
    };
};

const getValue = (value: WatchSource<unknown>) => typeof value === 'function' ? value() : unref(value);

export function useValidator(
    name: string,
    value: WatchSource<unknown>,
    validators: Validators,
    options: Partial<ValidatorOptions> = {},
): DeepReadonly<Validation> {
    const mergedOptions = { ...defaultOptions, ...options };

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

    const onValidate = async (promise: ReturnType<typeof validate>) => {
        v.reset();
        v.touch();
        v.pending = true;
        try {
            const { failedRules } = await promise;
            v.pending = false;

            v.validated = true;
            v.failedRules = failedRules;

            return Object.keys(failedRules).length === 0;
        } catch (err) {
            v.pending = false;
            warn(err.message);
        }
        return false;
    };

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    let lockQueue = () => {};
    const v: Validation = reactive({
        errors: [] as string[],
        failedRules: {} as Record<string, string[]>,
        aria: {},

        pending: false,
        invalid: false,
        dirty: mergedOptions.immediate,
        validated: false,
        locked: false,

        lock: () => {
            v.locked = true;
        },
        unlock: () => {
            v.locked = false;
            lockQueue();
        },

        reset: () => {
            v.dirty = false;
            v.failedRules = {};
        },
        validate: async () => {
            v.touch();
            if (v.locked) {
                lockQueue = v.validate;
                return;
            }
            const promise = validate(name, getValue(value), validatorsArray.value, mergedOptions);
            return onValidate(promise);
        },
        touch() {
            v.dirty = true;
        },
        setErrors(errors) {
            v.touch();
            v.failedRules = isPlainObject(errors) ? errors : { '': v.errors = ([] as string[]).concat(errors) };
        }
    } as Validation);

    watchEffect(() => {
        const errors = flatten<string>(Object.values(v.failedRules));
        v.errors = v.dirty ? errors : [];
        v.invalid = !v.validated || errors.length > 0;
    }, { flush: 'sync' });


    const validateAndWatch = () => watch(
        () => {
            console.log('watching', getValue(value), v.locked);
            return !v.locked ? validate(name, getValue(value), validatorsArray.value, mergedOptions) : null;
        },
        (t) => {
            return t && onValidate(t);
        }, {
            immediate: true,
        },
    );
    const unwatch = options.immediate ? validateAndWatch() : watch(value, () => {
        unwatch();
        validateAndWatch();
    });

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
