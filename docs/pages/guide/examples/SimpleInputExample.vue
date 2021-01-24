<template>
  <div class="">
    <Validator name="email" :validators="inputValidator" v-slot="{ errors, on, dirty }" interaction="aggressive" immediate optional>
      <Input v-model="inputValue" />
    </Validator>

    <hr>

    <Validator name="selectbox" ref="selectValidatorRef" :validators="selectValidator" v-slot="{ errors, on, dirty }" interaction="aggressive" message="$field is not valid">
      <Select class="input" v-model="selectValue">
        <option value=""></option>
        <option value="1">1</option>
        <option value="2">2</option>
        <option value="3">3</option>
      </Select>
    </Validator>

    <hr>

    <button class="button" @click="submit">Submit</button>


    {{ ctx.errors }}
  </div>
</template>

<script setup>
import { ref, watchEffect } from 'vue-demi'
import { Validator, useValidatorContext } from "vulu";
import Input from '../../components/Input.vue'
import Select from '../../components/Select.vue'

const inputValidator = ref({
  minLength: (x => v => {
    return (v || '').length >= x ? true : 'Minimum length of $field should be ' + x
  })(5)
})

const selectValidator = ref({
  required: x => !!x
})

// watchEffect(() => {
//   console.log(selectValidator.errors)
// })

const inputValue = ref('test')
const selectValue = ref(null)

const selectValidatorRef = ref(null);
const setErrors = () => {
  selectValidatorRef.value.setErrors(['ridi', 'radi'])
}

const ctx = useValidatorContext()

const submit = () => ctx.validate(() => {
  alert('HOORAY')
})
</script>