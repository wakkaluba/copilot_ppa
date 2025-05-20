// remove-unused-code-analyzer.js
// This script backs up and removes unused code files as identified in the unused code report.
// Usage: node zzzscripts/remove-unused-code-analyzer.js

const fs = require('fs');
const path = require('path');

const UNUSED_CODE_REPORT = path.resolve(__dirname, '../zzzrefactoring/unused-code-report.json');
const BACKUP_DIR = path.resolve(__dirname, '../zzzrefactoring/unused-code-backup');
const SRC_DIR = path.resolve(__dirname, '../src');
const SUMMARY_REPORT = path.resolve(__dirname, '../zzzrefactoring/unused-code-removal-summary.json');

function ensureDirSync(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function backupAndRemoveFile(filePath) {
  const relPath = path.relative(SRC_DIR, filePath);
  const backupPath = path.join(BACKUP_DIR, relPath);
  ensureDirSync(path.dirname(backupPath));
  fs.copyFileSync(filePath, backupPath);
  fs.unlinkSync(filePath);
  return { removed: filePath, backup: backupPath };
}

function main() {
  if (!fs.existsSync(UNUSED_CODE_REPORT)) {
    console.error('Unused code report not found:', UNUSED_CODE_REPORT);
    process.exit(1);
  }
  const unusedFiles = JSON.parse(fs.readFileSync(UNUSED_CODE_REPORT, 'utf-8'));
  if (!Array.isArray(unusedFiles)) {
    console.error('Unused code report must be an array of file paths.');
    process.exit(1);
  }
  ensureDirSync(BACKUP_DIR);
  const summary = [];
  for (const relFile of unusedFiles) {
    const absFile = path.resolve(SRC_DIR, relFile);
    if (fs.existsSync(absFile)) {
      try {
        const result = backupAndRemoveFile(absFile);
        summary.push(result);
        console.log('Removed and backed up:', relFile);
      } catch (e) {
        console.error('Failed to remove:', relFile, e);
      }
    } else {
      console.warn('File not found, skipping:', relFile);
    }
  }
  fs.writeFileSync(SUMMARY_REPORT, JSON.stringify(summary, null, 2), 'utf-8');
  console.log('Summary written to', SUMMARY_REPORT);
}

if (require.main === module) {
  main();
}
