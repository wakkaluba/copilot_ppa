/**
 * Script to handle the duplicate file-casing fixers
 * Backs up both files, compares them, and removes the duplicate
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const logger = require('./logger');

// Configuration
const rootDir = path.resolve(__dirname, '..');
const backupDir = path.join(rootDir, 'zzzbuild', 'backups', 'orphaned-code', 'duplicate-fixers');
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

// Files to analyze
const primaryFile = path.join(rootDir, 'tools', 'fix-file-casing.js');
const duplicateFile = path.join(rootDir, 'tools', 'fix-casing.js');
const reportPath = path.join(rootDir, 'zzzbuild', 'orphaned-code-report.md');

/**
 * Create backup of files before making changes
 */
function backupFiles() {
  logger.log('Creating backups...');

  // Create backup directory with timestamp
  const timestampedBackupDir = path.join(backupDir, timestamp);
  if (!fs.existsSync(timestampedBackupDir)) {
    fs.mkdirSync(timestampedBackupDir, { recursive: true });
  }

  // Backup primary file
  if (fs.existsSync(primaryFile)) {
    const primaryBackupPath = path.join(timestampedBackupDir, 'fix-file-casing.js');
    fs.copyFileSync(primaryFile, primaryBackupPath);
    logger.log(`✅ Backed up: ${path.relative(rootDir, primaryFile)}`);
  } else {
    logger.log(`⚠️ Primary file not found: ${path.relative(rootDir, primaryFile)}`);
  }

  // Backup duplicate file
  if (fs.existsSync(duplicateFile)) {
    const duplicateBackupPath = path.join(timestampedBackupDir, 'fix-casing.js');
    fs.copyFileSync(duplicateFile, duplicateBackupPath);
    logger.log(`✅ Backed up: ${path.relative(rootDir, duplicateFile)}`);
  } else {
    logger.log(`⚠️ Duplicate file not found: ${path.relative(rootDir, duplicateFile)}`);
  }

  return timestampedBackupDir;
}

/**
 * Compare the content of both files to verify they're duplicates
 */
