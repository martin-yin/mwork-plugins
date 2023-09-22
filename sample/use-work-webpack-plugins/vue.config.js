const { defineConfig } = require('@vue/cli-service')

const { SafeDeleteFile, ModulesAnalysis } = require("../../src/index")
module.exports = defineConfig({
  transpileDependencies: true,

  configureWebpack: {
    plugins: [new SafeDeleteFile(), new ModulesAnalysis()]
  }
})
