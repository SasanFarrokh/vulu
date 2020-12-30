import {ValidationContext} from './types';
import {provide, reactive, watchEffect} from 'vue';
import {VULU_CONTEXT} from './utils';

export function useValidatorContext () {
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
        Object.keys(context.validations).forEach(key => {
            if (context.validations[key].errors.length) {
                context.errors[key] = context.validations[key].errors;
            }
        });
    });
    
    provide(VULU_CONTEXT, context);
    
    return context;
}