const { defineConfig } = require('@vue/cli-service');

const { SafeDeleteFile, ModulesAnalysis } = require('work-webpack');
module.exports = defineConfig({
  transpileDependencies: true,

  configureWebpack: {
    plugins: [new SafeDeleteFile(), new ModulesAnalysis()]
  }
});
