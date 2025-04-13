module.exports = {
  extension: [
    '.ts'
  ],
  include: [
    'src/**/*.ts'
  ],
  exclude: [
    'src/test/**/*.ts',
    'out/**/*.js'
  ],
  reporter: [
    'html',
    'text',
    'lcov'
  ],
  all: true,
  'check-coverage': true,
  branches: 70,
  lines: 80,
  functions: 80,
  statements: 80
};