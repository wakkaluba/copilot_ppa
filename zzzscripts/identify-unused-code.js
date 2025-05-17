const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const glob = require('glob');
const logger = require('./logger');

// Configuration
const rootDir = path.resolve(__dirname, '..');
const reportPath = path.join(rootDir, 'zzzbuild', 'orphaned-code-report.md');

/**
 * Find all JavaScript and TypeScript files in the project
 */
function findCodeFiles() {
  return glob.sync('**/*.{js,ts,jsx,tsx}', {
    cwd: rootDir,
    ignore: ['**/node_modules/**', '**/dist/**', '**/out/**', '**/zzzbuild/**', '**/zzzscripts/**', '**/.git/**']
  });
}

/**
 * Check if a file is imported/required anywhere else in the codebase
 */
function isFileReferenced(filePath) {
  const fileName = path.basename(filePath, path.extname(filePath));

  // Skip common files that might not be explicitly imported
  if (['index', 'extension', 'main', 'types'].includes(fileName.toLowerCase())) {
    return true;
  }

  try {
    // Search for imports/requires of this file
    const fileNamePattern = fileName.replace(/([A-Z])/g, '[$1a-z]*');
    const grepPattern = `(import|require).*(${fileNamePattern}|${fileName})`;

    const result = execSync(`grep -r -l -E "${grepPattern}" --include="*.{js,ts,jsx,tsx}" ${rootDir} | grep -v "${filePath}"`, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe']
    });

    return result.trim().length > 0;
  } catch (error) {
    // grep returns non-zero exit code when no matches found
    return false;
  }
}

/**
 * Analyze a file for orphaned classes and methods
 */
function analyzeFileContent(filePath) {
  try {
    const content = fs.readFileSync(path.join(rootDir, filePath), 'utf8');
    const orphaned = {
      classes: [],
      methods: []
    };

    // Simple regex to identify exported classes
    const classMatch = content.match(/export\s+class\s+(\w+)/g);
    if (classMatch) {
      for (const match of classMatch) {
        const className = match.replace(/export\s+class\s+/, '');

        // Check if this class is used elsewhere
        try {
          const result = execSync(`grep -r -l "${className}" --include="*.{js,ts,jsx,tsx}" ${rootDir} | grep -v "${filePath}"`, {
            encoding: 'utf8',
            stdio: ['pipe', 'pipe', 'pipe']
          });

          if (!result.trim().length) {
            orphaned.classes.push({ name: className, file: filePath });
          }
        } catch (error) {
          // grep returns non-zero exit code when no matches found
          orphaned.classes.push({ name: className, file: filePath });
        }
      }
    }

    return orphaned;
  } catch (error) {
    logger.error(`Error analyzing ${filePath}: ${error.message}`);
    return { classes: [], methods: [] };
  }
}

/**
 * Generate report of orphaned code
 */
function generateReport(orphanedFiles, orphanedClasses) {
  let report = '# Orphaned Code and Files Report\n\n';
  report += 'This document lists potentially orphaned code and files in the codebase, along with analysis and recommendations.\n\n';

  // Files section
  report += '## Orphaned Files\n\n';
  if (orphanedFiles.length === 0) {
    report += 'No orphaned files detected.\n\n';
  } else {
    for (const file of orphanedFiles) {
      report += `- ${file}\n`;
    }
    report += '\n';
  }

  // Classes section
  report += '## Orphaned Classes and Methods\n\n';
  if (orphanedClasses.length === 0) {
    report += 'No orphaned classes or methods detected.\n\n';
  } else {
    for (const item of orphanedClasses) {
      report += `- Class \`${item.name}\` in \`${item.file}\` appears to be unused\n`;
    }
    report += '\n';
  }

  // Write the report
  fs.writeFileSync(reportPath, report);
  logger.log(`Report generated at ${reportPath}`);
}

/**
 * Main function
 */
function main() {
  logger.log('Analyzing codebase for orphaned code...');

  // Find all code files
  const files = findCodeFiles();
  logger.log(`Found ${files.length} code files to analyze`);

  // Check for orphaned files
  const orphanedFiles = [];
  const orphanedClasses = [];

  files.forEach((file, index) => {
    if (index % 50 === 0) {
      logger.log(`Analyzed ${index}/${files.length} files...`);
    }

    // Check if file is referenced anywhere
    if (!isFileReferenced(file)) {
      orphanedFiles.push(file);
    }

    // Check for orphaned classes and methods
    const orphaned = analyzeFileContent(file);
    orphanedClasses.push(...orphaned.classes);
  });

  logger.log(`Found ${orphanedFiles.length} potentially orphaned files`);
  logger.log(`Found ${orphanedClasses.length} potentially orphaned classes`);

  // Generate report
  generateReport(orphanedFiles, orphanedClasses);

  // Special handling for UnusedCodeAnalyzer which appears in the matches
  const unusedCodeAnalyzerFiles = files.filter(f => f.includes('UnusedCodeAnalyzer'));
  if (unusedCodeAnalyzerFiles.length > 0) {
    logger.log('\nPotential action items:');
    logger.log('The following UnusedCodeAnalyzer files might need refactoring or consolidation:');
    unusedCodeAnalyzerFiles.forEach(f => logger.log(`- ${f}`));
  }

  logger.log('\nAnalysis completed. Check the report for details.');
}

main();

module.exports = {
  findCodeFiles,
  isFileReferenced,
  analyzeFileContent,
  generateReport,
  main
};
