import {defineComponent, h, provide, ref, getCurrentInstance, onMounted} from 'vue';
import { useValidator } from '../validator';
import {VULU, warn} from '../utils';
import {VNodeArrayChildren} from '@vue/runtime-core';

export const Validator = defineComponent({
    props: ['modelValue', 'validators'],
    inheritAttrs: false,
    setup(props, { slots, attrs }) {
        let modelValue = typeof props.modelValue === 'undefined' ? ref(null) : ref(props.modelValue);
        const element: HTMLInputElement | null = null;

        const options = {
            interaction: 'aggressive',
            element: () => element!,
            ...attrs,
        };
        
        if (typeof props.modelValue === 'undefined') {
            modelValue = ref(null);
            const vm = getCurrentInstance();
            window.sss = vm;
            onMounted(() => {
                const children = vm?.subTree.children as VNodeArrayChildren;
                if (Array.isArray(children)) {
                    children.forEach(child => {
                        if (child && typeof child === 'object' && 'props' in child) {
                            child?.props?.[options.model];
                        }
                    });
                }
            });
        } else {
            modelValue = ref(props.modelValue);
        }

        const v = useValidator(modelValue, props.validators, );

        provide(VULU, v);

        return () => slots.default!({ ...v });
    }
});