#!/usr/bin/env node
/**
 * analyze_code_quality.js
 *
 * Runs ESLint on the project, outputs a summary of code quality issues, and exits with nonzero code on errors.
 * Intended for scheduled and CI use. Follows project coding standards and outputs results in a CI-friendly format.
 *
 * Usage: node zzzscripts/analyze_code_quality.js
 */

const { execSync } = require('child_process');
const fs = require('fs');

function runESLint() {
  try {
    execSync('npx eslint . --format json -o lint-report.json', { stdio: 'inherit' });
    return true;
  } catch (err) {
    console.error('[ERROR] ESLint execution failed:', err.message);
    return false;
  }
}

function main() {
  if (!runESLint()) {
    process.exit(1);
  }
  try {
    const report = JSON.parse(fs.readFileSync('lint-report.json', 'utf-8'));
    const errorCount = report.reduce((sum, file) => sum + file.errorCount, 0);
    const warningCount = report.reduce((sum, file) => sum + file.warningCount, 0);
    console.log(`ESLint: ${errorCount} errors, ${warningCount} warnings`);
    if (errorCount > 0) process.exit(1);
  } catch (err) {
    console.error('[ERROR] Failed to read or parse lint report:', err.message);
    process.exit(1);
  }
}

main();
