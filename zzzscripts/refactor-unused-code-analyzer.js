const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const rootDir = path.resolve(__dirname, '..');
const backupDir = path.join(rootDir, 'zzzbuild', 'backups', 'unused-code-analyzer');

// Files potentially related to UnusedCodeAnalyzer
const targetFiles = [
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
 * Create backup of a file before modification
 */
function backupFile(filePath) {
  try {
    const fullPath = path.join(rootDir, filePath);
    if (!fs.existsSync(fullPath)) return false;

    // Create backup directory if it doesn't exist
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const backupPath = path.join(backupDir, filePath);

    // Create directories for backup
    const backupDirPath = path.dirname(backupPath);
    if (!fs.existsSync(backupDirPath)) {
      fs.mkdirSync(backupDirPath, { recursive: true });
    }

    // Copy file to backup
    fs.copyFileSync(fullPath, backupPath);
    console.log(`Created backup of ${filePath}`);
    return true;
  } catch (error) {
    console.error(`Error creating backup for ${filePath}: ${error.message}`);
    return false;
  }
}

/**
 * Check if file is referenced by other files
 */
function checkReferences(filePath) {
  try {
    const fileName = path.basename(filePath);
    const result = execSync(`grep -r -l "${fileName}" --include="*.{js,ts,jsx,tsx}" ${rootDir} | grep -v "${filePath}" | grep -v "zzzscripts"`, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe']
    });

    return result.trim().split('\n').filter(Boolean);
  } catch (error) {
    return [];
  }
}

/**
 * Analyze imports to file
 */
function analyzeImports(filePath) {
  try {
    const fullPath = path.join(rootDir, filePath);
    if (!fs.existsSync(fullPath)) return [];

    const content = fs.readFileSync(fullPath, 'utf8');
    const importMatches = content.match(/import\s+.*from\s+['"].*['"]/g) || [];
    const requireMatches = content.match(/require\(['"].*['"]\)/g) || [];

    return [
      ...importMatches.map(m => m.replace(/.*from\s+['"](.*)['"].*/, '$1')),
      ...requireMatches.map(m => m.replace(/require\(['"](.*)['"].*/, '$1'))
    ];
  } catch (error) {
    console.error(`Error analyzing imports in ${filePath}: ${error.message}`);
    return [];
  }
}

/**
 * Main function
 */
async function main() {
  console.log('Starting UnusedCodeAnalyzer refactoring analysis...');

  // Check each file
  for (const file of targetFiles) {
    console.log(`\nAnalyzing ${file}...`);

    const fullPath = path.join(rootDir, file);
    if (!fs.existsSync(fullPath)) {
      console.log(`  File does not exist: ${file}`);
      continue;
    }

    // Check references to this file
    const references = checkReferences(file);
    console.log(`  Referenced by ${references.length} files`);

    if (references.length > 0) {
      console.log('  This file is still being referenced by:');
      references.forEach(ref => console.log(`    - ${ref}`));
      console.log('  Consider updating these files before removing this code.');
    } else {
      console.log('  This file appears to be unused and can be safely removed.');
    }

    // Analyze imports
    const imports = analyzeImports(file);
    if (imports.length > 0) {
      console.log('  This file imports:');
      imports.forEach(imp => console.log(`    - ${imp}`));
    }
  }

  console.log('\nAnalysis completed.');
  console.log('Based on the analysis, you may need to:');
  console.log('1. Update references to UnusedCodeAnalyzer in dependent files');
  console.log('2. Consider consolidating functionality if needed');
  console.log('3. Create backups before removing any code');
  console.log('4. Remove unused files after dependencies are resolved');
}

main();
