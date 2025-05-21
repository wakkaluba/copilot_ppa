// zzzscripts/remove-interface-prefix.js
const fs = require('fs');
const path = require('path');

const interfaceMap = [
  { name: 'IProviderInfo', file: 'zzzbuild/backups/orphaned-code/src/services/llm/ProviderRegistry.ts' },
  { name: 'IProviderStatus', file: 'zzzbuild/backups/orphaned-code/src/services/llm/providers/BaseLLMProvider.ts' },
  { name: 'ILLMConnectionOptions', file: 'zzzbuild/backups/orphaned-code/src/types/llm.ts' },
  { name: 'IJSDocTSDocGenerationOptions', file: 'zzzbuild/backups/orphaned-code/src/types/documentation.ts' },
  { name: 'ICICDProvider', file: 'zzzbuild/backups/orphaned-code/src/services/cicd/ICICDProvider.ts' },
  { name: 'IContext', file: 'zzzbuild/backups/orphaned-code/src/types/context.ts' },
  { name: 'IChatMessage', file: 'zzzbuild/backups/orphaned-code/src/types/conversation.ts' },
  { name: 'ISearchOptions', file: 'zzzbuild/backups/orphaned-code/src/services/conversationSearchService.ts' },
  { name: 'ISearchFilters', file: 'zzzbuild/backups/orphaned-code/src/services/conversationSearchService.ts' },
  { name: 'IConversationSearchResult', file: 'zzzbuild/backups/orphaned-code/src/services/conversationSearchService.ts' },
  { name: 'IServiceRegistry', file: 'zzzbuild/backups/orphaned-code/src/services/ServiceRegistry.ts' },
  { name: 'IMemoryUsage', file: 'zzzbuild/backups/orphaned-code/src/services/resourceManager.ts' },
  { name: 'IConversationSnippet', file: 'zzzbuild/backups/orphaned-code/src/services/snippetManager.ts' },
  { name: 'ITeamMember', file: 'zzzbuild/backups/orphaned-code/src/team/teamService.ts' },
  { name: 'ITeamSession', file: 'zzzbuild/backups/orphaned-code/src/team/teamService.ts' },
  { name: 'ISecurityIssue', file: 'src/security/types.ts' },
  { name: 'ISecurityAnalysisResult', file: 'src/security/types.ts' },
  { name: 'ISecurityScanOptions', file: 'src/security/types.ts' },
  { name: 'ISecurityReportOptions', file: 'src/security/types.ts' },
  { name: 'ISecurityViewOptions', file: 'src/security/types.ts' },
  { name: 'ISecurityProvider', file: 'src/security/types.ts' },
  { name: 'ISecurityCodeActionProvider', file: 'src/security/types.ts' },
  { name: 'ISecurityDiagnosticProvider', file: 'src/security/types.ts' },
  { name: 'ISecurityHoverProvider', file: 'src/security/types.ts' },
  { name: 'ISecurityPattern', file: 'src/security/types.ts' },
  { name: 'ICodeScanResult', file: 'src/security/types.ts' },
  { name: 'IService', file: 'zzzbuild/backups/orphaned-code/src/services/interfaces.ts' },
  { name: 'IConfigService', file: 'zzzbuild/backups/orphaned-code/src/services/interfaces.ts' },
  { name: 'IStatusBarService', file: 'zzzbuild/backups/orphaned-code/src/services/interfaces.ts' },
  { name: 'ICommandService', file: 'zzzbuild/backups/orphaned-code/src/services/interfaces.ts' },
  { name: 'ITelemetryService', file: 'zzzbuild/backups/orphaned-code/src/services/interfaces.ts' },
  { name: 'IServiceContainer', file: 'zzzbuild/backups/orphaned-code/src/services/interfaces.ts' },
];

function refactorInterfaceName(filePath, oldName, newName) {
  const absPath = path.resolve(filePath);
  let content = fs.readFileSync(absPath, 'utf8');
  // Replace interface declaration
  content = content.replace(
    new RegExp(`interface\\s+${oldName}\\b`, 'g'),
    `interface ${newName}`
  );
  // Replace all usages
  content = content.replace(
    new RegExp(`\\b${oldName}\\b`, 'g'),
    newName
  );
  fs.writeFileSync(absPath, content, 'utf8');
  console.log(`Refactored ${oldName} → ${newName} in ${filePath}`);
}

for (const { name, file } of interfaceMap) {
  if (name.startsWith('I') && name[1] === name[1].toUpperCase()) {
    const newName = name.slice(1);
    refactorInterfaceName(file, name, newName);
  }
}
