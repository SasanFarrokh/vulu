<template>
  <div>
    <label class="mb-4" for="checkbox">
      <input id="checkbox" type="checkbox" v-model="options.optional">
      Optional
    </label>
    <Input v-model.lazy="myValue" placeholder="Please enter your email" />
    <span class="text-danger">
        {{ myValidator.errors[0] }}
    </span>
  </div>
</template>

<script setup>
import Input from "../../components/Input.vue";
import { useValidator } from 'vulu'
import { ref, reactive } from 'vue'

const options = reactive({ optional: true })

const myValue = ref(null)
const myValidator = useValidator('email', myValue, {
  required: x => x ? true : 'Field $field is required',
  email: x => x.match(/.+@.+\..+/) ? true : 'Field $field should be in email format'
}, options)
</script>