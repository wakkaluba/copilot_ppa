#!/usr/bin/env node
/**
 * analyze_code_quality.js
 *
 * Runs ESLint on the project, outputs a summary of code quality issues, and exits with nonzero code on errors.
 * Intended for scheduled and CI use. Follows project coding standards and outputs results in a CI-friendly format.
 *
 * Usage: node zzzscripts/analyze_code_quality.js
 */

const { ESLint } = require('eslint');

(async function main() {
  try {
    const eslint = new ESLint({
      extensions: ['.js', '.ts'],
      ignorePath: '.eslintignore',
      fix: false
    });
    const results = await eslint.lintFiles(['src/**/*.js', 'src/**/*.ts']);
    const formatter = await eslint.loadFormatter('stylish');
    const resultText = formatter.format(results);
    const errorCount = results.reduce((sum, r) => sum + r.errorCount, 0);
    const warningCount = results.reduce((sum, r) => sum + r.warningCount, 0);

    if (resultText) {
      // Output the formatted lint results
      console.log(resultText);
    }
    // Output a summary for CI
    console.log(`\nCode Quality Summary:`);
    console.log(`  Errors:   ${errorCount}`);
    console.log(`  Warnings: ${warningCount}`);
    if (errorCount > 0) {
      console.error('❌ Code quality check failed. Please fix the above errors.');
      process.exit(1);
    } else {
      console.log('✅ Code quality check passed.');
      process.exit(0);
    }
  } catch (err) {
    console.error('Error running ESLint:', err);
    process.exit(2);
  }
})();
