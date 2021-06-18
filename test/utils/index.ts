import { nextTick } from 'vue';
import { ValidatorFn } from '../../src';

export  const bigNextTick = () => nextTick().then(() => nextTick());

export const required = jest.fn(v => !!v);
export const email = jest.fn(v => typeof v === 'string' && /.+@domain\.com/i.test(v));
