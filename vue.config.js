const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  publicPath: '',
  outputDir: 'src-tauri/target/webpack_dist'
})
