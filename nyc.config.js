module.exports = {
  extends: '@istanbuljs/nyc-config-typescript',
  extension: [
    '.ts',
    '.tsx'
  ],
  include: [
    'src/**/*.ts',
    'src/**/*.tsx'
  ],
  exclude: [
    'src/test/**/*.ts',
    'src/__mocks__/**',
    'src/test/helpers/**',
    'src/**/*.d.ts',
    'src/**/*.test.ts',
    'src/**/*.spec.ts',
    'out/**/*.js',
    'dist/**/*.js'
  ],
  reporter: [
    'html',
    'text',
    'text-summary',
    'lcov',
    'json-summary',
    'cobertura'
  ],
  'report-dir': './coverage',
  all: true,
  'check-coverage': true,
  branches: 85,
  lines: 90,
  functions: 90,
  statements: 90,
  'skip-full': true,
  'skip-empty': true,
  excludeNodeModules: true,
  cleanCache: true,
  cache: true,
  'cache-dir': './coverage/.nyc_output',
  'temp-dir': './coverage/.nyc_output',
  'hook-require': true,
  'hook-run-in-context': true,
  'hook-run-in-this-context': true,
  instrument: true,
  sourceMap: true,
  'produce-source-map': true,
  'preserve-comments': true,
  'per-file': true,
  'watermarks': {
    lines: [80, 95],
    functions: [80, 95],
    branches: [80, 95],
    statements: [80, 95]
  }
};