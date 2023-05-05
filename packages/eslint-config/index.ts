module.exports= {
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  overrides: [
    {
      files: [
        'packages/**/*.js',
        'packages/**/*.ts',
        'packages/**/*.json',
        'src/**/*.ts',
        'src/**/*.json',
        'src/**/*.js',
      ],
    },
  ],
  rules: {
    "indent": ["error", 2],
    "max-len":[
      "error",
      {"code":100,}
    ],
    "object-curly-newline": ["error", { "multiline": true }],
    'no-undef': 'off',
    '@typescript-eslint/ban-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-var-requires': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/no-empty-function': 'off',
  },
};