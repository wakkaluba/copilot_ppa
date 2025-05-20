// zzzscripts/identify-unused-code.js
// Script to identify unused code files in the project
// Scans the src/ directory for files not imported or referenced anywhere else
// Outputs a report of unused files for review

const fs = require('fs');
const path = require('path');

const SRC_DIR = path.join(__dirname, '../src');
const IGNORED_DIRS = ['__tests__', '__mocks__', 'coverage', 'test', 'tests'];
const EXTENSIONS = ['.js', '.ts', '.jsx', '.tsx'];

function walk(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (!IGNORED_DIRS.includes(file)) {
        walk(fullPath, fileList);
      }
    } else if (EXTENSIONS.includes(path.extname(file))) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

function findReferences(filePath, allFiles) {
  const fileName = path.basename(filePath);
  for (const otherFile of allFiles) {
    if (otherFile === filePath) continue;
    const content = fs.readFileSync(otherFile, 'utf8');
    if (content.includes(fileName.replace(/\.[jt]sx?$/, ''))) {
      return true;
    }
  }
  return false;
}

function main() {
  const allFiles = walk(SRC_DIR);
  const unused = [];
  for (const file of allFiles) {
    if (!findReferences(file, allFiles)) {
      unused.push(file);
    }
  }
  if (unused.length === 0) {
    console.log('No unused code files found.');
  } else {
    console.log('Unused code files:');
    unused.forEach(f => console.log(f));
  }
}

if (require.main === module) {
  main();
}
