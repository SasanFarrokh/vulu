import { ref, Ref, nextTick } from 'vue';
import { useValidator } from '../src';
import { defaultOptions } from '../src/defaults';
import { ValidatorFn } from '../src/types';

const bigNextTick = () => new Promise(resolve => setTimeout(resolve, 1));

describe('useValidator', () => {
    let required: ValidatorFn,
        email: ValidatorFn;
    
    beforeEach(() => {
        required = jest.fn(v => !!v);
        email = jest.fn(v => typeof v === 'string' && /.+@gmail\.com/i.test(v));
    });
    
    test('test basic validation', async () => {
        const value: Ref<string | null> = ref(null);
        const v = useValidator('field', value, {
            required,
            email,
        });

        await nextTick();
        
        expect(required).not.toBeCalled();
        expect(email).not.toBeCalled();
        expect(v.dirty).toEqual(false);

        value.value = 'test';

        await bigNextTick();

        expect(required).toHaveBeenCalledWith('test');
        expect(required).toHaveBeenCalledTimes(1);
        expect(required).toHaveReturnedWith(true);
        expect(email).toHaveReturnedWith(false);
        expect(v.dirty).toEqual(true);

        expect(v.errors.length).toBe(1);
        expect(v.failedRules).toEqual({ email: [defaultOptions.message] });

        value.value = 'testi@gmail.com';

        await bigNextTick();
        expect(v.errors.length).toEqual(0);
    });
    
    test('optional immediate validation', async () => {
        const value: Ref<string | null> = ref(null);
        const v = useValidator('field', value, {
            email,
        }, {
            optional: true,
            immediate: true,
        });

        await bigNextTick();

        expect(v.errors.length).toBe(0);
        expect(v.failedRules).toEqual({});

        value.value = '';

        await bigNextTick();

        expect(email).toBeCalledTimes(0);
        expect(v.errors.length).toBe(0);
        expect(v.failedRules).toEqual({});

        value.value = 'test';

        await bigNextTick();

        expect(email).toBeCalledTimes(1);
        expect(v.errors.length).toBe(1);

        value.value = 'test@gmail.com';

        await bigNextTick();

        expect(email).toReturnWith(true);
        expect(v.errors.length).toBe(0);
        expect(v.dirty).toEqual(true);
    });
});