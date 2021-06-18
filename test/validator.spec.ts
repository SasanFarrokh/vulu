import { ref, Ref, nextTick } from 'vue';
import { useValidator } from '../src';
import { defaultOptions as _defaultOptions, setDefaultOptions } from '../src/defaults';
import { bigNextTick, email, required } from './utils';

const defaultOptions = { ..._defaultOptions };

describe('useValidator', () => {

    beforeEach(() => {
        setDefaultOptions(defaultOptions);
    });

    afterEach(() => {
        jest.clearAllMocks();
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

        expect(required).toHaveBeenNthCalledWith(1, 'test');
        expect(required).toHaveReturnedWith(true);
        expect(email).toHaveReturnedWith(false);
        expect(v.errors).toEqual([defaultOptions.message]);
        expect(v.dirty).toEqual(true);
        expect(v.failedRules).toEqual({ email: [defaultOptions.message] });

        value.value = 'testi@domain.com';

        await bigNextTick();
        expect(v.errors.length).toEqual(0);
    });

    test('optional validation', async () => {
        const value: Ref<string | null> = ref(null);
        setDefaultOptions({
            optional: true,
        });
        const v = useValidator('field', value, {
            email,
        }, {
            message: 'OPTIONAL'
        });

        await bigNextTick();

        expect(email).toBeCalledTimes(0);
        expect(v.errors.length).toBe(0);
        expect(v.failedRules).toEqual({});
        expect(v.dirty).toEqual(false);

        value.value = '';

        await bigNextTick();

        expect(email).toHaveBeenCalledTimes(0);
        expect(v.errors.length).toBe(0);
        expect(v.failedRules).toEqual({});
        expect(v.dirty).toEqual(true);

        value.value = 'test';

        await bigNextTick();

        expect(email).toHaveBeenNthCalledWith(1, 'test');
        expect(v.errors).toEqual(['OPTIONAL']);
        expect(v.failedRules).toEqual({ email: ['OPTIONAL'] });

        value.value = 'test@domain.com';

        await bigNextTick();

        expect(email).toReturnWith(true);
        expect(v.errors).toEqual([]);
        expect(v.failedRules).toEqual({});
        expect(v.dirty).toEqual(true);
    });

    test('immediate validation', async () => {
        const value: Ref<string | null> = ref(null);
        const v = useValidator('field', value, {
            email,
        }, {
            immediate: true,
        });

        await bigNextTick();

        expect(email).toBeCalledTimes(1);
        expect(v.errors.length).toBe(1);
        expect(v.dirty).toEqual(true);

        value.value = 'test@domain.com';

        await bigNextTick();

        expect(email).toReturnWith(true);
        expect(v.errors.length).toBe(0);
        expect(v.dirty).toEqual(true);
    });

    test('cross values validation', async () => {
        const value: Ref<string | null> = ref(null);
        const otherValue = ref(false);

        const validator = jest.fn((v) => Boolean(v && otherValue.value));

        const v = useValidator('field', value, {
            validator,
        }, {
            message: ''
        });

        await v.validate();


        expect(validator).toBeCalledTimes(1);
        expect(validator).toReturnWith(false);
        expect(v.validated).toBe(true);
        expect(v.errors.length).toBe(1);
        expect(v.dirty).toEqual(true);

        value.value = 'test@domain.com';

        await bigNextTick();

        expect(validator).toHaveNthReturnedWith(2, false);
        expect(v.errors.length).toBe(1);
        expect(v.dirty).toEqual(true);


        otherValue.value = true;

        await bigNextTick();

        expect(validator).toHaveNthReturnedWith(2, false);
        expect(v.errors.length).toBe(0);
        expect(v.dirty).toEqual(true);
    });

    test('custom set errors validation', async () => {
        const emailInput = ref('');
        const v = useValidator('field', () => emailInput.value, (...args) => (email as any)(...args), { manual: true });
        emailInput.value = 'test@domain.com';

        await bigNextTick();
        expect(v.validated).toBeFalsy();
        expect(email).not.toBeCalled();

        await v.validate();

        expect(v.errors.length).toBe(0);
        expect(v.validated).toBeTruthy();
        expect(v.invalid).toBeFalsy();

        v.setErrors('DUPLICATE');

        expect(v.errors).toEqual(['DUPLICATE']);
        expect(v.invalid).toBeTruthy();

        v.setErrors({
            email: ['DUPLICATE']
        });

        expect(v.errors).toEqual(['DUPLICATE']);
        expect(v.invalid).toBeTruthy();
        expect(v.failedRules).toHaveProperty('email', ['DUPLICATE']);
    });

    test('async validation', async () => {
        const emailInput = ref('not_dup@domain.com');

        // eslint-disable-next-line @typescript-eslint/no-empty-function
        let _resolve: (v: any) => void = () => {};

        const v = useValidator('field', emailInput, t => new Promise((resolve) => {
            _resolve = resolve;
        }), {
            message: 'DUPLICATE',
        });

        expect(v.pending).toBeFalsy();

        const promise = v.validate();

        expect(v.pending).toBeTruthy();

        _resolve!(true);

        await bigNextTick();

        expect(v.errors).toEqual([]);
        expect(v.validated).toBeTruthy();
        expect(v.pending).toBeFalsy();
        expect(v.invalid).toBeFalsy();

        expect(v.pending).toBeFalsy();
        emailInput.value = 'dup@domain.com';

        await bigNextTick();

        expect(v.pending).toBeTruthy();

        _resolve!(false);
        await bigNextTick();
        expect(v.pending).toBeFalsy();
        expect(v.errors).toEqual(['DUPLICATE']);
    });

    test('async validation', async () => {
        const emailInput = ref('not_dup@domain.com');

        let _reject: (err: Error) => void = () => null;

        const v = useValidator('field', emailInput, t => new Promise((resolve, reject) => {
            _reject = reject;
        }), {
            message: 'DUPLICATE',
        });

        expect(v.pending).toBeFalsy();

        const promise = v.validate();

        expect(v.pending).toBeTruthy();

        _reject(new Error());

        await bigNextTick();

        expect(v.validated).toBeFalsy();
        expect(v.invalid).toBeTruthy();
    });
});
