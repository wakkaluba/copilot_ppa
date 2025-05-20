/**
 * update-refactoring-status.js
 *
 * Updates and reports the status of refactoring tasks, including completed, pending, and failed tasks, and generates a Markdown status report. Integrates with refactoring progress files and can be extended for automation.
 *
 * Usage: node zzzscripts/update-refactoring-status.js
 */

const fs = require('fs');
const path = require('path');

const STATUS_FILE = path.resolve(__dirname, '../zzzrefactoring/refactoring-status.json');
const REPORT_FILE = path.resolve(__dirname, '../zzzrefactoring/refactoring-status-report.md');

/**
 * Parse the current status file or return a default structure if missing.
 * @returns {object}
 */
function parseCurrentStatus() {
  if (fs.existsSync(STATUS_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(STATUS_FILE, 'utf-8'));
    } catch (e) {
      console.error('Failed to parse status file:', e);
    }
  }
  return {
    timestamp: new Date().toISOString(),
    completedTasks: [],
    pendingTasks: [],
    failedTasks: [],
    statistics: {
      filesRefactored: 0,
      linesChanged: 0,
      successRate: 100
    }
  };
}

/**
 * Update the refactoring progress with a task update.
 * @param {object} currentStatus
 * @param {object} update
 * @returns {object}
 */
function updateRefactoringProgress(currentStatus, update) {
  const status = { ...currentStatus };
  status.details = status.details || {};
  if (update.status === 'completed') {
    status.completedTasks = status.completedTasks || [];
    status.completedTasks.push(update.taskId);
    status.pendingTasks = (status.pendingTasks || []).filter(t => t !== update.taskId);
    status.details[update.taskId] = update.details || '';
  } else if (update.status === 'failed') {
    status.failedTasks = status.failedTasks || [];
    status.failedTasks.push({ taskId: update.taskId, error: update.error });
    status.pendingTasks = (status.pendingTasks || []).filter(t => t !== update.taskId);
    status.details[update.taskId] = update.error || '';
    // Update success rate
    const total = (status.completedTasks.length + status.failedTasks.length) || 1;
    status.statistics.successRate = Math.round((status.completedTasks.length / total) * 100);
  }
  return status;
}

/**
 * Generate a Markdown status report from the status object.
 * @param {object} status
 * @returns {string}
 */
function generateStatusReport(status) {
  let report = `# Refactoring Status Report\n\n`;
  report += `**Last updated:** ${status.timestamp}\n\n`;
  report += `## Completed Tasks (${status.completedTasks.length})\n`;
  status.completedTasks.forEach(t => {
    report += `- ${t}\n`;
  });
  report += `\n## Pending Tasks (${status.pendingTasks.length})\n`;
  status.pendingTasks.forEach(t => {
    report += `- ${t}\n`;
  });
  if (status.failedTasks && status.failedTasks.length > 0) {
    report += `\n## Failed Tasks (${status.failedTasks.length})\n`;
    status.failedTasks.forEach(f => {
      report += `- ${f.taskId}: ${f.error}\n`;
    });
    report += `\n## Error Analysis\n`;
    status.failedTasks.forEach(f => {
      report += `- ${f.taskId}: ${f.error}\n`;
    });
  }
  report += `\n## Statistics\n`;
  report += `- ${status.statistics.filesRefactored} files refactored\n`;
  report += `- ${status.statistics.linesChanged} lines changed\n`;
  report += `- ${status.statistics.successRate}% success rate\n`;
  fs.writeFileSync(REPORT_FILE, report, 'utf-8');
  return report;
}

/**
 * Main entry point: parses status, updates timestamp, writes report.
 */
function main() {
  const status = parseCurrentStatus();
  status.timestamp = new Date().toISOString();
  generateStatusReport(status);
  fs.writeFileSync(STATUS_FILE, JSON.stringify(status, null, 2), 'utf-8');
  console.log('Refactoring status updated and report generated.');
}

if (require.main === module) {
  main();
}

// Exports for testing
module.exports = {
  parseCurrentStatus,
  updateRefactoringProgress,
  generateStatusReport
};
