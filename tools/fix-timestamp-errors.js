const fs = require('fs');
const path = require('path');

console.log('Starting timestamp type error fix script...');

// Files with timestamp type errors to fix
const filesToFix = [
  {
    path: 'src/services/conversationManager.ts',
    replacements: [
      {
        // Fix Date timestamp to use number type
        pattern: /timestamp: new Date\(\)/g,
        replacement: 'timestamp: Date.now()'
      }
    ]
  },
  {
    path: 'tests/unit/services/conversation/ContextManager.test.ts',
    replacements: [
      {
        // Fix timestamp in tests
        pattern: /timestamp: new Date\(\)/g,
        replacement: 'timestamp: Date.now()'
      }
    ]
  },
  {
    path: 'tests/unit/services/conversation/ConversationMemory.test.ts',
    replacements: [
      {
        // Fix timestamp in tests
        pattern: /timestamp: new Date\(\)/g,
        replacement: 'timestamp: Date.now()'
      },
      {
        // Fix timestamp with addition operations
        pattern: /timestamp: new Date\(\) \+ (.*)/g,
        replacement: 'timestamp: Date.now() + $1'
      }
    ]
  },
  {
    path: 'src/test/unit/complex-component-interactions.test.ts',
    replacements: [
      {
        // Fix timestamp in tests
        pattern: /timestamp: new Date\(\)/g,
        replacement: 'timestamp: Date.now()'
      }
    ]
  },
  {
    path: 'src/test/unit/component-performance.test.ts',
    replacements: [
      {
        // Fix timestamp in tests
        pattern: /timestamp: new Date\(\)/g,
        replacement: 'timestamp: Date.now()'
      },
      {
        // Fix timestamp with subtraction
        pattern: /timestamp: new Date\(\) - /g,
        replacement: 'timestamp: Date.now() - '
      }
    ]
  },
  {
    path: 'src/test/unit/LLMCacheService.test.ts',
    replacements: [
      {
        // Fix timestamp with subtraction
        pattern: /timestamp: new Date\(\) - /g,
        replacement: 'timestamp: Date.now() - '
      }
    ]
  },
  {
    path: 'src/services/cache/llmCacheService.ts',
    replacements: [
      {
        // Fix timestamp in cache service
        pattern: /timestamp: new Date\(\),/g,
        replacement: 'timestamp: Date.now(),'
      }
    ]
  }
];

// Process files with timestamp errors
filesToFix.forEach(({ path: filePath, replacements }) => {
  const fullPath = path.resolve(__dirname, '..', filePath);
  
  if (fs.existsSync(fullPath)) {
    try {
      console.log(`Fixing timestamp errors in ${filePath}`);
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
      console.error(`Failed to fix timestamp errors in ${filePath}: ${error.message}`);
    }
  } else {
    console.log(`File ${filePath} does not exist`);
  }
});

console.log('Timestamp error fix script completed');
