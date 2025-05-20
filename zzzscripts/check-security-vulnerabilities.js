#!/usr/bin/env node
/**
 * Script: check-security-vulnerabilities.js
 * Checks for security vulnerabilities using npm audit and outputs a summary report.
 * Optionally integrates with Snyk if available.
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function runNpmAudit() {
  try {
    const result = execSync('npm audit --json', { encoding: 'utf-8' });
    return JSON.parse(result);
  } catch (err) {
    if (err.stdout) {
      return JSON.parse(err.stdout);
    }
    throw err;
  }
}

function writeReport(report, filePath) {
  fs.writeFileSync(filePath, JSON.stringify(report, null, 2), 'utf-8');
}

function main() {
  const auditReport = runNpmAudit();
  const outputPath = path.resolve(__dirname, '../zzzrefactoring/security-audit-report.json');
  writeReport(auditReport, outputPath);
  const advisories = auditReport.metadata && auditReport.metadata.vulnerabilities;
  if (advisories) {
    console.log('Vulnerability summary:', advisories);
  } else {
    console.log('No vulnerabilities found or unable to parse audit report.');
  }
  console.log('Full audit report written to', outputPath);
}

if (require.main === module) {
  main();
}
