import { defineComponent } from 'vue';

export const ValidatorContext = /* #__PURE__ */ defineComponent({
    setup(props, { slots }) {
        return () => slots.default?.();
    }
});
