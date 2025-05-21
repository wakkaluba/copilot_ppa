#!/usr/bin/env bash
# zzzscripts/ci-coverage-audit.sh
# Runs code coverage and security audit checks for CI integration.
# Outputs reports to zzzbuild/coverage-reports/ and zzzrefactoring/security-audit-report.json

set -e

mkdir -p zzzbuild/coverage-reports
mkdir -p zzzrefactoring

# Run tests with coverage
npm run test -- --coverage --coverageReporters="json-summary" --coverageReporters="lcov" --coverageDirectory=zzzbuild/coverage-reports

# Copy summary for CI artifact
cp coverage/coverage-summary.json zzzbuild/coverage-reports/coverage-summary.json || true
cp coverage/lcov.info zzzbuild/coverage-reports/lcov.info || true

# Run security audit
npm audit --json > zzzrefactoring/security-audit-report.json || true

# Print summary
cat zzzbuild/coverage-reports/coverage-summary.json || echo "No coverage summary found."
cat zzzrefactoring/security-audit-report.json | head -40 || echo "No security audit report found."
