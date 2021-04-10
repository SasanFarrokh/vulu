import {defineComponent, provide, ref, VNode, nextTick} from 'vue-demi';
import { useValidator } from '../validator';
import { extendEventHandlers, propToListener, VULU, warn } from '../utils';
import {ValidatorOptions} from '../types';
import {defaultOptions} from '../defaults';


export const Validator = defineComponent({
    props: {
        modelValue: null,
        crossValues: null,
        validators: null,
        name: null,
        immediate: { type: Boolean, default: defaultOptions.immediate },
        optional: { type: Boolean, default: defaultOptions.optional },
    },
    inheritAttrs: false,
    setup(props, { attrs }) {
        const modelValue = typeof props.modelValue === 'undefined' ? ref(null) : ref(props.modelValue);

        const options: ValidatorOptions = {
            ...defaultOptions,
            interaction: 'aggressive',
            ...attrs,
            immediate: props.immediate,
            optional: props.optional,
            crossValues: props.crossValues
        };

        const v = useValidator(props.name, modelValue, props.validators, options);

        provide(VULU, v);

        if (options.immediate) {
            nextTick(() => {
                v.touch();
                v.validate();
            });
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
            // if (vnode.props.modelValue) {
            //     (this.modelValue as unknown) = vnode.props.modelValue;
            // }
            return vnode;
        });
    },
});
