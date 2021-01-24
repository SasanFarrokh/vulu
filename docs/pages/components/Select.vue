<template>
  <div :class="error ? 'input-danger' : ''">
    <select class="input" v-model="value" v-bind="$attrs">
      <slot />
    </select>
    <span class="mb-4">
      {{ error }}
    </span>
  </div>
</template>

<script>
import { inject, computed, unref } from 'vue-demi';
import { VULU } from 'vulu';

export default {
  props: {
    modelValue: {},
    error: {
      default() {
        const v = inject(VULU, null)
        return computed(() => v ? v.errors.join(', ') : v);
      }
    }
  },
  setup(props, { emit }) {
    return {
      unref,
      error: props.error,
      value: computed({
        get() {
          return props.modelValue
        },
        set(x) {
          emit('update:modelValue', x)
        },
      })
    }
  },
  inheritAttrs: false,
}
</script>
