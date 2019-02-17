import minimist from 'minimist';

const argv = minimist(process.argv.slice(2), {
  alias: {
    H: 'hostname',
    p: 'port',
  },
  string: ['H'],
  unknown: () => false,
});

const port = argv.port || process.env.PORT || process.env.npm_package_config_nuxt_port || '3000';
const host = argv.hostname || process.env.HOST || process.env.npm_package_config_nuxt_host || 'localhost';

export default {
  env: {
    baseUrl: process.env.BASE_URL || `http://${host}:${port}`,
  },
  head: {
    title: 'Oleg Vaskevich',
    meta: [
      {charset: 'utf-8'},
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1.0',
      },
      {
        hid: 'description',
        name: 'description',
        content: 'Software engineer living and working in Silicon Valley.',
      },
    ],
    link: [
      {
        rel: 'icon',
        type: 'image/icon',
        href: '/favicon.png',
      },
    ],
  },
  /*
   ** Customize the progress-bar color
   */
  loading: {color: '#3B8070'},

  /*
   ** Build configuration
   */
  css: ['~/assets/css/main.scss'],
  build: {
    typescript: true,
  },
  modules: ['@nuxtjs/axios', '~/modules/.generated/data'],
  axios: {},
  plugins: [{src: '~/plugins/vendor'}, {src: '~/plugins/vh-fix', mode: 'client'}],
  generate: {
    fallback: true,
    subFolders: false,
  },
  server: {
    host: '0.0.0.0',
  },
};
