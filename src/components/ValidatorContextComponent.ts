import { h, defineComponent } from 'vue';

export const ValidatorContext = defineComponent({
    setup(props, { slots }) {
        return () => slots.default?.();
    }
});
