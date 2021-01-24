import type { WatchSource, h } from 'vue-demi';

type ValidatorFnResultSync = boolean | string | string[]

export type ValidatorFnResult = Promise<ValidatorFnResultSync> | ValidatorFnResultSync

export type ValidatorFn = {
    (value: unknown): ValidatorFnResult;
    vname?: string;
}

type BaseValidatorOptions = {
    bails: boolean;
    message: string;
    immediate: boolean;
    model: string;
    interpolator: (msg: string, field: string) => string;
    optional: boolean;
}

export type ValidatorOptions = BaseValidatorOptions & ({
    interaction: 'aggressive' | 'lazy' | 'eager';
} | {
    interaction?: false;
})

export type Validation = {
    errors: string[];
    failedRules: Record<string, string[]>;
    aria: Record<string, string>;

    pending: boolean;
    invalid: boolean;
    dirty: boolean;
    validated: boolean;

    reset: () => void;
    validate: () => Promise<boolean>,
    touch: () => void,
    setErrors: (errors: string | string[] | Record<string, string[]>) => void,

    on?: Record<string, EventListener>
}

export type ValidationContext = {
    validations: Record<string, Validation>;
    validate<T>(fn: () => T): Promise<T | undefined>;
    addValidation(name: string, validation: Validation): void;
    errors: Record<string, string[]>;
    allErrors: string[];
    invalid: boolean;
};
