/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution')

module.exports = {
  root: true,
  extends: [
    '@dsb-norge/dsb-vue3-ts'
  ],
  rules: {
    indent: [ 'error', 2, { SwitchCase: 1 } ]
  },
  overrides: [
    {
      files: [
        '**/__tests__/*.{cy,spec,test}.{js,ts,jsx,tsx}'
      ]
    }
  ],
  parserOptions: {
    ecmaVersion: 'latest'
  }
}
