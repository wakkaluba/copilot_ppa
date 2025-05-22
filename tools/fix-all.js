// tools/fix-all.js
const { execSync } = require('child_process');
const path = require('path');

function runFixAll() {
  console.log('Starting comprehensive fix script...');
  try {
    // Step 1: Fix file casing
    console.log('\n==== STEP 1: Fixing file casing ====');
    execSync('node tools/fix-casing.js', { stdio: 'inherit' });
    // Step 2: Fix imports
    console.log('\n==== STEP 2: Fixing imports ====');
    execSync('node tools/fix-imports.js', { stdio: 'inherit' });
    // Step 3: Fix timestamp errors
    console.log('\n==== STEP 3: Fixing timestamp errors ====');
    execSync('node tools/fix-timestamp-errors.js', { stdio: 'inherit' });
    // Step 4: Fix URI errors
    console.log('\n==== STEP 4: Fixing URI errors ====');
    execSync('node tools/fix-uri-errors.js', { stdio: 'inherit' });
    // Step 5: Fix type errors
    console.log('\n==== STEP 5: Fixing other type errors ====');
    execSync('node tools/fix-type-errors.js', { stdio: 'inherit' });
    console.log('\nAll fixes completed successfully!');
    // eslint-disable-next-line no-console
    console.log(
      'Please restart VS Code and run "npm run compile" to check for any remaining issues.',
    );
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error running fix-all:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

if (require.main === module) {
  runFixAll();
}

module.exports = runFixAll;
