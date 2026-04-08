export default {
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
