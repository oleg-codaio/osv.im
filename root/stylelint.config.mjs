/** @type {import('stylelint').Config} */
export default {
  extends: ['stylelint-config-standard'],
  rules: {
    'selector-class-pattern': null,
    'keyframes-name-pattern': null,
  },
  overrides: [
    {
      files: ['**/*.scss'],
      extends: ['stylelint-config-standard-scss'],
      rules: {
        'selector-class-pattern': null,
        'keyframes-name-pattern': null,
        'scss/dollar-variable-pattern': null,
      },
    },
    {
      files: ['**/*.vue'],
      extends: ['stylelint-config-standard-scss', 'stylelint-config-standard-vue/scss'],
      rules: {
        'selector-class-pattern': null,
        'keyframes-name-pattern': null,
        'scss/dollar-variable-pattern': null,
      },
    },
  ],
};
