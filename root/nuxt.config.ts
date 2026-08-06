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
          type: 'module',
          src: 'https://ajax.googleapis.com/ajax/libs/model-viewer/4.0.0/model-viewer.min.js',
        },
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

  vue: {
    compilerOptions: {
      isCustomElement: (tag) => tag === 'model-viewer',
    },
  },

  css: ['~/assets/css/main.scss', 'katex/dist/katex.min.css'],
  content: {
    build: {
      markdown: {
        highlight: {
          theme: 'github-dark',
          langs: ['cpp', 'c', 'js', 'ts', 'html', 'css', 'json', 'bash', 'yaml', 'python'],
        },
        remarkPlugins: {
          'remark-math': {},
        },
        rehypePlugins: {
          'rehype-katex': {
            options: {
              macros: {
                // siunitx command macros
                '\\qty': '#1\\,\\mathrm{#2}',
                '\\unit': '\\mathrm{#1}',
                '\\SI': '#1\\,\\mathrm{#2}',
                '\\si': '\\mathrm{#1}',
                '\\ang': '#1^\\circ',
                '\\num': '#1',

                // siunitx unit macros
                '\\m': 'm',
                '\\meter': 'm',
                '\\meters': 'm',
                '\\mm': 'mm',
                '\\millimeter': 'mm',
                '\\cm': 'cm',
                '\\centimeter': 'cm',
                '\\km': 'km',
                '\\kilometer': 'km',
                '\\s': 's',
                '\\second': 's',
                '\\seconds': 's',
                '\\ms': 'ms',
                '\\millisecond': 'ms',
                '\\min': 'min',
                '\\minute': 'min',
                '\\h': 'h',
                '\\hour': 'h',
                '\\g': 'g',
                '\\gram': 'g',
                '\\kg': 'kg',
                '\\kilogram': 'kg',
                '\\lb': 'lb',
                '\\lbs': 'lb',
                '\\pound': 'lb',
                '\\pounds': 'lb',
                '\\inch': 'in',
                '\\inches': 'in',
                '\\foot': 'ft',
                '\\feet': 'ft',
                '\\rpm': '\\mathrm{rpm}',
                '\\volt': 'V',
                '\\millivolt': 'mV',
                '\\ampere': 'A',
                '\\milliampere': 'mA',
                '\\watt': 'W',
                '\\milliwatt': 'mW',
                '\\kilowatt': 'kW',
                '\\joule': 'J',
                '\\hertz': 'Hz',
                '\\kilohertz': 'kHz',
                '\\megahertz': 'MHz',
                '\\ohm': '\\Omega',
                '\\kelvin': 'K',
                '\\celsius': '^\\circ\\mathrm{C}',
                '\\degree': '^\\circ',
                '\\percent': '\\%',
                '\\per': '/',

                // siunitx prefix macros
                '\\milli': 'm',
                '\\kilo': 'k',
                '\\mega': 'M',
                '\\giga': 'G',
                '\\micro': '\\mu',
                '\\nano': 'n',
                '\\pico': 'p',
              },
            },
          },
        },
      },
    },
  },
  modules: ['@nuxt/content', '@nuxt/eslint'],
  vite: {
    optimizeDeps: {
      include: ['mermaid'],
    },
  },

  routeRules: {
    '/images/**': {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    },
  },

  compatibilityDate: '2024-04-03',
});
