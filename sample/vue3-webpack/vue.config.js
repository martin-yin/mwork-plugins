const { defineConfig } = require('@vue/cli-service');
module.exports = defineConfig({
  transpileDependencies: true,
  chainWebpack: config => {
    config.module
      .rule('vue')
      .test(/\.vue$/)
      .use('vue-template-log')
      .loader('@mwork-plugins/webpack/dist/vueTemplateLog')
      .options({
        events: ['cancel', 'ok', 'click'],
        enable: true
      })
      .end();
  }
});
