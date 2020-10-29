module.exports = function (/* ctx */) {
  return {
    supportTS: false,
    boot: ['axios', 'web3', 'services', 'auth', 'components'],

    css: ['app.scss'],

    extras: ['roboto-font', 'material-icons'],

    build: {
      vueRouterMode: 'hash',
      // env: {
      //   LOG: 'debug',
      // },

      extendWebpack(cfg) {
        cfg.module.rules.push({
          test: /\.(xml)$/,
          loader: 'raw-loader',
        });
      },
    },

    devServer: {
      https: false,
      port: 8080,
      open: true,
    },

    framework: {
      iconSet: 'material-icons',
      lang: 'en-us',
      config: {
        notify: {},
      },

      importStrategy: 'auto',
      plugins: ['Cookies', 'Notify', 'Loading', 'LocalStorage'],
    },

    animations: [],

    ssr: {
      pwa: false,
    },

    pwa: {
      workboxPluginMode: 'GenerateSW', // 'GenerateSW' or 'InjectManifest'
      workboxOptions: {}, // only for GenerateSW
      manifest: {
        name: `BIMContracts`,
        short_name: `BIMContracts`,
        description: `A Quasar Framework app`,
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#ffffff',
        theme_color: '#027be3',
        icons: [
          {
            src: 'icons/icon-128x128.png',
            sizes: '128x128',
            type: 'image/png',
          },
          {
            src: 'icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icons/icon-256x256.png',
            sizes: '256x256',
            type: 'image/png',
          },
          {
            src: 'icons/icon-384x384.png',
            sizes: '384x384',
            type: 'image/png',
          },
          {
            src: 'icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    },

    cordova: {},

    capacitor: {
      hideSplashscreen: true,
    },

    electron: {
      bundler: 'packager', // 'packager' or 'builder'

      packager: {},

      builder: {
        appId: 'bim-contracts',
      },

      nodeIntegration: true,

      extendWebpack(cfg) {
        cfg.module.rules.push({
          test: /\.(xml)$/,
          loader: 'raw-loader',
        });
      },
    },
  };
};
