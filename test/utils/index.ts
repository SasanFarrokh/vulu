import { nextTick } from 'vue';

export  const bigNextTick = () => nextTick().then(() => nextTick());

export const required = jest.fn(v => !!v);
export const email = jest.fn(v => typeof v === 'string' && /.+@domain\.com/i.test(v));
