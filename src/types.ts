type ValidatorFnResultSync = boolean | string | string[]

export type ValidatorFnResult = Promise<ValidatorFnResultSync> | ValidatorFnResultSync

export type ValidatorFn = {
    (value: unknown, crossValues?: any): ValidatorFnResult;
    vname?: string;
}

export type Validators = Record<string, ValidatorFn> | ValidatorFn[] | ValidatorFn

type BaseValidatorOptions = {
    bails: boolean;
    message: string;
    immediate: boolean;
    interpolator: (msg: string, field: string) => string;
    optional: boolean;
    manual: boolean;
}

export type ValidatorOptions = BaseValidatorOptions;

export type Validation = {
    errors: string[];
    failedRules: Record<string, string[]>;
    aria: Record<string, string>;

    pending: boolean;
    invalid: boolean;
    dirty: boolean;
    validated: boolean;
    locked: boolean;

    reset: () => void;
    validate: () => Promise<boolean>,
    touch: () => void,
    untouch: () => void,
    setErrors: (errors: string | string[] | Record<string, string[]>) => void,
    lock: () => void;
    unlock: () => void;
}

export interface ValidationContext {
    validations: Record<string, Validation>;
    contexts: ValidationContext[];
    validate<T>(fn?: () => T): Promise<T | boolean | undefined>;
    addValidation(name: string, validation: Validation): void;
    removeValidation(name: string): void;
    addContext(context: ValidationContext): void;
    removeContext(context: ValidationContext): void;
    errors: Record<string, string[]>;
    allErrors: string[];
    invalid: boolean;
}
