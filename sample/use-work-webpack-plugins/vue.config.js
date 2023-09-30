const { defineConfig } = require('@vue/cli-service')

const { SafeDeleteFile } = require("work-webpack")
module.exports = defineConfig({
  transpileDependencies: true,

  configureWebpack: {
    plugins: [new SafeDeleteFile()]
  }
})
