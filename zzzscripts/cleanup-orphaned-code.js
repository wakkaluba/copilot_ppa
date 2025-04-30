const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const rootDir = path.resolve(__dirname, '..');
const orphanedReportPath = path.join(rootDir, 'zzzbuild', 'orphaned-code-report.md');
const backupDir = path.join(rootDir, 'zzzbuild', 'backups', 'orphaned-code');

/**
 * Read and parse the orphaned code report
 */
function parseOrphanedReport() {
  try {
    const content = fs.readFileSync(orphanedReportPath, 'utf8');

    // Parse file sections
    const sections = {
      files: [],
      classes: []
    };

    let currentSection = null;
    const lines = content.split('\n');

    for (const line of lines) {
      if (line.includes('## Orphaned Files')) {
        currentSection = 'files';
        continue;
      } else if (line.includes('## Orphaned Classes and Methods')) {
        currentSection = 'classes';
        continue;
      }

      // Extract file paths - look for markdown list items
      if (currentSection === 'files' && line.trim().startsWith('- ')) {
        const filePath = line.trim().substring(2).trim();
        if (filePath) sections.files.push(filePath);
      }

      // Extract class and method information
      if (currentSection === 'classes' && line.trim().startsWith('- ')) {
        const item = line.trim().substring(2).trim();
        if (item) sections.classes.push(item);
      }
    }

    return sections;
  } catch (error) {
    console.error(`Error parsing orphaned code report: ${error.message}`);
    return { files: [], classes: [] };
  }
}

/**
 * Create backup of a file before modification
 */
function backupFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) return false;

    // Create backup directory if it doesn't exist
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const relativePath = path.relative(rootDir, filePath);
    const backupPath = path.join(backupDir, relativePath);

    // Create directories for backup
    const backupDirPath = path.dirname(backupPath);
    if (!fs.existsSync(backupDirPath)) {
      fs.mkdirSync(backupDirPath, { recursive: true });
    }

    // Copy file to backup
    fs.copyFileSync(filePath, backupPath);
    console.log(`Created backup of ${relativePath}`);
    return true;
  } catch (error) {
    console.error(`Error creating backup for ${filePath}: ${error.message}`);
    return false;
  }
}

/**
 * Process orphaned files
 */
function processOrphanedFiles(files) {
  if (!files || !files.length) {
    console.log('No orphaned files to process');
    return;
  }

  console.log(`Processing ${files.length} orphaned files...`);

  for (const file of files) {
    try {
      const fullPath = path.join(rootDir, file);

      if (!fs.existsSync(fullPath)) {
        console.log(`File does not exist: ${file}`);
        continue;
      }

      // Create backup before removing
      if (backupFile(fullPath)) {
        // Check if file is tracked in git
        try {
          const gitStatus = execSync(`git ls-files --error-unmatch "${fullPath}"`, {
            encoding: 'utf8',
            stdio: ['pipe', 'pipe', 'ignore']
          });

          // File is tracked in git, remove it using git
          console.log(`Removing orphaned file from git: ${file}`);
          execSync(`git rm "${fullPath}"`, { stdio: 'inherit' });
        } catch (gitError) {
          // File is not tracked in git, just delete it
          console.log(`Removing orphaned file: ${file}`);
          fs.unlinkSync(fullPath);
        }
      }
    } catch (error) {
      console.error(`Error processing file ${file}: ${error.message}`);
    }
  }
}

/**
 * Main function
 */
function main() {
  console.log('Starting orphaned code cleanup...');

  // Parse the report
  const orphanedSections = parseOrphanedReport();

  // Process orphaned files
  processOrphanedFiles(orphanedSections.files);

  console.log('Orphaned code cleanup completed');
  console.log('Note: Orphaned classes and methods need manual review before removal');
  console.log(`Classes to review: ${orphanedSections.classes.length}`);
}

main();
