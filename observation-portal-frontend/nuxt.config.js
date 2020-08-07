
export default {
  telemetry: false,
  /*
  ** Nuxt rendering mode
  ** See https://nuxtjs.org/api/configuration-mode
  */
  mode: 'universal',
  /*
  ** Nuxt target
  ** See https://nuxtjs.org/api/configuration-target
  */
  target: 'server',
  /*
  ** Headers of the page
  ** See https://nuxtjs.org/api/configuration-head
  */
  head: {
    title: process.env.npm_package_name || '',
    meta: [  
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: process.env.npm_package_description || '' },
      { 'http-equiv': 'X-UA-Compatible', content: 'IE=edge' }
    ],
    link: [
      { rel: 'shortcut icon', type: 'image/png', href: 'https://cdn.lco.global/mainstyle/img/favicon-trans.png' },
      { rel: 'apple-touch-icon', href: 'https://cdn.lco.global/mainstyle/img/favicon.png' },
      { rel: 'stylesheet', href: 'https://use.fontawesome.com/releases/v5.8.1/css/all.css', integrity: '"sha384-50oBUHEmvpQ+1lW4y57PTFmhCaXp0ML5d60M1M7uH2+nqUivzIebhndOJK28anvf', crossorigin: 'anonymous'},
      { rel: 'stylesheet', href: 'https://cdn.lco.global/mainstyle/css/affogato-1.0.0.css' },
      { rel: 'stylesheet', href: 'https://cdn.lco.global/mainstyle/css/lco-1.0.0.css' }  
    ]
  },
  /*
  ** Global CSS
  */
  css: [
  ],
  /*
  ** Plugins to load before mounting the App
  ** https://nuxtjs.org/guide/plugins
  */
  plugins: [
    { ssr: false, src: '~/assets/js/init.js' }
  ],
  /*
  ** Auto import components
  ** See https://nuxtjs.org/api/configuration-components
  */
  components: true,
  /*
  ** Nuxt.js dev-modules
  */
  buildModules: [
    // Doc: https://github.com/nuxt-community/eslint-module
    '@nuxtjs/eslint-module',

    // Doc: https://github.com/nuxt-community/router-module
    '@nuxtjs/router',
  ],
  /*
  ** Nuxt.js modules
  */
  modules: [
    // Doc: https://bootstrap-vue.js.org
    'bootstrap-vue/nuxt',
    // Doc: https://axios.nuxtjs.org/usage
    '@nuxtjs/axios',
  ],
  /*
  ** Axios module configuration
  ** See https://axios.nuxtjs.org/options
  */
  axios: {},
  /*
  ** Build configuration
  ** See https://nuxtjs.org/api/configuration-build/
  */
  build: {
  },
  publicRuntimeConfig: {
    portalUrl: process.env.PORTAL_URL
  },
  privateRuntimeConfig: {
    internalPortalUrl: process.env.INTERNAL_PORTAL_URL
  },
  serverMiddleware: [
    { path: '/', handler: '~/accounts/serverMiddleware.js' },

  ]

}
