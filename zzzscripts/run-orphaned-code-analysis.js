const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

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

console.log('Starting orphaned code analysis...');
console.log(`Log will be saved to ${logFile}`);

// Run the existing unused code analyzer script
try {
  console.log('\n1. Running UnusedCodeAnalyzer refactoring analysis...');
  const output = execSync(`node "${path.join(scriptsDir, 'refactor-unused-code-analyzer.js')}"`, {
    encoding: 'utf8'
  });
  console.log(output);
  fs.appendFileSync(logFile, `\n\n=== UNUSED CODE ANALYZER ANALYSIS ===\n${output}`);
  console.log('Analysis completed successfully.');
} catch (error) {
  console.error(`Error running analysis: ${error.message}`);
  fs.appendFileSync(logFile, `\n\nERROR: ${error.message}`);
}

// Generate a summary based on the orphaned-code-report.md file
try {
  console.log('\n2. Generating summary from orphaned-code-report.md...');
  const reportPath = path.join(rootDir, 'zzzbuild', 'orphaned-code-report.md');

  if (fs.existsSync(reportPath)) {
    const reportContent = fs.readFileSync(reportPath, 'utf8');

    // Count orphaned files and classes
    const fileMatches = reportContent.match(/### \d+\. .+?\n- \*\*Files?\*\*:/g) || [];
    const classMatches = reportContent.match(/### \d+\. .+?\n- \*\*File/g) || [];
    const implementationGaps = reportContent.match(/### \d+\. .+?\n- \*\*Description\*\*/g) || [];

    console.log('\nSummary:');
    console.log(`- Orphaned Files Categories: ${fileMatches.length}`);
    console.log(`- Orphaned Classes/Methods Categories: ${classMatches.length}`);
    console.log(`- Implementation Gaps: ${implementationGaps.length}`);

    // Extract and display status counts
    const statusMatches = reportContent.match(/\*\*Status\*\*: (.+)$/gm) || [];
    const statusCounts = {};

    statusMatches.forEach(match => {
      const status = match.match(/\*\*Status\*\*: (.+)$/)[1];
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });

    console.log('\nStatus Breakdown:');
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`- ${status}: ${count}`);
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
    console.log('orphaned-code-report.md file not found.');
    fs.appendFileSync(logFile, '\n\norphaned-code-report.md file not found.');
  }
} catch (error) {
  console.error(`Error generating summary: ${error.message}`);
  fs.appendFileSync(logFile, `\n\nERROR generating summary: ${error.message}`);
}

console.log('\nAnalysis complete!');
console.log(`Full results saved to ${logFile}`);
console.log('Next steps:');
console.log('1. Review the analysis output for orphaned code');
console.log('2. Update orphaned-code-report.md with any new findings');
console.log('3. Create tickets or tasks for cleaning up identified orphaned code');
