import { defineConfig } from '@rsbuild/core';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)));

export default defineConfig({
  source: {
    entry: {
      index: './src/js/pages/index.js',
      upsell: './src/js/pages/upsell.js',
      'thank-you': './src/js/pages/thank-you.js',
    },
  },
  resolve: {
    alias: {
      '@core': path.resolve(projectRoot, 'src/js/core'),
      '@features': path.resolve(projectRoot, 'src/js/features'),
      '@pages': path.resolve(projectRoot, 'src/js/pages'),
      '@locales': path.resolve(projectRoot, 'src/locales'),
      '@css': path.resolve(projectRoot, 'src/css'),
    },
  },
  tools: {
    htmlPlugin(config, { entryName }) {
      config.template = `./pages/${entryName}.html`;
      config.filename = `${entryName}.html`;
      config.inject = true;
      config.title = '';
      config.meta = {};
      config.favicon = undefined;
    },
  },
  server: {
    port: 3000,
  },
  output: {
    distPath: 'dist',
    assetPrefix: 'auto',
  },
  performance: {
    chunkSplit: {
      strategy: 'split-by-experience',
    },
  },
});
