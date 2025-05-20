// zzzscripts/remove-duplicate-casing-fixer.js
// Script to find and fix duplicate file or directory names that differ only by casing (e.g., Foo.ts vs foo.ts)
// This helps prevent cross-platform issues and enforces consistent naming.

const fs = require('fs');
const path = require('path');

/**
 * Recursively scan a directory and collect all files and folders, grouped by lowercased name.
 * @param {string} dir - Directory to scan
 * @param {Object} map - Accumulator for name groups
 */
function scanDir(dir, map = {}) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const lcName = entry.name.toLowerCase();
    const fullPath = path.join(dir, entry.name);
    if (!map[lcName]) map[lcName] = [];
    map[lcName].push(fullPath);
    if (entry.isDirectory()) {
      scanDir(fullPath, map);
    }
  }
  return map;
}

/**
 * Find and report duplicate casing issues in the workspace.
 */
function findDuplicates(rootDir) {
  const map = scanDir(rootDir);
  const duplicates = Object.entries(map).filter(([_, paths]) => paths.length > 1);
  if (duplicates.length === 0) {
    console.log('No duplicate casing issues found.');
    return;
  }
  console.log('Duplicate casing issues found:');
  for (const [lcName, paths] of duplicates) {
    console.log(`- ${lcName}:`);
    for (const p of paths) {
      console.log(`    ${p}`);
    }
  }
  // Optionally, add auto-fix logic here (e.g., rename files to a canonical casing)
}

if (require.main === module) {
  const root = process.argv[2] || path.resolve(__dirname, '../src');
  findDuplicates(root);
}

module.exports = { findDuplicates };
