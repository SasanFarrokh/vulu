import { ref, computed, h } from 'vue-demi';
import { Validator } from '../src';
import {Validation, ValidatorFn} from '../src/types';
import { mount } from '@vue/test-utils';
import { bigNextTick, required, email } from './utils';

describe('ValidatorComponent', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test('basic', async () => {
        const value = ref('');
        let v: Validation | null = null;
        const vm = mount(Validator, {
            props: {
                validators: { required, email },
                modelValue: value,
                bails: false,
                message: 'test'
            },
            slots: {
                default(_v, ...args) {
                    v = _v;
                    return h('input', {
                        'onInput': (e: InputEvent) => {
                            value.value = (e.target as HTMLInputElement).value;
                            _v.on.onInput?.(e);
                        },
                        'onChange'(e: unknown) {
                            _v.on.onChange?.(e);
                        },
                        'data-error': _v.errors.join(', ')
                    });
                }
            }
        });

        expect(v!.errors).toHaveLength(0);

        const input = vm.find('input');
        await input.setValue('TEST');

        await bigNextTick();

        expect(v!.failedRules).toEqual({ required: ['test'], email: ['test'] });
        expect(input.attributes()['data-error']).toBe(v!.errors.join(', '));
    });

    test('custom component', async () => {
        const value = ref('');
        let v: Validation | null = null;
        const vm = mount(Validator, {
            props: {
                validators: { required, email },
                bails: false,
                message: 'test',
                interaction: 'aggressive'
            },
            slots: {
                default(_v, ...args) {
                    v = _v;
                    return h({
                        props: {
                            modelValue: String,
                        },
                        emits: ['update:modelValue'],
                        setup(props: any, { emit }: any) {
                            const v = computed({
                                get() {
                                    return props.modelValue;
                                },
                                set(x) {
                                    emit('update:modelValue', x);
                                }
                            });
                            return () => h('input', { value: v, onInput: (e: any) => v.value = e.target.value });
                        }
                    }, {
                        modelValue: value.value,
                        'onUpdate:modelValue'(x: any) {
                            value.value = x;
                        }
                    });
                }
            }
        });

        expect(v!.errors).toHaveLength(0);

        const input = vm.find('input');
        await input.setValue('TEST');

        await bigNextTick();

        expect(v!.failedRules).toEqual({ email: ['test'] });

        await input.setValue('test@domain.com');
        await bigNextTick();
        expect(v!.failedRules).toEqual({});
        expect(v!.invalid).toBeFalsy();
    });
});
