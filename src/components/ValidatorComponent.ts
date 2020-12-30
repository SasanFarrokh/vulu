import {defineComponent, provide, ref, watch, VNode, Ref} from 'vue';
import { useValidator } from '../validator';
import { extendEventHandlers, propToListener, VULU, warn } from '../utils';
import {ValidatorOptions} from '../types';
import {defaultOptions} from '../defaults';


export const Validator = defineComponent({
    props: ['modelValue', 'validators', 'name'],
    inheritAttrs: false,
    setup(props, { slots, attrs }) {
        const modelValue = typeof props.modelValue === 'undefined' ? ref(null) : ref(props.modelValue);

        const options: ValidatorOptions = {
            interaction: 'aggressive',
            ...defaultOptions,
            ...attrs,
            model: 'modelValue',
            immediate: typeof attrs.immediate !== 'undefined' || defaultOptions.immediate
        };

        const v = useValidator(props.name, modelValue, props.validators, options);

        provide(VULU, v);

        if (options.immediate) {
            v.touch();
            v.validate();
        }

        return {
            v,
            setErrors: v.setErrors,
            modelValue,
            options,
        };
    },
    render() {
        const updateEvent = 'onUpdate:' + this.options.model;

        return this.$slots.default!({ ...this.v }).map((vnode: VNode) => {
            if (!vnode.props || !(updateEvent in vnode.props)) {
                return vnode;
            }

            vnode.props = extendEventHandlers(vnode.props, {
                [updateEvent]: (v: unknown) => {
                    (this.modelValue as unknown) = v;
                },
                ...propToListener(this.v.on!),
            });
            return vnode;
        });
    },
});