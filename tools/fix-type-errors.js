const fs = require('fs');
const path = require('path');
const glob = require('glob');

console.log('Starting type error fix script...');

const rootDir = path.resolve(__dirname, '..');

// Files with specific fixes needed
const specificFixes = [
  {
    path: 'tests/unit/utils/advancedLogger.test.ts',
    replacements: [
      {
        // Fix timestamp to use Date instead of number
        pattern: /timestamp: Date\.now\(\)/g,
        replacement: 'timestamp: new Date()'
      }
    ]
  },
  {
    path: 'tests/helpers/mockHelpers.ts',
    replacements: [
      {
        // Fix comma errors
        pattern: /(\w+): ([\w.]+)(\s*\/\/[^\n]*)?(?=\n\s*\w+:)/g,
        replacement: '$1: $2,$3'
      },
      {
        // Add missing options property to EnvironmentVariableMutator
        pattern: /\{ value: (.*), type: (.*) \}/g,
        replacement: '{ value: $1, type: $2, options: {} }'
      }
    ]
  },
  {
    path: 'tests/unit/workspace.test.ts',
    replacements: [
      {
        // Fix import casing
        pattern: /from '\.\.\/\.\.\/src\/utils\/Logger/g,
        replacement: "from '../../src/utils/logger"
      }
    ]
  }
];

// Process specific files with targeted fixes
async function applySpecificFixes() {
  let fixedCount = 0;
  
  for (const { path: filePath, replacements } of specificFixes) {
    const fullPath = path.resolve(rootDir, filePath);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`File ${filePath} not found, skipping...`);
      continue;
    }
    
    try {
      console.log(`Applying fixes to ${filePath}...`);
      let content = fs.readFileSync(fullPath, 'utf8');
      let hasChanges = false;
      
      for (const { pattern, replacement } of replacements) {
        const newContent = content.replace(pattern, replacement);
        if (newContent !== content) {
          content = newContent;
          hasChanges = true;
        }
      }
      
      if (hasChanges) {
        fs.writeFileSync(fullPath, content);
        fixedCount++;
        console.log(`Fixed ${filePath}`);
      } else {
        console.log(`No changes needed for ${filePath}`);
      }
    } catch (error) {
      console.error(`Error processing ${filePath}: ${error.message}`);
    }
  }
  
  return fixedCount;
}

// Fix common type issues across all TypeScript files
async function fixCommonTypeIssues() {
  const typescriptFiles = glob.sync('**/*.{ts,tsx}', {
    cwd: rootDir,
    ignore: ['**/node_modules/**', '**/dist/**', '**/out/**']
  });
  
  let fixedCount = 0;
  
  for (const file of typescriptFiles) {
    const fullPath = path.resolve(rootDir, file);
    try {
      let content = fs.readFileSync(fullPath, 'utf8');
      let hasChanges = false;
      
      // Common fixes applied to all files
      const commonFixes = [
        {
          // Fix timestamp type to use Date instead of number
          pattern: /timestamp: (Date\.now\(\)|new Date\(\)\.getTime\(\))/g, 
          replacement: 'timestamp: new Date()'
        },
        {
          // Fix optional parameter notation
          pattern: /(\w+): ([^,\s]+) \| undefined/g,
          replacement: '$1?: $2'
        }
      ];
      
      for (const { pattern, replacement } of commonFixes) {
        const newContent = content.replace(pattern, replacement);
        if (newContent !== content) {
          content = newContent;
          hasChanges = true;
        }
      }
      
      if (hasChanges) {
        fs.writeFileSync(fullPath, content);
        fixedCount++;
        console.log(`Applied common fixes to ${file}`);
      }
    } catch (error) {
      console.error(`Error processing ${file}: ${error.message}`);
    }
  }
  
  return fixedCount;
}

// Run the fixes
async function runFixes() {
  try {
    const specificFixCount = await applySpecificFixes();
    const commonFixCount = await fixCommonTypeIssues();
    
    console.log(`\nSummary:`);
    console.log(`- Applied specific fixes to ${specificFixCount} files`);
    console.log(`- Applied common fixes to ${commonFixCount} files`);
    console.log('\nType error fix script completed');
  } catch (error) {
    console.error(`Script error: ${error.message}`);
  }
}

runFixes();
