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
    model: string;
    interpolator: (msg: string, field: string) => string;
    optional: boolean;
    crossValues: any
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

export interface ValidationContext {
    validations: Record<string, Validation>;
    contexts: ValidationContext[];
    validate<T>(fn?: () => T): Promise<T | boolean | undefined>;
    addValidation(name: string, validation: Validation): void;
    addContext(context: ValidationContext): void;
    removeContext(context: ValidationContext): void;
    errors: Record<string, string[]>;
    allErrors: string[];
    invalid: boolean;
}
