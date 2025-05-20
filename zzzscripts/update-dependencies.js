// zzzscripts/update-dependencies.js
// Script to update dependencies and lock file maintenance for the project.
// Usage: node zzzscripts/update-dependencies.js

const { execSync } = require('child_process');

function updateDependencies() {
  try {
    console.log('Updating all dependencies to latest allowed by package.json...');
    execSync('npm update', { stdio: 'inherit' });
    console.log('Dependencies updated. Running npm install to refresh lock file...');
    execSync('npm install', { stdio: 'inherit' });
    console.log('Dependency update and lock file maintenance complete.');
  } catch (err) {
    console.error('Error updating dependencies:', err.message);
    process.exit(1);
  }
}

if (require.main === module) {
  updateDependencies();
}
