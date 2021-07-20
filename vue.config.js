const path = require('path');

module.exports = {
  chainWebpack: config => {
    config.plugin('html').tap(args => {
      args[0].title = 'LCO Observation Portal';
      return args;
    });
  },
  configureWebpack: () => {
    return {
      resolve: {
        alias: {
          // This is needed for jquery-file-download/src/Scripts/jquery.fileDownload.js and
          // aladin (used by ocs-component-lib) to work
          jquery: path.join(__dirname, 'node_modules/jquery/src/jquery')
        }
      }
    };
  }
};
