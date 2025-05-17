/* eslint-disable no-console */
// Reorganization script for Copilot PPA project
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Define new structure
const newStructure = {
  'src': 'Main source code',
  'test': 'All test files',
  'media': 'UI assets and web views',
  'docs': 'Documentation (moved from zzzdocs)',
  'scripts': 'Utility scripts (moved from zzzscripts)',
  'refactoring': 'Refactoring plans and progress (moved from zzzrefactoring)',
  'build': 'Build artifacts and configuration (moved from zzzbuild)',
  'locales': 'Localization files'
};

// Create new directories if they don't exist
Object.keys(newStructure).forEach(dir => {
  const dirPath = path.join(__dirname, dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    // logger.log(`Created directory: ${dir}`);
  }
});

// Log the plan for moving files
// logger.log('Reorganization plan:');
// logger.log('--------------------');
Object.entries(newStructure).forEach(([dir, description]) => {
  // logger.log(`${dir}: ${description}`);
});

console.log('\nProposed moves:');
console.log('--------------');
console.log('1. Move all test files to ./test directory');
console.log('2. Move documentation from zzzdocs to ./docs');
console.log('3. Move utility scripts from zzzscripts to ./scripts');
console.log('4. Move refactoring plans from zzzrefactoring to ./refactoring');
console.log('5. Move build artifacts from zzzbuild to ./build');
console.log('6. Consolidate similar source files in src directory structure');

console.log('\nTo complete the reorganization, review this plan and run:');
console.log('node reorganize.js --execute');

// If executed with --execute flag, perform the moves
if (process.argv.includes('--execute')) {
  console.log('\nExecuting reorganization...');

  // Sample move commands (you should customize these based on your specific needs)
  try {
    // Move docs
    if (fs.existsSync(path.join(__dirname, 'zzzdocs'))) {
      execSync('xcopy /E /I /Y .\\zzzdocs\\* .\\docs\\', { stdio: 'inherit' });
      // logger.log('Moved documentation files from zzzdocs to docs');
    }

    // Move scripts
    if (fs.existsSync(path.join(__dirname, 'zzzscripts'))) {
      execSync('xcopy /E /I /Y .\\zzzscripts\\* .\\scripts\\', { stdio: 'inherit' });
      // logger.log('Moved script files from zzzscripts to scripts');
    }

    // Move refactoring
    if (fs.existsSync(path.join(__dirname, 'zzzrefactoring'))) {
      execSync('xcopy /E /I /Y .\\zzzrefactoring\\* .\\refactoring\\', { stdio: 'inherit' });
      // logger.log('Moved refactoring files from zzzrefactoring to refactoring');
    }

    // Move build
    if (fs.existsSync(path.join(__dirname, 'zzzbuild'))) {
      execSync('xcopy /E /I /Y .\\zzzbuild\\* .\\build\\', { stdio: 'inherit' });
      // logger.log('Moved build files from zzzbuild to build');
    }

    // Note: We're not deleting the original directories yet to ensure data safety
    console.log('\nReorganization completed. Please verify the new structure before deleting the original zzz* directories.');
  } catch (error) {
    // logger.error('Error during reorganization:', error);
  }
}
