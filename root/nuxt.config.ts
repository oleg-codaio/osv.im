import {defineNuxtConfig} from 'nuxt/config';

export default defineNuxtConfig({
  app: {
    head: {
      title: 'Oleg Vaskevich',
      meta: [
        {charset: 'utf-8'},
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
      script: [
        {
          async: true,
          type: 'text/javascript',
          src: 'https://www.tracemyip.org/vLg/lgUrl.php?pidnVar2=324472731&prtVar2=18&stlVar2=1110&rgtype=4684NR-IPIB&scvVar2=12&gustInvT=fzize0',
          tagPosition: 'bodyClose',
        },
      ],
      noscript: [
        {
          innerHTML:
            '<a href="https://www.tracemyip.org/GDPR-compliant-website-tracking-software.htm"><img src="https://www.tracemyip.org/vLg/1110/4684NR-IPIB/324472731/18/12/ans/" alt="GDPR compliant web site visits tracking" referrerpolicy="no-referrer-when-downgrade" style="border:0px;"></a>',
          tagPosition: 'bodyClose',
        },
      ],
    },
  },

  css: ['~/assets/css/main.scss'],
  modules: ['@nuxt/content', '@nuxt/eslint'],

  compatibilityDate: '2024-04-03',
});
