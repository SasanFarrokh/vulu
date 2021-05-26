import { defineComponent, provide, ref, VNode, nextTick, watchEffect, mergeProps } from 'vue-demi';
import { useValidator } from '../validator';
import { propToListener, VULU } from '../utils';
import {ValidatorOptions} from '../types';
import {defaultOptions} from '../defaults';


export const Validator = /* #__PURE__ */ defineComponent({
    name: 'Validator',
    props: {
        modelValue: null,
        crossValues: null,
        validators: null,
        name: null,
        immediate: { type: Boolean, default: defaultOptions.immediate },
        optional: { type: Boolean, default: defaultOptions.optional },
        bails: { type: Boolean, default: defaultOptions.bails },
        message: { type: String, default: defaultOptions.message },
        interpolator: { type: Function, default: defaultOptions.interpolator },
        interaction: { type: [String, Boolean], default: defaultOptions.interaction },
        model: { type: String, default: defaultOptions.model },
    },
    inheritAttrs: false,
    setup(props) {
        const modelValue = typeof props.modelValue === 'undefined' ? ref(null) : () => props.modelValue;

        const options: ValidatorOptions = {
            ...defaultOptions,
        };
        watchEffect(() => {
            for (const key in options) {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                options[key] = props[key];
            }
        });

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

        return this.$slots.default!({ ...this.v }).map((vnode: VNode, i, arr) => {
            arr.length === 1 && mergeVNodeProps(vnode, this.$attrs);
            if (updateEvent in vnode.props!) {
                mergeVNodeProps(vnode, {
                    [updateEvent]: (v: unknown) => {
                        if (typeof this.modelValue !== 'function') {
                            (this.modelValue as unknown) = v;
                        }
                    },
                    ...propToListener(this.v.on!),
                });
                return vnode;
            }
            return vnode;
        });
    },
});

function mergeVNodeProps(vnode: VNode, attrs: Record<string, unknown>) {
    vnode.props = mergeProps(vnode.props || {}, attrs);
}
