#!/usr/bin/env node
/**
 * Script: performance-security-automation.js
 * Automates performance and security test runs, reporting, and integration with CI.
 * - Runs performance and security test suites
 * - Collects and summarizes results
 * - Optionally triggers npm audit/outdated and security scans
 * - Outputs reports to zzzbuild/test-reports and zzzrefactoring/security-audit-report.json
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const TEST_REPORTS_DIR = path.resolve(__dirname, '../zzzbuild/test-reports');
const SECURITY_AUDIT_REPORT = path.resolve(__dirname, '../zzzrefactoring/security-audit-report.json');

function ensureDirSync(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function runCommand(command, description) {
  try {
    console.log(`\n[Automation] ${description}...`);
    const output = execSync(command, { encoding: 'utf-8', stdio: 'pipe' });
    return output;
  } catch (err) {
    console.error(`[Automation] Error running: ${command}`);
    return err.stdout ? err.stdout.toString() : err.message;
  }
}

function runPerformanceTests() {
  // Example: run Jest with performance config or custom script
  return runCommand('npm run test:performance || echo "No performance test script"', 'Running performance tests');
}

function runSecurityTests() {
  // Example: run Jest with security config or custom script
  return runCommand('npm run test:security || echo "No security test script"', 'Running security tests');
}

function runNpmAudit() {
  const auditOutput = runCommand('npm audit --json', 'Running npm audit');
  try {
    fs.writeFileSync(SECURITY_AUDIT_REPORT, auditOutput, 'utf-8');
    console.log(`[Automation] Security audit report written to ${SECURITY_AUDIT_REPORT}`);
  } catch (e) {
    console.error('[Automation] Failed to write security audit report:', e.message);
  }
}

function runNpmOutdated() {
  return runCommand('npm outdated || echo "No outdated packages"', 'Checking for outdated npm packages');
}

function main() {
  ensureDirSync(TEST_REPORTS_DIR);
  // Run performance and security tests
  const perfResult = runPerformanceTests();
  const secResult = runSecurityTests();
  // Save results
  fs.writeFileSync(path.join(TEST_REPORTS_DIR, 'performance-test-output.txt'), perfResult, 'utf-8');
  fs.writeFileSync(path.join(TEST_REPORTS_DIR, 'security-test-output.txt'), secResult, 'utf-8');
  // Run npm audit and outdated
  runNpmAudit();
  const outdatedResult = runNpmOutdated();
  fs.writeFileSync(path.join(TEST_REPORTS_DIR, 'npm-outdated.txt'), outdatedResult, 'utf-8');
  console.log('[Automation] Performance and security automation complete.');
}

if (require.main === module) {
  main();
}
