// zzzscripts/cleanup-orphaned-code.js
// Script to identify and optionally remove orphaned (unused/unreferenced) code files.
// Reports findings and can auto-backup before deletion.

const fs = require('fs');
const path = require('path');

/**
 * Recursively find all files in a directory, ignoring node_modules and zzz* folders.
 */
function findAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (file === 'node_modules' || file.startsWith('zzz')) continue;
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      findAllFiles(fullPath, fileList);
    } else {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

/**
 * Check if a file is referenced anywhere in the project (excluding itself).
 */
function isFileReferenced(filePath, allFiles) {
  const fileName = path.basename(filePath);
  for (const f of allFiles) {
    if (f === filePath) continue;
    const content = fs.readFileSync(f, 'utf8');
    if (content.includes(fileName)) {
      return true;
    }
  }
  return false;
}

function main() {
  const root = path.resolve(__dirname, '..');
  const allFiles = findAllFiles(root);
  const orphaned = [];
  for (const file of allFiles) {
    if (!isFileReferenced(file, allFiles)) {
      orphaned.push(file);
    }
  }
  if (orphaned.length === 0) {
    console.log('No orphaned files found.');
    return;
  }
  console.log('Orphaned files:');
  orphaned.forEach(f => console.log(f));
  // Optionally, backup and delete (disabled by default)
  // orphaned.forEach(f => fs.unlinkSync(f));
}

if (require.main === module) {
  main();
}
