<template>
  <div class="">
    <Validator :validators="validators" v-slot="{ errors, on }" immediate>
      <Input a="2">
        <select name="">
          <option value="">salam</option>
        </select>
      </Input>
      <textarea class="input" v-on="on" />

      <span class="text-danger">
        {{ errors[0] }}
      </span>
    </Validator>

    {{ value || 'NONE' }}
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Validator } from "vulu";
import Input from '../../components/Input.vue'

const validators = ref({
  minLength: v => {
    return (v || '').length > 5 ? true : 'Min length is 5'
  }
})

const value = ref(null)
</script>