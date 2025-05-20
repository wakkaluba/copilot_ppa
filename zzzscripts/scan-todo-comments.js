#!/usr/bin/env node
/**
 * Script: scan-todo-comments.js
 * Description: Scans the workspace for TODO comments and incomplete implementations (e.g., FIXME, INCOMPLETE, NOT_IMPLEMENTED, throw new Error('Not implemented'), etc.)
 * Outputs a Markdown report to zzzbuild/coverage-reports/todo-scan-report.md
 *
 * Usage: node zzzscripts/scan-todo-comments.js
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const OUTPUT_FILE = path.join(ROOT_DIR, 'zzzbuild', 'coverage-reports', 'todo-scan-report.md');
const EXCLUDE_DIRS = ['node_modules', 'coverage', 'zzzbuild/coverage-reports', '.git', 'zzzbuild/backups'];
const TODO_PATTERNS = [
  /\/\/\s*TODO[:\s]/i,
  /\/\/\s*FIXME[:\s]/i,
  /\/\/\s*INCOMPLETE[:\s]/i,
  /\/\/\s*NOT_IMPLEMENTED[:\s]/i,
  /throw\s+new\s+Error\(['"]Not implemented['"]\)/i,
  /@todo/i
];

function shouldExclude(filePath) {
  return EXCLUDE_DIRS.some(dir => filePath.includes(dir));
}

function scanFile(filePath) {
  const results = [];
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split(/\r?\n/);
  lines.forEach((line, idx) => {
    for (const pattern of TODO_PATTERNS) {
      if (pattern.test(line)) {
        results.push({
          file: filePath,
          line: idx + 1,
          text: line.trim()
        });
        break;
      }
    }
  });
  return results;
}

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const filePath = path.join(dir, file);
    if (shouldExclude(filePath)) continue;
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(filePath));
    } else if (filePath.match(/\.(js|ts|jsx|tsx|json|md)$/i)) {
      results = results.concat(scanFile(filePath));
    }
  }
  return results;
}

function generateReport(matches) {
  let md = `# TODO & Incomplete Implementation Scan Report\n\n`;
  if (matches.length === 0) {
    md += '✅ No TODOs or incomplete implementations found.\n';
    return md;
  }
  md += `Found ${matches.length} items:\n\n`;
  for (const match of matches) {
    md += `- [36m${match.file}[0m:L${match.line}: [33m${match.text}[0m\n`;
  }
  return md;
}

function main() {
  const matches = walk(ROOT_DIR);
  const report = generateReport(matches);
  fs.writeFileSync(OUTPUT_FILE, report, 'utf8');
  console.log(`Scan complete. Report written to ${OUTPUT_FILE}`);
}

if (require.main === module) {
  main();
}
