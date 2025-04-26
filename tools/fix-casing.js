// tools/fix-casing.js

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Files with casing issues
const files = [
  {
    from: 'src/services/ConversationManager.ts',
    to: 'src/services/conversationManager.ts'
  },
  // Add other files with casing issues here
];

files.forEach(({ from, to }) => {
  const fromPath = path.resolve(__dirname, '..', from);
  const toPath = path.resolve(__dirname, '..', to);
  
  if (fs.existsSync(fromPath) && fromPath.toLowerCase() === toPath.toLowerCase()) {
    console.log(`Fixing casing for ${from}`);
    
    // Use git mv to preserve history
    try {
      // First rename to a temporary name to avoid case-sensitivity issues on Windows
      const tempPath = `${fromPath}_temp`;
      execSync(`git mv "${fromPath}" "${tempPath}"`);
      execSync(`git mv "${tempPath}" "${toPath}"`);
      console.log(`Successfully renamed ${from} to ${to}`);
    } catch (error) {
      console.error(`Error renaming file: ${error.message}`);
    }
  }
});

console.log('Finished fixing file casing');