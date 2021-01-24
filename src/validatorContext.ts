import {ValidationContext} from './types';
import {provide, reactive, watchEffect} from 'vue-demi';
import {VULU_CONTEXT} from './utils';

export function useValidatorContext (): ValidationContext {
    const context: ValidationContext = reactive({
        validations: {},
        async validate(fn) {
            const booleans = await Promise.all(
                Object.values(context.validations).map(v => {
                    v.touch();
                    return v.validate();
                })
            );
            if (booleans.indexOf(false) === -1) {
                return fn();
            }
        },
        addValidation(name, v) {
            context.validations[name] = v;
        },
        errors: {}
    } as ValidationContext);

    watchEffect(() => {
        context.errors = {};
        context.allErrors = [];
        context.invalid = false;
        Object.keys(context.validations).forEach(key => {
            const validation = context.validations[key];
            if (validation.errors.length) {
                const errors = context.errors[key] = validation.errors;
                context.allErrors = context.allErrors.concat(errors);
            }
            context.invalid = context.invalid || validation.invalid;
        });
    });

    provide(VULU_CONTEXT, context);

    return context;
}
