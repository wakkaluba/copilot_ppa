const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const logger = require('./logger');

// Configuration
const scriptsDir = __dirname;
const rootDir = path.resolve(__dirname, '..');
const outputDir = path.join(rootDir, 'zzzbuild', 'analysis-output');

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Timestamp for logs
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const logFile = path.join(outputDir, `orphaned-code-analysis-${timestamp}.log`);

logger.log('Starting orphaned code analysis...');
logger.log(`Log will be saved to ${logFile}`);

// Run the existing unused code analyzer script
try {
  logger.log('\n1. Running UnusedCodeAnalyzer refactoring analysis...');
  const output = execSync(`node "${path.join(scriptsDir, 'refactor-unused-code-analyzer.js')}"`, {
    encoding: 'utf8'
  });
  logger.log(output);
  fs.appendFileSync(logFile, `\n\n=== UNUSED CODE ANALYZER ANALYSIS ===\n${output}`);
  logger.log('Analysis completed successfully.');
} catch (error) {
  logger.error(`Error running analysis: ${error.message}`);
  fs.appendFileSync(logFile, `\n\nERROR: ${error.message}`);
}

// Generate a summary based on the orphaned-code-report.md file
try {
  logger.log('\n2. Generating summary from orphaned-code-report.md...');
  const reportPath = path.join(rootDir, 'zzzbuild', 'orphaned-code-report.md');

  if (fs.existsSync(reportPath)) {
    const reportContent = fs.readFileSync(reportPath, 'utf8');

    // Count orphaned files and classes
    const fileMatches = reportContent.match(/### \d+\. .+?\n- \*\*Files?\*\*:/g) || [];
    const classMatches = reportContent.match(/### \d+\. .+?\n- \*\*File/g) || [];
    const implementationGaps = reportContent.match(/### \d+\. .+?\n- \*\*Description\*\*/g) || [];

    logger.log('\nSummary:');
    logger.log(`- Orphaned Files Categories: ${fileMatches.length}`);
    logger.log(`- Orphaned Classes/Methods Categories: ${classMatches.length}`);
    logger.log(`- Implementation Gaps: ${implementationGaps.length}`);

    // Extract and display status counts
    const statusMatches = reportContent.match(/\*\*Status\*\*: (.+)$/gm) || [];
    const statusCounts = {};

    statusMatches.forEach(match => {
      const status = match.match(/\*\*Status\*\*: (.+)$/)[1];
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });

    logger.log('\nStatus Breakdown:');
    Object.entries(statusCounts).forEach(([status, count]) => {
      logger.log(`- ${status}: ${count}`);
    });

    // Save summary to log
    fs.appendFileSync(logFile, '\n\n=== ORPHANED CODE REPORT SUMMARY ===\n');
    fs.appendFileSync(logFile, `Orphaned Files Categories: ${fileMatches.length}\n`);
    fs.appendFileSync(logFile, `Orphaned Classes/Methods Categories: ${classMatches.length}\n`);
    fs.appendFileSync(logFile, `Implementation Gaps: ${implementationGaps.length}\n\n`);
    fs.appendFileSync(logFile, 'Status Breakdown:\n');
    Object.entries(statusCounts).forEach(([status, count]) => {
      fs.appendFileSync(logFile, `- ${status}: ${count}\n`);
    });
  } else {
    logger.log('orphaned-code-report.md file not found.');
    fs.appendFileSync(logFile, '\n\norphaned-code-report.md file not found.');
  }
} catch (error) {
  logger.error(`Error generating summary: ${error.message}`);
  fs.appendFileSync(logFile, `\n\nERROR generating summary: ${error.message}`);
}

logger.log('\nAnalysis complete!');
logger.log(`Full results saved to ${logFile}`);
logger.log('Next steps:');
logger.log('1. Review the analysis output for orphaned code');
logger.log('2. Update orphaned-code-report.md with any new findings');
logger.log('3. Create tickets or tasks for cleaning up identified orphaned code');

module.exports = {
  // For testability, export main and any helper functions you want to test
};
