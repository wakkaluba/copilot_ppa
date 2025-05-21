#!/usr/bin/env bash
# zzzscripts/security-audit.sh
# Script to conduct periodic security audits and vulnerability assessments
# Usage: ./zzzscripts/security-audit.sh

set -e

REPORT_DIR="zzzrefactoring/security-audit-reports"
mkdir -p "$REPORT_DIR"
DATE=$(date +%Y-%m-%d_%H-%M-%S)
REPORT_FILE="$REPORT_DIR/security-audit-$DATE.json"

# Run npm audit
npm audit --json > "$REPORT_FILE" || true

# Optionally run additional tools (e.g., Snyk, safety for Python, etc.)
# snyk test --json > "$REPORT_DIR/snyk-audit-$DATE.json" || true

# Print summary
cat "$REPORT_FILE" | head -40 || echo "No security audit report found."

echo "Security audit complete. Report saved to $REPORT_FILE."
