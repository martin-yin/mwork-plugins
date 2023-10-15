import { defineConfig } from 'tsup';

const baseConfig = {
  clean: true,
  treeshake: true,
  dts: true
};

export default defineConfig([
  {
    entry: ['src/plugins/index.ts'],
    outDir: 'plugins',
    format: ['cjs'],
    ...baseConfig
  },
  {
    entry: ['src/loaders/vueTemplateLog.ts'],
    outDir: 'loaders',
    format: ['cjs'],
    ...baseConfig,
    dts: false
  }
]);
