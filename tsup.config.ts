import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs'],
  clean: true,
  treeshake: true,
  dts: {
    resolve: true
  }
});
