const { defineConfig } = require('@vue/cli-service');

// const VueTemplateLog = require('work-webpack/loaders/vueTemplateLog');

module.exports = defineConfig({
  transpileDependencies: true,

  chainWebpack: config => {
    config.module
      .rule('vue')
      .test(/\.vue$/)
      .use('vue-template-log')
      .loader('work-webpack/loaders/vueTemplateLog');
  }
});
