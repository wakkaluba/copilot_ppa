module.exports = {
  extension: [
    '.ts'
  ],
  include: [
    'src/**/*.ts'
  ],
  exclude: [
    'src/test/**/*.ts',
    'src/__mocks__/**',
    'src/test/helpers/**',
    'out/**/*.js',
    'dist/**/*.js'
  ],
  reporter: [
    'html',
    'text',
    'lcov',
    'json-summary',
    'cobertura'
  ],
  all: true,
  'check-coverage': true,
  branches: 80,
  lines: 85,
  functions: 85,
  statements: 85,
  'skip-full': true,
  'skip-empty': true,
  excludeNodeModules: true,
  cleanCache: true,
  tempDirectory: './coverage/.nyc_output'
};