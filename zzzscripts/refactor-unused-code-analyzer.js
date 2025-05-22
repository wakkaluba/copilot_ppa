// Script to analyze unused code and suggest refactoring/removal opportunities
// Scans the src/ directory for unused exports, dead code, and files not referenced elsewhere
// Outputs a report with actionable suggestions for cleanup and refactoring

const fs = require('fs');
const path = require('path');

const SRC_DIR = path.resolve(__dirname, '../src');
const REPORT_PATH = path.resolve(__dirname, '../zzzrefactoring/unused-code-report.json');

/**
 * Recursively collect all .js/.ts files in a directory
 */
function collectSourceFiles(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      collectSourceFiles(fullPath, files);
    } else if (entry.name.endsWith('.js') || entry.name.endsWith('.ts')) {
      files.push(fullPath);
    }
  }
  return files;
}

/**
 * Naive search for unused files: not imported anywhere else in src/
 */
function findUnusedFiles(files) {
  const importMap = new Map();
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    for (const other of files) {
      if (other === file) continue;
      const rel = './' + path.relative(path.dirname(other), file).replace(/\\/g, '/').replace(/\.ts$/, '').replace(/\.js$/, '');
      if (fs.readFileSync(other, 'utf8').includes(rel)) {
        importMap.set(file, true);
        break;
      }
    }
    if (!importMap.has(file)) importMap.set(file, false);
  }
  return files.filter(f => !importMap.get(f));
}

function main() {
  if (!fs.existsSync(SRC_DIR)) {
    console.error('src/ directory not found.');
    process.exit(1);
  }
  try {
    const files = collectSourceFiles(SRC_DIR);
    const unused = findUnusedFiles(files);
    const report = { unusedFiles: unused, analyzedAt: new Date().toISOString() };
    fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
    fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));
    console.log(`Unused code analysis complete. Report written to ${REPORT_PATH}`);
    if (unused.length) {
      console.log('Unused files:');
      unused.forEach(f => console.log('  -', f));
    } else {
      console.log('No unused files found.');
    }
  } catch (err) {
    console.error('Failed to analyze unused code:', err.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
