import { ref, Ref, nextTick, h } from 'vue';
import { Validator } from '../src';
import {Validation, ValidatorFn} from '../src/types';
import { shallowMount } from '@vue/test-utils';
import {propToListener} from '../src/utils';

const bigNextTick = () => new Promise(resolve => setTimeout(resolve, 1));

describe('ValidatorComponent', () => {
    let required: ValidatorFn,
        email: ValidatorFn;
    
    beforeEach(() => {
        required = jest.fn(v => !!v);
        email = jest.fn(v => typeof v === 'string' && /.+@gmail\.com/i.test(v));
    });
    
    test('test validator component', async () => {
        const value = ref('');
        let v: Validation | null = null;
        const vm = shallowMount(Validator, {
            props: {
                validators: { required, email },
                modelValue: value,
                bails: false,
                message: 'test'
            },
            slots: {
                default: (_v) => {
                    v = _v;
                    return h('input', { 
                        ...propToListener(_v.on),
                        'onInput': (e: InputEvent) => {
                            _v.on.input(e);
                            value.value = (e.target as HTMLInputElement).value;
                        },
                    });
                }
            }
        });

        expect(v!.errors).toHaveLength(0);
        
        const input = vm.find('input');
        await input.setValue('TEST');

        await bigNextTick();

        expect(v!.failedRules).toEqual({ required: ['test'], email: ['test'] });
    });
});