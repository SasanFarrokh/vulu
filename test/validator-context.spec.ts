import { onMounted, ref, h, provide, inject, Ref } from 'vue';
import { mount } from '@vue/test-utils';
import { useValidator, useValidatorContext, ValidationContext } from '../src';
import { bigNextTick, email, required } from './utils';

describe('useValidatorContext', () => {

    function setup (setupFn: (props: any, ctx: any) => any, childComponent: any = null) {
        return mount({
            setup(props, ctx) {
                return setupFn(props, ctx);
            },
        });
    }


    test('validator context', async () => {
        let mounted;
        const wrapper = setup(() => {
            const context = useValidatorContext();

            const value1 = ref<string | null>(null);
            const value2 = ref('12');

            const truthy = jest.fn((v: unknown) => v ? true : 'TRUTHY');
            const minLength = jest.fn(((n: number) =>  (v: unknown) => typeof v === 'string' && v.length >= n ? true : 'MIN_LENGTH')(3));

            const truthyValidator = useValidator('field1', value1, truthy, {});
            const minLengthValidator = useValidator('field2', value2, minLength, {});

            expect(truthy).not.toBeCalled();
            expect(minLength).not.toBeCalled();

            expect(context.validations).toEqual({ field1: truthyValidator, field2: minLengthValidator });
            expect(context.invalid).toBeTruthy();
            expect(context.allErrors.length).toBe(0);


            const onDidMount = async () => {
                value1.value = '';
                value2.value = '11';
                await bigNextTick();
                expect(truthy).toBeCalledTimes(1);
                expect(minLength).toBeCalledTimes(1);
                expect(context.allErrors).toEqual(['TRUTHY', 'MIN_LENGTH']);
                expect(context.invalid).toBeTruthy();
                expect(context.errors).toEqual({  field1: ['TRUTHY'], field2: ['MIN_LENGTH']  });
                expect(context.contexts).toEqual([]);
                expect(wrapper.text()).toEqual('errors: ' + context.allErrors.join(', '));

                expect(await context.validate()).toBeFalsy();

                value1.value = 'true';
                value2.value = '1234';

                await bigNextTick();

                expect(context.errors).toEqual({});
                expect(context.allErrors).toEqual([]);
                expect(context.invalid).toBeFalsy();
                expect(wrapper.text()).toEqual('errors:');
                expect(await context.validate()).toBeTruthy();

                const onValid = jest.fn();
                await context.validate(onValid);
                expect(onValid).toBeCalled();
            };

            onMounted(() => {
                mounted = onDidMount();
            });

            return () => h('span', 'errors: ' + context.allErrors.join(', '));
        });
        await bigNextTick();
        await mounted;
    });

    test('nested context', async () => {
        let mounted: Promise<void> | null = null,
            context: ValidationContext | null = null,
            requiredValidator,
            emailValidator,
            nestedContext: ValidationContext | null = null;
        const showGrandChild: Ref<boolean> = ref(true);
        const showChild: Ref<boolean> = ref(true);

        setup(() => {
            const requiredValue = ref<string | null>(null);
            const emailValue = ref('12');

            context = useValidatorContext();

            requiredValidator = useValidator('requiredValue', requiredValue, required, {});
            emailValidator = useValidator('emailValue', emailValue, email, {});

            mounted = new Promise(resolve => onMounted(() => bigNextTick().then(resolve)));

            return () => showChild.value ? h({
                setup() {
                    const requiredValue = ref<string | null>(null);
                    const emailValue = ref('12');

                    nestedContext = useValidatorContext();
                    useValidator('requiredValueNested', requiredValue, required, {});
                    useValidator('emailValueNested', emailValue, email, {});

                    return () => showGrandChild.value ? h({
                        setup() {
                            const v = useValidator('emailValueNestedNested', () => true, () => true, {});
                            v.validate();
                            return () => h('span', {}, 'test');
                        }
                    }) : '';
                }
            }) : '';
        });
        await bigNextTick();
        await mounted;

        expect(context!.validations).toEqual({
            requiredValue: requiredValidator,
            emailValue: emailValidator,
        });
        expect(context!.contexts).toEqual([nestedContext]);
        expect(context!.invalid).toBeTruthy();
        expect(await context!.validate()).toBeFalsy();

        expect(Object.keys(nestedContext!.validations)).toEqual([
            'requiredValueNested',
            'emailValueNested',
            'emailValueNestedNested'
        ]);

        // Unmount
        showGrandChild.value = false;
        await bigNextTick();
        expect(Object.keys(nestedContext!.validations)).toEqual([
            'requiredValueNested',
            'emailValueNested',
        ]);

        showChild.value = false;
        await bigNextTick();
        expect(context!.contexts).toEqual([]);
    });

});
