import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    testTimeout: 10000,
    include: [
      'server/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts}'
    ],
    exclude: [
      'src/**/*'
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './server/coverage',
      exclude: [
        'node_modules/',
        'dist/',
        'src/',
        '**/*.d.ts',
        '**/*.test.ts',
        '**/*.spec.ts',
        'coverage/**'
      ]
    }
  }
})