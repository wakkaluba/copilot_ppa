/**
 * Script to back up and remove the unused UnusedCodeAnalyzer files
 * identified in the orphaned code analysis
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const logger = require('./logger');

// Configuration
const rootDir = path.resolve(__dirname, '..');
const backupDir = path.join(rootDir, 'zzzbuild', 'backups', 'orphaned-code', 'unused-code-analyzer');
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

// Files to remove (from orphaned-code-report.md)
const filesToRemove = [
  'src/refactoring/codeAnalysis/UnusedCodeAnalyzer.js',
  'src/refactoring/codeAnalysis/UnusedCodeAnalyzer.ts',
  'src/refactoring/unusedCodeDetector.js',
  'src/refactoring/unusedCodeDetector.ts',
  'src/codeTools/services/UnusedCodeAnalyzerService.ts',
  'dist/refactoring/codeAnalysis/UnusedCodeAnalyzer.js',
  'dist/refactoring/codeAnalysis/UnusedCodeAnalyzer.d.ts',
  'dist/refactoring/unusedCodeDetector.js',
  'dist/codeTools/services/UnusedCodeAnalyzerService.js',
  'dist/codeTools/services/UnusedCodeAnalyzerService.d.ts'
];

/**
 * Create backup of files before deletion
 */
function backupFiles() {
  logger.log(`Creating backups in ${backupDir}...`);

  // Create backup directory with timestamp
  const timestampedBackupDir = path.join(backupDir, timestamp);
  if (!fs.existsSync(timestampedBackupDir)) {
    fs.mkdirSync(timestampedBackupDir, { recursive: true });
  }

  // Track successful backups
  const backedUpFiles = [];

  for (const filePath of filesToRemove) {
    const fullPath = path.join(rootDir, filePath);
    if (fs.existsSync(fullPath)) {
      try {
        // Create directory structure in backup location
        const backupFilePath = path.join(timestampedBackupDir, filePath);
        const backupDirPath = path.dirname(backupFilePath);
        if (!fs.existsSync(backupDirPath)) {
          fs.mkdirSync(backupDirPath, { recursive: true });
        }

        // Copy file to backup
        fs.copyFileSync(fullPath, backupFilePath);
        logger.log(`✅ Backed up: ${filePath}`);
        backedUpFiles.push(filePath);
      } catch (error) {
        logger.error(`❌ Error backing up ${filePath}: ${error.message}`);
      }
    } else {
      logger.log(`⚠️ File not found, skipping backup: ${filePath}`);
    }
  }

  logger.log(`Backup completed. ${backedUpFiles.length}/${filesToRemove.length} files backed up.`);
  return backedUpFiles;
}

/**
 * Remove files from codebase
 */
function removeFiles(backedUpFiles) {
  logger.log('\nRemoving files...');

  for (const filePath of filesToRemove) {
    const fullPath = path.join(rootDir, filePath);
    if (fs.existsSync(fullPath)) {
      try {
        // Check if file is tracked by git
        let isTracked = false;
        try {
          execSync(`git ls-files --error-unmatch "${fullPath}"`, {
            stdio: ['pipe', 'pipe', 'ignore']
          });
          isTracked = true;
        } catch (gitError) {
          isTracked = false;
        }

        if (isTracked) {
          // Remove via git for tracked files
          logger.log(`🗑️ Removing git-tracked file: ${filePath}`);
          execSync(`git rm "${fullPath}"`, { stdio: 'inherit' });
        } else {
          // Direct filesystem removal for untracked files
          fs.unlinkSync(fullPath);
          logger.log(`🗑️ Removed file: ${filePath}`);
        }
      } catch (error) {
        logger.error(`❌ Error removing ${filePath}: ${error.message}`);
      }
    } else {
      logger.log(`⚠️ File already removed: ${filePath}`);
    }
  }

  logger.log('Removal completed.');
}

/**
 * Update the orphaned code report to mark task as done
 */
function updateOrphanedCodeReport() {
  const reportPath = path.join(rootDir, 'zzzbuild', 'orphaned-code-report.md');

  if (!fs.existsSync(reportPath)) {
    logger.error('❌ Could not find orphaned-code-report.md to update');
    return;
  }

  try {
    let reportContent = fs.readFileSync(reportPath, 'utf8');

    // Update the status of UnusedCodeAnalyzer File Set
    reportContent = reportContent.replace(
      /### 3\. UnusedCodeAnalyzer File Set[\s\S]*?Status\*\*: Confirmed unused - safe to remove/,
      '### 3. UnusedCodeAnalyzer File Set\n- **Files**: (Removed - see backup in zzzbuild/backups/orphaned-code/unused-code-analyzer)\n- **Analysis**: Automated analysis confirmed these files were unused in the codebase.\n- **Action Taken**: Files were backed up and removed on ' + new Date().toISOString().split('T')[0] + '.\n- **Status**: ✅ Removed'
    );

    // Update the status of UnusedCodeAnalyzer in the Classes section
    reportContent = reportContent.replace(
      /### 1\. UnusedCodeAnalyzer[\s\S]*?Status\*\*: Confirmed unused - safe to remove \(previously: Partial implementation\)/,
      '### 1. UnusedCodeAnalyzer\n- **Files**: (Removed - see backup in zzzbuild/backups/orphaned-code/unused-code-analyzer)\n- **Analysis**: Implementation existed but was not utilized anywhere in the codebase.\n- **Action Taken**: Files were backed up and removed on ' + new Date().toISOString().split('T')[0] + '.\n- **Status**: ✅ Removed'
    );

    // Update the status of Language-Specific Analyzers
    reportContent = reportContent.replace(
      /### 2\. Language-Specific Analyzers for UnusedCodeAnalyzer[\s\S]*?Status\*\*: Obsolete \(parent component unused\)/,
      '### 2. Language-Specific Analyzers for UnusedCodeAnalyzer\n- **Description**: The UnusedCodeAnalyzer had a Map for language-specific analyzers but is now removed.\n- **Action Taken**: Related files were backed up and removed on ' + new Date().toISOString().split('T')[0] + '.\n- **Status**: ✅ Resolved (parent component removed)'
    );

    // Update the Analysis Summary
    reportContent = reportContent.replace(
      /\*\*Status Breakdown\*\*:[\s\S]*?- Inconsistency issue: 1/,
      '**Status Breakdown**:\n- Obsolete (duplicate): 1\n- ✅ Removed: 3\n- Partially integrated: 1\n- Requires integration: 2\n- Requires UI integration: 1\n- Missing implementation: 2\n- Feature gap: 1\n- Inconsistency issue: 1'
    );

    fs.writeFileSync(reportPath, reportContent);
    logger.log('✅ Updated orphaned-code-report.md');
  } catch (error) {
    logger.error(`❌ Error updating orphaned-code-report.md: ${error.message}`);
  }
}

/**
 * Main function
 */
function main() {
  logger.log('=== UnusedCodeAnalyzer Removal Tool ===');

  // Step 1: Back up files
  const backedUpFiles = backupFiles();

  // Step 2: Remove files after backup
  if (backedUpFiles.length > 0) {
    removeFiles(backedUpFiles);

    // Step 3: Update the orphaned code report
    updateOrphanedCodeReport();

    logger.log(`\n✅ Process completed. Files were backed up to: ${backupDir}/${timestamp}`);
  } else {
    logger.log('\n⚠️ No files were backed up. Removal canceled.');
  }
}

// Run the script
main();

module.exports = {
  backupFiles,
  removeFiles,
  updateOrphanedCodeReport,
  main
};
