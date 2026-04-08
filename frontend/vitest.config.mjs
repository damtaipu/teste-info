import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT_DIR = path.dirname(fileURLToPath(import.meta.url));

export default {
  root: ROOT_DIR,
  resolve: {
    preserveSymlinks: true,
  },
  test: {
    include: ['src/**/*.spec.ts'],
    globals: true,
    environment: 'jsdom',
    setupFiles: ['src/test-setup.ts'],
    pool: 'threads',
    isolate: false,
    sequence: {
      setupFiles: 'list',
    },
  },
};
