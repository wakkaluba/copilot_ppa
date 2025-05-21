# 🧹 Automated & Expanded Cleanup/Refactoring Task List

## [COMPLETED] I-prefixed Interface Mapping and Refactor Script
- All I-prefixed interfaces and their file locations have been mapped.
- The script `zzzscripts/remove-interface-prefix.js` is updated to automate the removal of the I-prefix from interface names and their usages across the codebase.
- Next: Run the script and review results.

## Issues found
1. Naming Convention Violations
Many interfaces do not follow the required I-prefixed PascalCase naming (e.g., interface UserAccount should be interface IUserAccount).
This occurs in many files, including but not limited to:
src/llm/types.ts
src/services/conversationSearchService.ts
src/performance/metricsStorage.ts
src/diagnostics/systemRequirements.ts
src/team/teamService.ts
src/llm/services/LLMOptionsValidator.ts
src/llm/services/ModelScheduler.ts
src/llm/services/ModelMetricsManager.ts
src/commands.ts
src/security/types.ts
src/security/services/VulnerabilityService.ts
src/webview/displaySettings.ts
src/webview/webviewProvider.ts
src/webviews/sidebarPanel.ts
...and many more.
2. Use of any Type
Widespread use of the any type, which should be replaced with explicit, safe types.
This is present in:
src/llm/types.ts
src/llm/services/LLMOptionsValidator.ts
src/llm/services/ModelProvisioningService.ts
src/lllm/services/ModelScheduler.ts
src/llm/services/ModelValidator.ts
src/llm/services/ModelVersioningService.ts
src/diagnostics/systemRequirements.ts
src/performance/metricsStorage.ts
src/performance/performanceAnalyzer.ts
src/services/ContextManager.ts
src/services/CommandParser.ts
src/security/services/VulnerabilityService.ts
src/security/scanners/DependencyScanner.ts
...and many more.
3. Unused Variables/Parameters
Many variables and parameters are defined but never used. These should be removed or prefixed with _ to comply with lint rules.
Examples:
src/llm/services/ModelScheduler.ts
src/llm/services/ModelDiscoveryService.ts
src/diagnostics/systemRequirements.ts
src/performance/fileIndexer.ts
src/commands/structureReorganizationCommand.ts
src/security/dependencyScanner.ts
...and more.
4. Console Statements
console.log, console.error, etc., should be removed or replaced with proper logging mechanisms.
Found in:
src/services/ContextManager.ts
src/security/scanners/DependencyScanner.ts
src/utils/advancedLogger.ts
...and possibly others.
5. Import Errors and Non-Standard Imports
Use of require statements not at the top of files, or not using ES6 import syntax.
Found in:
src/performance/fileIndexer.ts
src/llm/services/ModelBenchmarkManager.ts
src/llm/services/ModelValidator.ts
src/debug/modelCompatibilityChecker.ts
...and more.
6. Missing Return Types
Many functions are missing explicit return types.
Found in:
src/buildTools/buildToolsManager.ts
src/performance/metricsStorage.ts
src/performance/performanceAnalyzer.ts
src/services/ContextManager.ts
...and more.
