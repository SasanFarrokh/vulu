import { ref, computed, h } from 'vue';
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

        expect(v!.failedRules).toEqual({ email: ['test'] });
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
                        setup(props: Record<string, unknown>, { emit }: { emit: (ev: string, arg: unknown) => void }) {
                            const v = computed({
                                get() {
                                    return props.modelValue;
                                },
                                set(x) {
                                    emit('update:modelValue', x);
                                }
                            });
                            return () => h('input', { value: v.value, onInput: (e: InputEvent) => v.value = (e.target as HTMLInputElement).value });
                        }
                    }, {
                        modelValue: value.value,
                        'onUpdate:modelValue'(x: string) {
                            value.value = x;
                        }
                    });
                }
            }
        });

        expect(v!.errors).toHaveLength(0);
        expect(email).toHaveBeenLastCalledWith('');

        const input = vm.find('input');
        await input.setValue('TEST');

        await bigNextTick();

        expect(v!.failedRules).toEqual({ email: ['test'] });
        expect(v!.validated).toEqual(true);
        expect(email).toHaveBeenLastCalledWith('TEST');

        await input.setValue('');
        await input.setValue('test@domain.com');
        await bigNextTick();
        expect(email).toHaveBeenLastCalledWith('test@domain.com');
        expect(v!.failedRules).toEqual({});
        expect(v!.invalid).toBeFalsy();
    });
});
