const { defineConfig } = require('@vue/cli-service');
const { SafeDeleteFile, ModulesAnalysis } = require('@mwork-plugins/webpack');

module.exports = defineConfig({
  transpileDependencies: true,
  configureWebpack: {
    plugins: [
      new SafeDeleteFile({
        enable: true,
      }),
      new ModulesAnalysis({
        enable: true,
      })]
  },
});
