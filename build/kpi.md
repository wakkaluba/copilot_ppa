<!-- filepath: d:\___coding\tools\copilot_ppa\build\kpi.md -->
# Key Performance Indicators

_Last updated: May 16, 2025_

## Test & Coverage Metrics
- **Unit Test Count**: Automated (see test-coverage-report.md)
- **Unit Test Pass Rate**: Automated (see test-coverage-report.md)
- **Integration Test Coverage**: Automated (see coverage-reports/)
- **Critical Path Coverage**: 100% (see code-coverage.md)
- **Test Sharding**: Enabled (see zzzscripts/test-sharding.js)

## Static Analysis & Linting
- **Linting Compliance**: 100% (see build.sh, finished.md, todo.md)
- **ESLint/Prettier Setup**: Complete
- **Lint Failures**: 0 (build breaks on lint error)
- **Code Smells Detected**: Automated (see codeQualityService.test.ts, codeAnalysisService.test.ts)
- **Duplicated Code Blocks**: Automated (see bestPracticesChecker.test.ts, codeOptimizer.test.js)
- **Largest Duplication**: <50 lines (see coverage-reports/comprehensive-coverage-report-finished.md)

## Code Complexity & Maintainability
- **Cyclomatic Complexity (Critical Path)**: No files exceed threshold (see code-coverage.md, analyze_code_quality.js)
- **Functions >15 Complexity**: 0 (see coverage-reports/comprehensive-coverage-report-2025-05-14T06-24-43-042Z.md)
- **Long Methods (>100 lines)**: 0 (see code quality scripts)
- **Technical Debt**: Tracked (see analyze_code_quality.js)

## Security & Dependency Health
- **Security Test Coverage**: Automated (see security/codeScanner.test.ts, dependencyScanner.test.js)
- **Vulnerability Scan**: Automated (see DependencyScanService, VulnerabilityService)
- **OWASP Compliance**: In progress (see refactoring-progress.md)

## Documentation & Orphaned Code
- **Documentation Coverage**: Improving (see comprehensive-coverage-report.bak.md, refactoring-status.md)
- **Orphaned Code/Files**: Tracked (see orphaned-code-report.md)
- **Refactoring Progress**: Ongoing (see refactoring/refactoring-progress.md)

## Build & Automation
- **Build Lint/Fail Fast**: Enforced (see build.sh)
- **Automated Code Quality Checks**: Enabled (see zzzscripts/analyze_code_quality.js)
- **CI/CD Integration**: Noted (see build.sh, deploy.sh)

---
_This KPI sheet is auto-summarized from test, static analysis, and refactoring artifacts. For details, see referenced files._
