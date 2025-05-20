#!/usr/bin/env node
/**
 * Script: performance-security-automation.js
 * Automates performance and security test runs, collects results, runs npm audit/outdated, and outputs reports for CI integration.
 *
 * - Runs `npm audit --json` and writes to perfsec-reports/npm-audit-report.json
 * - Runs `npm outdated --json` and writes to perfsec-reports/npm-outdated-report.json
 * - Runs performance tests (placeholder) and writes to perfsec-reports/performance-report.json
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.resolve(__dirname, '../zzzrefactoring/perfsec-reports');
const AUDIT_REPORT = path.join(OUTPUT_DIR, 'npm-audit-report.json');
const OUTDATED_REPORT = path.join(OUTPUT_DIR, 'npm-outdated-report.json');
const PERF_REPORT = path.join(OUTPUT_DIR, 'performance-report.json');

function ensureDirSync(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function runCommand(cmd) {
  try {
    return execSync(cmd, { encoding: 'utf-8', stdio: 'pipe' });
  } catch (e) {
    return e.stdout ? e.stdout.toString() : e.message;
  }
}

function runNpmAudit() {
  const result = runCommand('npm audit --json');
  fs.writeFileSync(AUDIT_REPORT, result, 'utf-8');
}

function runNpmOutdated() {
  const result = runCommand('npm outdated --json');
  fs.writeFileSync(OUTDATED_REPORT, result, 'utf-8');
}

function runPerformanceTests() {
  // TODO: Replace with actual performance test runner if available
  const perfResult = { timestamp: new Date().toISOString(), status: 'No perf tests implemented' };
  fs.writeFileSync(PERF_REPORT, JSON.stringify(perfResult, null, 2), 'utf-8');
}

function main() {
  ensureDirSync(OUTPUT_DIR);
  console.log('Running npm audit...');
  runNpmAudit();
  console.log('Running npm outdated...');
  runNpmOutdated();
  console.log('Running performance tests...');
  runPerformanceTests();
  console.log('Performance and security automation complete. Reports written to', OUTPUT_DIR);
}

if (require.main === module) {
  main();
}
