import { defineComponent } from 'vue';

export const ValidatorContext = /* #__PURE__ */ defineComponent({
    name: 'ValidatorContext',
    setup(props, { slots }) {
        return () => slots.default?.();
    }
});
