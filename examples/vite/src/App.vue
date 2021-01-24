<template>
  <img alt="Vue logo" src="./assets/logo.png" width="100" />

  <h3>Vulu</h3>

  <div>
    <div class="radio">
      <label v-for="v in uxOptions">
        <input v-model="options.ux" type="radio" name="ux" :value="v">
        {{ v }}
      </label>
    </div>

    <input class="input mb-4" v-model="myValue" placeholder="Enter your email">
      <!--<option>salam</option>
      <option>123</option>
      <option>1234</option>-->
    </input>


    <p>
      Value: {{ myValue }}
    </p>
    <div v-if="validator.pending" class="spinner"></div>
    <p v-if="validator.invalid">
      invalid
      {{ validator.errors[0] }}
    </p>

    <pre align="left"><small>{{ validator }}</small></pre>
  </div>
</template>

<script>
import { ref, reactive } from 'vue-demi';
import { useValidator } from 'vulu';

function minLength(x) {
  return function minLength(value) {
    if (typeof value === 'string' && value.length >= x) return true;
    return 'Minimum length of string should be ' + x
  }
}

export default {
  name: 'App',
  setup() {
    const myValue = ref(null)
    const options = reactive({
      bails: true,
      defaultMessage: 'Field is invalid',
      ux: 'aggressive',

    })

    const validator = useValidator(() => myValue.value, {
      minLength: minLength(3),
      min: (v) => !isNaN(v) ? new Promise(resolve => setTimeout(resolve, 300,  v > 1000)) : false
    }, options)

    window.v = validator

    return {
      validator,
      myValue,
      options,
      uxOptions: ['eager', 'aggressive', 'lazy', false]
    }
  }
}
</script>

<style>
@keyframes spin {
  100% {
    transform: rotate(360deg);
  }
}
body {
  font-size: 2rem;
}
.input {
  padding: 12px 20px;
  font-size: 1.5rem;
  border: 1px solid #AAA;
  border-radius: 8px;
  background-color: white;
  width: 500px;
  transition: all ease 200ms;
}

.mb-4 {
  margin-bottom: 1rem;
}

.input:focus {
  outline: none;
  border-color: #333;
}

.text-danger {
  color: red;
}

.spinner {
  display: inline-block;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid transparent;
  border-color: #666 #666 transparent transparent;
  animation: spin infinite 0.3s linear;
}

.radio {
  font-size: 1rem;
  margin: 2rem 0;
}
.radio > label {
  margin: 0 1rem;
}
</style>
