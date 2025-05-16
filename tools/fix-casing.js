// tools/fix-casing.js

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Starting file casing fix script...');

// Files with known casing issues to fix
const filesWithCasingIssues = [
  {
    from: 'src/utils/Logger.ts',
    to: 'src/utils/logger.ts'
  },
  {
    from: 'src/services/ConversationManager.ts',
    to: 'src/services/conversationManager.ts'
  },
  {
    from: 'src/services/CoreAgent.ts',
    to: 'src/services/coreAgent.ts'
  }
];

// Process files with casing issues
filesWithCasingIssues.forEach(({ from, to }) => {
  const fromPath = path.resolve(__dirname, '..', from);
  const toPath = path.resolve(__dirname, '..', to);

  // Skip if the paths don't match except for casing
  if (fromPath.toLowerCase() !== toPath.toLowerCase()) {
    console.log(`Skipping ${from} as it doesn't match ${to} except for casing`);
    return;
  }

  // Only proceed if the file exists
  if (fs.existsSync(fromPath)) {
    try {
      console.log(`Fixing casing for ${from} to ${to}`);
      // Create a temporary file with a different name
      const tempPath = `${fromPath}_temp`;
      try {
        // Use git to preserve history
        execSync(`git mv "${fromPath}" "${tempPath}"`);
        execSync(`git mv "${tempPath}" "${toPath}"`);
      } catch (gitError) {
        // Fallback to fs.renameSync if git fails
        fs.renameSync(fromPath, tempPath);
        fs.renameSync(tempPath, toPath);
      }
    } catch (error) {
      console.error(`Failed to fix casing for ${from}: ${error.message}`);
    }
  } else {
    console.log(`File not found: ${from}`);
  }
});

module.exports = function fixCasing() {
  // For test runner compatibility
  return true;
};