function compareFiles() {
  if (!fs.existsSync(primaryFile) || !fs.existsSync(duplicateFile)) {
    logger.log('Cannot compare files - one or both files missing');
    return false;
  }

  logger.log('Comparing files...');
  const primaryContent = fs.readFileSync(primaryFile, 'utf8');
  const duplicateContent = fs.readFileSync(duplicateFile, 'utf8');

  // Simple comparison to check if files are identical
  const exactMatch = primaryContent === duplicateContent;

  // More flexible comparison (ignores whitespace differences)
  const normalizedPrimary = primaryContent.replace(/\s+/g, ' ').trim();
  const normalizedDuplicate = duplicateContent.replace(/\s+/g, ' ').trim();
  const similarMatch = normalizedPrimary === normalizedDuplicate;

  // Function count comparison
  const primaryFunctions = (primaryContent.match(/function\s+[a-zA-Z0-9_]+\(/g) || []).length;
  const duplicateFunctions = (duplicateContent.match(/function\s+[a-zA-Z0-9_]+\(/g) || []).length;

  logger.log(`Exact content match: ${exactMatch}`);
  logger.log(`Normalized content match: ${similarMatch}`);
  logger.log(`Primary file has ${primaryFunctions} functions`);
  logger.log(`Duplicate file has ${duplicateFunctions} functions`);

  // Generate a comparison report for reference
  return {
    exactMatch,
    similarMatch,
    primaryFunctions,
    duplicateFunctions,
    additionalFunctionsInDuplicate: duplicateFunctions > primaryFunctions,
    analysis: exactMatch ? 'Files are identical' :
              similarMatch ? 'Files have same content with whitespace differences' :
              'Files have different content'
  };
}

/**
 * Remove the duplicate file
 */
function removeDuplicateFile() {
  if (!fs.existsSync(duplicateFile)) {
    logger.log('Duplicate file does not exist, nothing to remove');
    return false;
  }

  logger.log('Removing duplicate file...');

  try {
    // Check if file is tracked by git
    let isTracked = false;
    try {
      execSync(`git ls-files --error-unmatch "${duplicateFile}"`, {
        stdio: ['pipe', 'pipe', 'ignore']
      });
      isTracked = true;
    } catch (gitError) {
      isTracked = false;
    }

    if (isTracked) {
      // Remove via git for tracked files
      logger.log('File is git-tracked, removing via git rm');
      execSync(`git rm "${duplicateFile}"`, { stdio: 'inherit' });
    } else {
      // Direct filesystem removal for untracked files
      fs.unlinkSync(duplicateFile);
      logger.log(`Removed file: ${path.relative(rootDir, duplicateFile)}`);
    }

    return true;
  } catch (error) {
    logger.error(`❌ Error removing duplicate file: ${error.message}`);
    return false;
  }
}

/**
 * Update the orphaned code report to mark task as done
 */
function updateOrphanedCodeReport(comparison) {
  if (!fs.existsSync(reportPath)) {
    logger.error('❌ Could not find orphaned-code-report.md to update');
    return;
  }

  try {
    let reportContent = fs.readFileSync(reportPath, 'utf8');

    // Update the status of Duplicate File-Casing Fixers
    reportContent = reportContent.replace(
      /### 1\. Duplicate File-Casing Fixers[\s\S]*?Status\*\*: Obsolete \(duplicate\)/,
      '### 1. Duplicate File-Casing Fixers\n- **Files**:\n  - `d:\\___coding\\tools\\copilot_ppa\\tools\\fix-file-casing.js` (Kept)\n  - `d:\\___coding\\tools\\copilot_ppa\\tools\\fix-casing.js` (Removed)\n- **Analysis**: Files were ' +
      (comparison.exactMatch ? 'exact duplicates' : comparison.similarMatch ? 'functionally identical with minor differences' : 'similar but with some differences') +
      '. Backup created before removal.\n- **Action Taken**: Removed `fix-casing.js` on ' + new Date().toISOString().split('T')[0] + '. Kept `fix-file-casing.js` as it has a more descriptive name.\n- **Status**: ✅ Resolved'
    );

    // Update the Analysis Summary status breakdown
    reportContent = reportContent.replace(
      /\*\*Status Breakdown\*\*:[\s\S]*?- Obsolete \(duplicate\): 1/,
      '**Status Breakdown**:\n- ✅ Resolved: 4\n- Partially integrated: 1'
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
  logger.log('=== Duplicate File-Casing Fixer Cleanup Tool ===');

  // Step 1: Back up files
  const backupFolder = backupFiles();
  logger.log(`Backups created in: ${backupFolder}`);

  // Step 2: Compare files to confirm duplication
  const comparison = compareFiles();

  // Step 3: Ask for confirmation (automatic in this script)
  let proceedWithRemoval = true;

  if (!comparison.exactMatch && !comparison.similarMatch) {
    logger.log('\n⚠️ Warning: Files are not detected as duplicates!');
    logger.log('Please review the files manually before proceeding.');
    proceedWithRemoval = false;
  } else if (comparison.additionalFunctionsInDuplicate) {
    logger.log('\n⚠️ Warning: The file to be removed may contain additional functions!');
    logger.log('Please review the files manually before proceeding.');
    proceedWithRemoval = false;
  }

  // Step 4: Remove duplicate file if appropriate
  let removalSuccessful = false;
  if (proceedWithRemoval) {
    removalSuccessful = removeDuplicateFile();
  } else {
    logger.log('Skipping removal based on comparison results.');
    logger.log('Files have been backed up if you wish to proceed manually.');
  }

  // Step 5: Update the orphaned code report
  if (proceedWithRemoval && removalSuccessful) {
    updateOrphanedCodeReport(comparison);
  }

  logger.log('\n=== Process completed ===');
}

// Run the script
main();

module.exports = {
  backupFiles,
  compareFiles,
  removeDuplicateFile,
  updateOrphanedCodeReport,
  main
};
