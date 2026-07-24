import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)));

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './tests/setup.js',
    include: ['tests/**/*.{test,spec}.js'],
    exclude: ['node_modules', 'dist'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/js/**/*.js'],
      exclude: ['node_modules', 'dist', 'tests', '**/*.config.js'],
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
});
