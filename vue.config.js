module.exports = {
  chainWebpack: config => {
    config
      .plugin('html')
      .tap(args => {
        args[0].title = 'LCO Observation Portal'
        return args
      })
  }
}
