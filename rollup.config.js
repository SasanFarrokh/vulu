import typescript from '@wessberg/rollup-plugin-ts';

const config = {
    input: './src/index.ts',
    plugins: [
        typescript({})
    ]
};

export default [
    {
        ...config,
        output: {
            file: 'dist/index.js',
            format: 'cjs',
        }
    },
    {
        ...config,
        output: {
            file: 'dist/index.esm.js',
            format: 'esm',
        },
        plugins: [
            typescript({ tsconfig: cnf => ({ ...cnf, declaration: false }) })
        ]
    }
];