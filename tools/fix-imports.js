// tools/fix-imports.js
const fs = require('fs');
const path = require('path');

console.log('Starting import fix script...');

// Define problematic imports and their replacements
const importFixMap = {
  // Fix Logger casing
  'from [\'"](.+)\/Logger[\'"]': 'from '$1/logger'',
  'from [\'"](.+)\/Logger[\'"]\\s+\\*': 'from '$1/logger' *',
  // Fix ConversationManager casing
  'from [\'"](.+)\/ConversationManager[\'"]': 'from '$1/conversationManager'',
  'from [\'"](.+)\/ConversationManager[\'"]\\s+\\*': 'from '$1/conversationManager' *',
  // Fix CoreAgent casing
  'from [\'"](.+)\/CoreAgent[\'"]': 'from '$1/coreAgent'',
  'from [\'"](.+)\/CoreAgent[\'"]\\s+\\*': 'from '$1/coreAgent' *',
};

// Get all TypeScript files
function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory() && !filePath.includes('node_modules') && !filePath.includes('.git')) {
      fileList = getAllFiles(filePath, fileList);
    } else if ((file.endsWith('.ts') || file.endsWith('.js')) && !file.endsWith('.d.ts')) {
      fileList.push(filePath);
    }
  });
  return fileList;
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
      for (const [pattern, replacement] of Object.entries(importFixMap)) {
        const regex = new RegExp(pattern, 'g');
        if (regex.test(content)) {
          content = content.replace(regex, replacement);
          hasChanges = true;
        }
      }
      if (hasChanges) {
        fs.writeFileSync(file, content);
        fixedFiles.push(file);
        console.log(`Fixed imports in ${file}`);
      }
    } catch (err) {
      console.error(`Error fixing imports in ${file}:`, err);
    }
  });
  console.log(`\nImport fix complete. ${fixedFiles.length} files updated.`);
}

fixImportsInFiles();
