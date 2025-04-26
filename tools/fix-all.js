const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('Starting comprehensive fix script...');

// Install required dependencies if needed
function ensureDependencies() {
  console.log('Ensuring required dependencies are installed...');
  try {
    if (!fs.existsSync(path.join(__dirname, '..', 'node_modules', 'glob'))) {
      console.log('Installing glob package...');
      execSync('npm install glob --no-save', { stdio: 'inherit' });
    }
    console.log('Dependencies are ready.');
  } catch (error) {
    console.error(`Error installing dependencies: ${error.message}`);
    process.exit(1);
  }
}

try {
  // Step 0: Install dependencies
  ensureDependencies();
  
  // Step 1: Fix file casing
  console.log('\n==== STEP 1: Fixing file casing ====');
  execSync('node tools/fix-casing.js', { stdio: 'inherit' });
  
  // Step 2: Fix imports
  console.log('\n==== STEP 2: Fixing imports ====');
  execSync('node tools/fix-imports.js', { stdio: 'inherit' });
  
  // Step 3: Fix type errors
  console.log('\n==== STEP 3: Fixing type errors ====');
  execSync('node tools/fix-type-errors.js', { stdio: 'inherit' });
  
  console.log('\nAll fixes completed successfully!');
  console.log('Please restart VS Code and run "npm run compile" to check for any remaining issues.');
} catch (error) {
  console.error(`Fix process failed: ${error.message}`);
  process.exit(1);
}
