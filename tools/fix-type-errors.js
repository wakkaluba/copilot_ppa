const fs = require('fs');
const path = require('path');

console.log('Starting type error fix script...');

// Files with common type errors to fix
const filesToFix = [
  {
    path: 'tests/unit/utils/advancedLogger.test.ts',
    replacements: [
      {
        // Fix the timestamp type to use Date instead of number
        pattern: /timestamp: Date\.now\(\)/g,
        replacement: 'timestamp: new Date()'
      }
    ]
  },
  {
    path: 'src/utils/logger.ts',
    replacements: [
      {
        // Fix the context parameter
        pattern: /context: Record<string, unknown> \| undefined/g,
        replacement: 'context?: Record<string, unknown>'
      }
    ]
  }
];

// Process files with type errors
filesToFix.forEach(({ path: filePath, replacements }) => {
  const fullPath = path.resolve(__dirname, '..', filePath);
  
  if (fs.existsSync(fullPath)) {
    try {
      console.log(`Fixing type errors in ${filePath}`);
      let content = fs.readFileSync(fullPath, 'utf8');
      let hasChanges = false;
      
      replacements.forEach(({ pattern, replacement }) => {
        const newContent = content.replace(pattern, replacement);
        if (newContent !== content) {
          content = newContent;
          hasChanges = true;
        }
      });
      
      if (hasChanges) {
        fs.writeFileSync(fullPath, content);
        console.log(`Successfully updated ${filePath}`);
      } else {
        console.log(`No changes needed for ${filePath}`);
      }
    } catch (error) {
      console.error(`Failed to fix type errors in ${filePath}: ${error.message}`);
    }
  } else {
    console.log(`File ${filePath} does not exist`);
  }
});

console.log('Type error fix script completed');
