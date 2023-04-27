module.exports = {
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint'],
    extends: ['plugin:@typescript-eslint/recommended'],
    parserOptions: {
        ecmaVersion: 2018,
        sourceType: 'module'
    },
    rules: {
        '@typescript-eslint/ban-types': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/no-var-requires': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
        '@typescript-eslint/no-empty-function': 'off'
    }
};
