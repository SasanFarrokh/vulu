import type { WatchSource, h } from 'vue';

type ValidatorFnResultSync = boolean | string | string[]

export type ValidatorFnResult = Promise<ValidatorFnResultSync> | ValidatorFnResultSync

export type ValidatorFn = {
    (value: unknown): ValidatorFnResult;
    vname: string;
}

type BaseValidatorOptions = {
    bails: boolean;
    defaultMessage: string;
    immediate: boolean;
}

export type ValidatorOptions = BaseValidatorOptions & ({
    interaction: 'aggressive' | 'lazy' | 'eager';
    element: WatchSource<HTMLElement>;
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
    validate: () => Promise<void>,
    touch: () => void,
    
    on?: Record<string, EventListener>
}