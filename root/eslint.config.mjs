// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs';
import checkFile from 'eslint-plugin-check-file';

export default withNuxt(
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'vue/html-self-closing': 'off',
    },
  },
  {
    files: ['components/*.vue'],
    plugins: {
      'check-file': checkFile,
    },
    rules: {
      'check-file/filename-naming-convention': [
        'error',
        {
          'components/*.vue': 'PASCAL_CASE',
        },
      ],
    },
  },
);
