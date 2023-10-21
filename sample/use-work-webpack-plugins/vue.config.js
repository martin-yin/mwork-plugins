const { defineConfig } = require('@vue/cli-service');
const { SafeDeleteFile, ModulesAnalysis } = require('work-webpack');

module.exports = defineConfig({
  transpileDependencies: true,
  configureWebpack: {
    plugins: [new SafeDeleteFile(), new ModulesAnalysis()]
  },
  chainWebpack: config => {
    config.module
      .rule('vue')
      .test(/\.vue$/)
      .use('vue-template-log')
      .loader('work-webpack/dist/vueTemplateLog').options({
        events: ['cancel', 'ok', 'click'],
        enable: true,
      }).end();
  }
});
