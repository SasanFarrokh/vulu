import {ValidationContext} from './types';
import {inject, provide, reactive, watchEffect} from 'vue-demi';
import {VULU_CONTEXT} from './utils';

export function useValidatorContext (): ValidationContext {
    const context = reactive<ValidationContext>({
        validations: {},
        contexts: [],
        async validate(fn) {
            const isValid: boolean = (
                await Promise.all([
                    ...Object.values(this.validations).map(v => {
                        v.touch();
                        return v.validate();
                    }),
                    ...this.contexts.map(ctx => ctx.validate())
                ])).indexOf(false) === -1;
            if (isValid && typeof fn === 'function') {
                return fn();
            }
            return isValid;
        },
        addValidation(name, v) {
            this.validations[name] = v;
        },
        addContext(ctx) {
            this.contexts.push(ctx);
        },
        allErrors: [],
        errors: {},
        invalid: true
    });

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
        context.contexts.forEach(ctx => {
            context.allErrors = context.allErrors.concat(ctx.allErrors);
            context.invalid = context.invalid || ctx.invalid;
        });
    });

    const parentContext = inject<ValidationContext | null>(VULU_CONTEXT, null);
    if (parentContext) {
        parentContext.addContext(context);
    }

    provide(VULU_CONTEXT, context);

    return context;
}
