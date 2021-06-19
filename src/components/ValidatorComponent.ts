import {
    defineComponent,
    provide,
    ref,
    VNode,
    watchEffect,
    mergeProps,
    reactive,
    PropType,
    toRef,
    Ref,
    DeepReadonly,
} from 'vue-demi';
import { useValidator } from '../validator';
import { VULU } from '../utils';
import { Validation, ValidatorOptions } from '../types';
import {defaultOptions} from '../defaults';

type Interaction = false | 'lazy' | 'eager' | 'aggressive'

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
        interaction: {
            type: [String, Boolean] as PropType<Interaction>,
            validator: (x: string) => [false, 'lazy', 'eager', 'aggressive'].includes(x),
            default: 'eager'
        },
    },
    inheritAttrs: false,
    setup(props) {
        const value = ref();
        watchEffect(() => {
            value.value = props.modelValue;
        }, { flush: 'sync' });

        const options: ValidatorOptions = reactive({
            ...defaultOptions,
        });
        watchEffect(() => {
            for (const key in defaultOptions) {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                options[key] = props[key];
            }
        });

        const v = useValidator(props.name, value, props.validators, options);

        provide(VULU, v);

        const on = resolveListeners(toRef(props, 'interaction'), v);

        return {
            v,
            setErrors: v.setErrors,
            value,
            options,
            on,
        };
    },
    render() {
        return this.$slots.default!({ ...this.v, on: this.on }).map((vnode: VNode, i, arr) => {
            /* istanbul ignore if */
            if (!vnode) return vnode;
            arr.length === 1 && mergeVNodeProps(vnode, this.$attrs);
            mergeVNodeProps(vnode, {
                ...this.on,
            });

            if ('modelValue' in (vnode.props || {})) {
                (this.value as unknown) = vnode.props!.modelValue;
            }

            return vnode;
        });
    },
});

function mergeVNodeProps(vnode: VNode, attrs: Record<string, unknown>) {
    vnode.props = mergeProps(vnode.props || {}, attrs || {});
}

function resolveListeners(interaction: Ref<Interaction>, v: DeepReadonly<Validation>) {
    return {
        onFocus() {
            if ((interaction.value === 'eager' && !v.errors.length) || interaction.value === 'lazy') {
                v.lock();
            }
        },
        onBlur() {
            v.unlock();
        }
    };
}
