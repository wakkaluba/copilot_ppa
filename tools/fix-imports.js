const fs = require('fs');
const path = require('path');
const glob = require('glob');

console.log('Starting import fix script...');

// Define problematic imports and their replacements
const importFixMap = {
  // Fix Logger casing
  'from [\'"](.+)\\/Logger[\'"]': 'from \'$1/logger\'',
  'from [\'"](.+)\\/Logger[\'"]\\s+\\*': 'from \'$1/logger\' *',
  
  // Fix ConversationManager casing
  'from [\'"](.+)\\/ConversationManager[\'"]': 'from \'$1/conversationManager\'',
  'from [\'"](.+)\\/ConversationManager[\'"]\\s+\\*': 'from \'$1/conversationManager\' *',
  
  // Fix CoreAgent casing
  'from [\'"](.+)\\/CoreAgent[\'"]': 'from \'$1/coreAgent\'',
  'from [\'"](.+)\\/CoreAgent[\'"]\\s+\\*': 'from \'$1/coreAgent\' *',
};

// Get all TypeScript files
function getAllFiles(dir) {
  try {
    const files = glob.sync(path.join(dir, '**/*.{ts,tsx,js,jsx}'), {
      ignore: ['**/node_modules/**', '**/out/**', '**/dist/**', '**/build/**', '**/.git/**']
    });
    return files;
  } catch (error) {
    console.error('Error getting files:', error);
    return [];
  }
}

// Fix imports in all TypeScript files
function fixImportsInFiles() {
  const rootDir = path.resolve(__dirname, '..');
  const files = getAllFiles(rootDir);
  const fixedFiles = [];

  files.forEach(file => {
    try {
      let content = fs.readFileSync(file, 'utf8');
      let hasChanges = false;

      // Apply all regex replacements
      Object.entries(importFixMap).forEach(([pattern, replacement]) => {
        const regex = new RegExp(pattern, 'g');
        const newContent = content.replace(regex, replacement);
        
        if (newContent !== content) {
          content = newContent;
          hasChanges = true;
        }
      });

      // Save changes if needed
      if (hasChanges) {
        fs.writeFileSync(file, content, 'utf8');
        fixedFiles.push(file);
      }
    } catch (error) {
      console.error(`Error processing file ${file}: ${error.message}`);
    }
  });

  return fixedFiles;
}

// Run the script
try {
  const fixedFiles = fixImportsInFiles();
  console.log(`Fixed imports in ${fixedFiles.length} files`);
  
  if (fixedFiles.length > 0) {
    console.log('Modified files:');
    fixedFiles.forEach(file => {
      console.log(`- ${path.relative(path.resolve(__dirname, '..'), file)}`);
    });
  }
  
  console.log('Import fix script completed');
} catch (error) {
  console.error(`Error: ${error.message}`);
}
