<template>
  <div>
    <input class="input" type="text" v-model="value">
    <slot></slot>
  </div>
</template>

<script>
export default {
  props: ['modelValue'],
  computed: {
    value: {
      get() {
        return this.modelValue
      },
      set(x) {
        this.$emit('update:modelValue', x)
      }
    }
  }
}
</script>