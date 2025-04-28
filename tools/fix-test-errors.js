const fs = require('fs');
const path = require('path');

console.log('Starting test errors fix script...');

// Fix common test framework issues
const testFrameworkFiles = [
  {
    path: 'src/test/unit/ContextManager.test.ts',
    replacements: [
      {
        pattern: /xsuite/g,
        replacement: 'describe'
      },
      {
        pattern: /suite/g,
        replacement: 'describe'  
      },
      {
        pattern: /test\(/g,
        replacement: 'it('
      }
    ]
  },
  {
    path: 'src/test/unit/WorkspaceManager.test.ts',
    replacements: [
      {
        pattern: /suite/g,
        replacement: 'describe'  
      },
      {
        pattern: /test\(/g,
        replacement: 'it('
      }
    ]
  },
  {
    path: 'src/test/unit/PromptManager.test.ts',
    replacements: [
      {
        pattern: /suite/g,
        replacement: 'describe'  
      },
      {
        pattern: /test\(/g,
        replacement: 'it('
      }
    ]
  },
  {
    path: 'src/test/unit/LLMService.test.ts',
    replacements: [
      {
        pattern: /suite/g,
        replacement: 'describe'  
      },
      {
        pattern: /test\(/g,
        replacement: 'it('
      }
    ]
  },
  {
    path: 'src/test/unit/LLMCacheService.test.ts',
    replacements: [
      {
        pattern: /suite/g,
        replacement: 'describe'  
      },
      {
        pattern: /test\(/g,
        replacement: 'it('
      }
    ]
  }
];

// Process files with test framework issues
testFrameworkFiles.forEach(({ path: filePath, replacements }) => {
  const fullPath = path.resolve(__dirname, '..', filePath);
  
  if (fs.existsSync(fullPath)) {
    try {
      console.log(`Fixing test framework issues in ${filePath}`);
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
      console.error(`Failed to fix test framework issues in ${filePath}: ${error.message}`);
    }
  } else {
    console.log(`File ${filePath} does not exist`);
  }
});

console.log('Test errors fix script completed');
