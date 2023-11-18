import { defineConfig } from 'tsup';

const baseConfig = {
  clean: true,
  treeshake: true,
  dts: true
};
export default defineConfig([
  {
    entry: ['src/index.ts'],
    format: ['cjs'],
    ...baseConfig
  },
  {
    entry: ['src/loaders/vueTemplateLog.ts'],
    format: ['cjs'],
    ...baseConfig
  }
]);
