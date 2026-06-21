import { defineNuxtConfig } from 'nuxt/config';

export default defineNuxtConfig({
  app: {
    head: {
      title: 'Oleg Vaskevich',
      meta: [
        { charset: 'utf-8' },
        {
          name: 'viewport',
          content: 'width=device-width, initial-scale=1.0',
        },
        {
          name: 'description',
          content: 'Software engineer living and working in Silicon Valley.',
        },
      ],
      link: [
        {
          rel: 'icon',
          type: 'image/png',
          href: '/favicon.png?v=3',
        },
        {
          rel: 'shortcut icon',
          href: '/favicon.ico?v=3',
        },
      ],
    },
  },

  css: ['~/assets/css/main.scss'],
  modules: [
    '~/modules/data',
    '@nuxt/content',
  ],

  compatibilityDate: '2024-04-03',
});
