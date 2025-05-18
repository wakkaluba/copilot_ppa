/* eslint-disable no-console */
/**
 * Code Quality Analyzer for VSCode Local LLM Agent
 *
 * This script performs comprehensive code quality analysis:
 * - Cyclomatic complexity
 * - Maintainability index
 * - Duplicate code detection
 * - Dependency analysis
 * - Technical debt estimation
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const glob = require('glob');
const logger = require('./logger');

// Core configuration with validation
const config = {
    src: './src',
    ignorePatterns: ['**/node_modules/**', '**/dist/**', '**/out/**', '**/test/**'],
    reporting: {
        outputDir: './quality-reports',
        summaryFile: 'quality-summary.json',
        detailedReport: 'detailed-quality-report.html'
    },
    thresholds: {
        complexity: 15,
        maintainability: 65,
        duplication: 5,
        codeToCommentRatio: 4,
        maxMethodLength: 30,
        maxParameters: 4,
        maxClassLength: 500,
        maxCognitiveComplexity: 15
    }
};

// Cache for performance optimization
const fileCache = new Map();
const analysisCache = new Map();

// Ensure directories exist
function ensureDirectoryExists(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * Get TypeScript files with caching
 */
function getTypeScriptFiles() {
    const cacheKey = 'typescript-files';
    if (fileCache.has(cacheKey)) {
        return fileCache.get(cacheKey);
    }

    const files = glob.sync('**/*.ts', {
        ignore: config.ignorePatterns,
        cwd: config.src,
        absolute: true
    });

    fileCache.set(cacheKey, files);
    return files;
}

/**
 * Helper: Analyze a single file's complexity and maintainability
 */
function analyzeFileComplexity(file, config, analysisCache) {
    const cacheKey = `complexity-${file}-${fs.statSync(file).mtimeMs}`;
    let report;
    if (analysisCache.has(cacheKey)) {
        report = analysisCache.get(cacheKey);
    } else {
        const output = execSync(`cr --format json ${file}`, { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
        report = JSON.parse(output);
        analysisCache.set(cacheKey, report);
    }
    return report;
}

/**
 * Helper: Aggregate complexity results from a report
 */
function aggregateComplexityResults(report, file, config, results, totals) {
    report.functions.forEach(func => {
        totals.totalComplexity += func.complexity.cyclomatic;
        totals.totalCognitiveComplexity += func.complexity.cognitive || 0;
        if (func.complexity.cyclomatic > config.thresholds.complexity) {
            results.complexFunctions.push({ file, function: func.name, line: func.line, complexity: func.complexity.cyclomatic });
        }
        if ((func.complexity.cognitive || 0) > config.thresholds.maxCognitiveComplexity) {
            results.cognitiveComplexity.highComplexityFunctions.push({ file, function: func.name, line: func.line, cognitiveComplexity: func.complexity.cognitive });
        }
    });
    totals.totalMaintainability += report.maintainability;
    if (report.maintainability < config.thresholds.maintainability) {
        results.poorMaintainability.push({ file, maintainability: report.maintainability });
    }
}

/**
 * Analyzes code complexity, maintainability, and cognitive complexity for TypeScript files.
 * Uses caching for performance and processes each file individually.
 * @returns {Promise<Object>} An object containing average complexity, maintainability, and lists of complex/poor maintainability functions.
 */
async function analyzeComplexity() {
    logger.log('📊 Analyzing code complexity...');

    const results = {
        averageComplexity: 0,
        complexFunctions: [],
        averageMaintainability: 0,
        poorMaintainability: [],
        cognitiveComplexity: {
            average: 0,
            highComplexityFunctions: []
        }
    };

    try {
        const files = getTypeScriptFiles();
        let totals = { totalComplexity: 0, totalMaintainability: 0, totalCognitiveComplexity: 0, fileCount: 0 };

        for (const file of files) {
            try {
                const report = analyzeFileComplexity(file, config, analysisCache);
                totals.fileCount++;
                aggregateComplexityResults(report, file, config, results, totals);
            } catch (error) {
                logger.warn(`Failed to analyze complexity for ${file}: ${error.message}`);
            }
        }

        if (totals.fileCount > 0) {
            results.averageComplexity = totals.totalComplexity / totals.fileCount;
            results.averageMaintainability = totals.totalMaintainability / totals.fileCount;
            results.cognitiveComplexity.average = totals.totalCognitiveComplexity / totals.fileCount;
        }

        return results;
    } catch (error) {
        logger.error('Failed to analyze code complexity:', error.message);
        return results;
    }
}

/**
 * Memory-efficient file content reader
 */
function readFileContent(filePath) {
    const cacheKey = `content-${filePath}-${fs.statSync(filePath).mtimeMs}`;
    if (analysisCache.has(cacheKey)) {
        return analysisCache.get(cacheKey);
    }

    const content = fs.readFileSync(filePath, 'utf8');
    analysisCache.set(cacheKey, content);
    return content;
}

/**
 * Detects code duplication using jscpd and identifies duplication hotspots.
 * @returns {Promise<Object>} An object with duplication percentage, duplicate fragments, and hotspots.
 */
async function detectDuplication() {
    logger.log('🔍 Detecting code duplication...');

    const duplicationData = {
        percentage: 0,
        duplicates: [],
        hotspots: []
    };

    try {
        const outputFile = path.join(config.reporting.outputDir, 'duplication-report.json');
        execSync(`jscpd ${config.src} --output ${config.reporting.outputDir} --reporters json --threshold ${config.thresholds.duplication}`);

        if (fs.existsSync(outputFile)) {
            const report = JSON.parse(fs.readFileSync(outputFile, 'utf8'));
            processDuplicationReport(report, duplicationData);
        }

        return duplicationData;
    } catch (error) {
        logger.error('Failed to detect code duplication:', error.message);
        return duplicationData;
    }
}

/**
 * Helper: Process duplication report
 */
function processDuplicationReport(report, duplicationData) {
    duplicationData.percentage = report.statistics.total.percentage;
    report.duplicates.forEach(dupe => {
        const sourceContext = extractContext(dupe.source.path, dupe.source.start, dupe.source.end);
        const targetContext = extractContext(dupe.target.path, dupe.target.start, dupe.target.end);
        duplicationData.duplicates.push({
            sourceFile: dupe.source.path,
            targetFile: dupe.target.path,
            lines: dupe.source.end - dupe.source.start,
            sourceContext,
            targetContext,
            fragment: dupe.fragment
        });
    });
    identifyHotspots(duplicationData);
}

/**
 * Extract context around duplicated code
 */
function extractContext(filePath, start, end, contextLines = 2) {
    try {
        const content = readFileContent(filePath);
        const lines = content.split('\n');
        const contextStart = Math.max(0, start - contextLines);
        const contextEnd = Math.min(lines.length, end + contextLines);

        return {
            before: lines.slice(contextStart, start).join('\n'),
            duplicate: lines.slice(start, end).join('\n'),
            after: lines.slice(end, contextEnd).join('\n')
        };
    } catch (error) {
        return null;
    }
}

/**
 * Identify duplication hotspots
 */
function identifyHotspots(data) {
    const fileFrequency = new Map();

    data.duplicates.forEach(dupe => {
        fileFrequency.set(dupe.sourceFile, (fileFrequency.get(dupe.sourceFile) || 0) + 1);
        fileFrequency.set(dupe.targetFile, (fileFrequency.get(dupe.targetFile) || 0) + 1);
    });

    // Files with the most duplications
    const hotspots = Array.from(fileFrequency.entries())
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([file, count]) => ({ file, duplicateCount: count }));

    data.hotspots = hotspots;
}

/**
 * Analyzes the ratio of comments to code lines in TypeScript files.
 * @returns {Object} An object with total lines, code lines, comment lines, ratio, and per-file results.
 */
function analyzeCommentsRatio() {
  logger.log('📝 Analyzing comments to code ratio...');

  const results = {
    totalLines: 0,
    codeLines: 0,
    commentLines: 0,
    ratio: 0,
    fileResults: []
  };

  const files = getTypeScriptFiles();

  files.forEach(file => {
    try {
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n');

      let fileStats = {
        file: file,
        totalLines: lines.length,
        codeLines: 0,
        commentLines: 0,
        ratio: 0
      };

      let inBlockComment = false;

      lines.forEach(line => {
        const trimmedLine = line.trim();

        if (inBlockComment) {
          fileStats.commentLines++;
          if (trimmedLine.includes('*/')) {
            inBlockComment = false;
          }
        } else if (trimmedLine.startsWith('//')) {
          fileStats.commentLines++;
        } else if (trimmedLine.startsWith('/*')) {
          fileStats.commentLines++;
          if (!trimmedLine.includes('*/')) {
            inBlockComment = true;
          }
        } else if (trimmedLine !== '') {
          fileStats.codeLines++;
        }
      });

      fileStats.ratio = fileStats.codeLines / (fileStats.commentLines || 1);

      results.totalLines += fileStats.totalLines;
      results.codeLines += fileStats.codeLines;
      results.commentLines += fileStats.commentLines;

      results.fileResults.push(fileStats);
    } catch (error) {
      logger.warn(`Failed to analyze comments for ${file}: ${error.message}`);
    }
  });

  results.ratio = results.codeLines / (results.commentLines || 1);

  return results;
}

/**
 * Analyzes project dependencies and checks for outdated packages.
 * @returns {Object} An object with dependency counts and outdated dependency details.
 */
function analyzeDependencies() {
  logger.log('🔗 Analyzing dependencies...');

  try {
    const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));

    // Check for outdated dependencies
    const outdatedOutput = execSync('npm outdated --json', { encoding: 'utf8' });
    let outdatedDeps = {};

    try {
      outdatedDeps = JSON.parse(outdatedOutput);
    } catch (e) {
      // If no outdated dependencies, output may not be valid JSON
      outdatedDeps = {};
    }

    const dependencies = {
      total: Object.keys(packageJson.dependencies || {}).length +
             Object.keys(packageJson.devDependencies || {}).length,
      direct: Object.keys(packageJson.dependencies || {}).length,
      dev: Object.keys(packageJson.devDependencies || {}).length,
      outdated: Object.keys(outdatedDeps).length,
      outdatedList: outdatedDeps
    };

    return dependencies;
  } catch (error) {
    logger.error('Failed to analyze dependencies:', error.message);
    return {
      total: 0,
      direct: 0,
      dev: 0,
      outdated: 0,
      outdatedList: {}
    };
  }
}

/**
 * Estimates technical debt based on complexity, duplication, documentation, and dependencies.
 * @param {Object} complexity - Complexity analysis results.
 * @param {Object} duplication - Duplication analysis results.
 * @param {Object} commentsRatio - Comments ratio analysis results.
 * @param {Object} dependencies - Dependency analysis results.
 * @returns {Object} An object with debt scores and estimated hours to fix.
 */
function estimateTechnicalDebt(complexity, duplication, commentsRatio, dependencies) {
  const debtScore = {
    overall: 0,
    categories: {
      complexity: 0,
      duplication: 0,
      documentation: 0,
      dependencies: 0
    },
    estimate: {
      hoursToFix: 0,
      priority: 'low'
    }
  };

  // Calculate debt from complexity
  if (complexity.averageComplexity > config.thresholds.complexity) {
    debtScore.categories.complexity =
      (complexity.averageComplexity - config.thresholds.complexity) /
      config.thresholds.complexity * 100;
  }
  debtScore.categories.complexity += complexity.complexFunctions.length * 5;

  // Calculate debt from duplication
  if (duplication.percentage > config.thresholds.duplication) {
    debtScore.categories.duplication =
      (duplication.percentage - config.thresholds.duplication) /
      config.thresholds.duplication * 100;
  }

  // Calculate debt from documentation
  if (commentsRatio.ratio > config.thresholds.codeToCommentRatio) {
    debtScore.categories.documentation =
      (commentsRatio.ratio - config.thresholds.codeToCommentRatio) /
      config.thresholds.codeToCommentRatio * 100;
  }

  // Calculate debt from dependencies
  debtScore.categories.dependencies =
    (dependencies.outdated / (dependencies.total || 1)) * 100;

  // Calculate overall score (weighted average)
  debtScore.overall =
    (debtScore.categories.complexity * 0.4) +
    (debtScore.categories.duplication * 0.3) +
    (debtScore.categories.documentation * 0.2) +
    (debtScore.categories.dependencies * 0.1);

  // Estimate hours to fix
  debtScore.estimate.hoursToFix =
    (complexity.complexFunctions.length * 2) +
    (duplication.duplicates.length * 1.5) +
    (dependencies.outdated * 1);

  // Determine priority
  if (debtScore.overall > 60) {
    debtScore.estimate.priority = 'high';
  } else if (debtScore.overall > 30) {
    debtScore.estimate.priority = 'medium';
  } else {
    debtScore.estimate.priority = 'low';
  }

  return debtScore;
}

// Generate HTML report
function generateHtmlReport(results) {
  const htmlTemplate = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Code Quality Report</title>
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif; margin: 0; padding: 20px; color: #333; }
      h1, h2, h3 { color: #0366d6; }
      .card { background: #fff; border-radius: 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); margin-bottom: 20px; padding: 20px; }
      .metric { display: flex; align-items: center; margin-bottom: 10px; }
      .metric-value { font-size: 1.4em; font-weight: bold; margin-right: 10px; }
      .metric-label { font-size: 1em; color: #666; }
      .good { color: #28a745; }
      .warning { color: #f0ad4e; }
      .danger { color: #dc3545; }
      table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
      th, td { text-align: left; padding: 8px; border-bottom: 1px solid #ddd; }
      th { background-color: #f6f8fa; }
      tr:hover { background-color: #f6f8fa; }
      .progress-bar { width: 100%; background-color: #e9ecef; border-radius: 4px; margin-bottom: 20px; }
      .progress { height: 20px; border-radius: 4px; background-color: #0366d6; }
      .footer { text-align: center; margin-top: 30px; font-size: 0.8em; color: #666; }
    </style>
  </head>
  <body>
    <h1>Code Quality Report</h1>
    <p>Generated on ${new Date().toLocaleString()}</p>

    <div class="card">
      <h2>Technical Debt Overview</h2>
      <div class="metric">
        <div class="metric-value ${results.technicalDebt.overall < 30 ? 'good' : results.technicalDebt.overall < 60 ? 'warning' : 'danger'}">
          ${results.technicalDebt.overall.toFixed(1)}
        </div>
        <div class="metric-label">Overall Technical Debt Score</div>
      </div>

      <h3>Estimated Remediation</h3>
      <div class="metric">
        <div class="metric-value">
          ${results.technicalDebt.estimate.hoursToFix.toFixed(0)}
        </div>
        <div class="metric-label">Hours to Fix</div>
      </div>

      <div class="metric">
        <div class="metric-value ${results.technicalDebt.estimate.priority === 'low' ? 'good' : results.technicalDebt.estimate.priority === 'medium' ? 'warning' : 'danger'}">
          ${results.technicalDebt.estimate.priority.toUpperCase()}
        </div>
        <div class="metric-label">Priority</div>
      </div>

      <h3>Debt Breakdown</h3>
      <table>
        <tr>
          <th>Category</th>
          <th>Score</th>
        </tr>
        <tr>
          <td>Code Complexity</td>
          <td>${results.technicalDebt.categories.complexity.toFixed(1)}</td>
        </tr>
        <tr>
          <td>Code Duplication</td>
          <td>${results.technicalDebt.categories.duplication.toFixed(1)}</td>
        </tr>
        <tr>
          <td>Documentation</td>
          <td>${results.technicalDebt.categories.documentation.toFixed(1)}</td>
        </tr>
        <tr>
          <td>Dependencies</td>
          <td>${results.technicalDebt.categories.dependencies.toFixed(1)}</td>
        </tr>
      </table>
    </div>

    <div class="card">
      <h2>Code Complexity</h2>
      <div class="metric">
        <div class="metric-value ${results.complexity.averageComplexity < config.thresholds.complexity * 0.7 ? 'good' : results.complexity.averageComplexity < config.thresholds.complexity ? 'warning' : 'danger'}">
          ${results.complexity.averageComplexity.toFixed(1)}
        </div>
        <div class="metric-label">Average Cyclomatic Complexity</div>
      </div>

      <div class="metric">
        <div class="metric-value ${results.complexity.averageMaintainability > config.thresholds.maintainability * 1.1 ? 'good' : results.complexity.averageMaintainability > config.thresholds.maintainability ? 'warning' : 'danger'}">
          ${results.complexity.averageMaintainability.toFixed(1)}
        </div>
        <div class="metric-label">Average Maintainability Index</div>
      </div>

      <h3>Complex Functions (${results.complexity.complexFunctions.length})</h3>
      ${results.complexity.complexFunctions.length > 0 ? `
      <table>
        <tr>
          <th>File</th>
          <th>Function</th>
          <th>Line</th>
          <th>Complexity</th>
        </tr>
        ${results.complexity.complexFunctions.map(func => `
        <tr>
          <td>${func.file}</td>
          <td>${func.function}</td>
          <td>${func.line}</td>
          <td class="${func.complexity < config.thresholds.complexity * 1.2 ? 'warning' : 'danger'}">${func.complexity}</td>
        </tr>
        `).join('')}
      </table>
      ` : '<p>No overly complex functions found.</p>'}
    </div>

    <div class="card">
      <h2>Code Duplication</h2>
      <div class="metric">
        <div class="metric-value ${results.duplication.percentage < config.thresholds.duplication * 0.7 ? 'good' : results.duplication.percentage < config.thresholds.duplication ? 'warning' : 'danger'}">
          ${results.duplication.percentage.toFixed(1)}%
        </div>
        <div class="metric-label">Duplication Percentage</div>
      </div>

      <div class="progress-bar">
        <div class="progress" style="width: ${Math.min(results.duplication.percentage, 100)}%"></div>
      </div>

      <h3>Top Duplicates (${results.duplication.duplicates.length})</h3>
      ${results.duplication.duplicates.length > 0 ? `
      <table>
        <tr>
          <th>Source File</th>
          <th>Target File</th>
          <th>Lines</th>
        </tr>
        ${results.duplication.duplicates.slice(0, 10).map(dupe => `
        <tr>
          <td>${dupe.sourceFile}</td>
          <td>${dupe.targetFile}</td>
          <td>${dupe.lines}</td>
        </tr>
        `).join('')}
      </table>
      ` : '<p>No duplicate code found.</p>'}
    </div>

    <div class="card">
      <h2>Code to Comments Ratio</h2>
      <div class="metric">
        <div class="metric-value ${results.commentsRatio.ratio < config.thresholds.codeToCommentRatio * 0.7 ? 'good' : results.commentsRatio.ratio < config.thresholds.codeToCommentRatio ? 'warning' : 'danger'}">
          ${results.commentsRatio.ratio.toFixed(1)}:1
        </div>
        <div class="metric-label">Code to Comments Ratio</div>
      </div>

      <div class="metric">
        <div class="metric-value">${results.commentsRatio.codeLines}</div>
        <div class="metric-label">Lines of Code</div>
      </div>

      <div class="metric">
        <div class="metric-value">${results.commentsRatio.commentLines}</div>
        <div class="metric-label">Lines of Comments</div>
      </div>
    </div>

    <div class="card">
      <h2>Dependencies</h2>
      <div class="metric">
        <div class="metric-value">${results.dependencies.total}</div>
        <div class="metric-label">Total Dependencies</div>
      </div>

      <div class="metric">
        <div class="metric-value ${results.dependencies.outdated === 0 ? 'good' : results.dependencies.outdated < 5 ? 'warning' : 'danger'}">
          ${results.dependencies.outdated}
        </div>
        <div class="metric-label">Outdated Dependencies</div>
      </div>

      <h3>Direct vs Dev Dependencies</h3>
      <div class="metric">
        <div class="metric-value">${results.dependencies.direct}</div>
        <div class="metric-label">Direct Dependencies</div>
      </div>

      <div class="metric">
        <div class="metric-value">${results.dependencies.dev}</div>
        <div class="metric-label">Dev Dependencies</div>
      </div>

      ${Object.keys(results.dependencies.outdatedList).length > 0 ? `
      <h3>Outdated Packages</h3>
      <table>
        <tr>
          <th>Package</th>
          <th>Current</th>
          <th>Latest</th>
        </tr>
        ${Object.entries(results.dependencies.outdatedList).map(([pkg, info]) => `
        <tr>
          <td>${pkg}</td>
          <td>${info.current}</td>
          <td>${info.latest}</td>
        </tr>
        `).join('')}
      </table>
      ` : ''}
    </div>

    <div class="footer">
      <p>Generated by Code Quality Analyzer</p>
    </div>
  </body>
  </html>
  `;

  return htmlTemplate;
}

// Run the analysis
function runAnalysis() {
  logger.log('🔍 Starting code quality analysis...');

  ensureDirectoryExists(config.reporting.outputDir);

  const complexity = analyzeComplexity();
  const duplication = detectDuplication();
  const commentsRatio = analyzeCommentsRatio();
  const dependencies = analyzeDependencies();

  const technicalDebt = estimateTechnicalDebt(
    complexity,
    duplication,
    commentsRatio,
    dependencies
  );

  const results = {
    complexity,
    duplication,
    commentsRatio,
    dependencies,
    technicalDebt,
    timestamp: new Date().toISOString()
  };

  // Save JSON report
  fs.writeFileSync(
    path.join(config.reporting.outputDir, config.reporting.summaryFile),
    JSON.stringify(results, null, 2)
  );

  // Generate and save HTML report
  const htmlReport = generateHtmlReport(results);
  fs.writeFileSync(
    path.join(config.reporting.outputDir, config.reporting.detailedReport),
    htmlReport
  );

  // Print summary
  logger.log('\n📊 Code Quality Summary:');
  logger.log('=======================');
  logger.log(`Cyclomatic Complexity: ${results.complexity.averageComplexity.toFixed(2)} (${results.complexity.complexFunctions.length} complex functions)`);
  logger.log(`Code Duplication: ${results.duplication.percentage.toFixed(2)}% (${results.duplication.duplicates.length} duplicates)`);
  logger.log(`Code to Comments Ratio: ${results.commentsRatio.ratio.toFixed(2)}:1`);
  logger.log(`Dependencies: ${results.dependencies.total} total, ${results.dependencies.outdated} outdated`);
  logger.log(`Technical Debt Score: ${results.technicalDebt.overall.toFixed(2)}`);
  logger.log(`Estimated Hours to Fix: ${results.technicalDebt.estimate.hoursToFix.toFixed(0)}`);
  logger.log(`Priority: ${results.technicalDebt.estimate.priority.toUpperCase()}`);

  logger.log(`\n✅ Analysis complete! Detailed reports saved to ${config.reporting.outputDir}/`);
}

// Main analysis runner
async function runAnalysis() {
    logger.log('🔍 Starting code quality analysis...');

    ensureDirectoryExists(config.reporting.outputDir);

    const [complexity, duplication] = await Promise.all([
        analyzeComplexity(),
        detectDuplication()
    ]);

    const commentsRatio = analyzeCommentsRatio();
    const dependencies = analyzeDependencies();

    const results = {
        complexity,
        duplication,
        commentsRatio,
        dependencies,
        technicalDebt: estimateTechnicalDebt(complexity, duplication, commentsRatio, dependencies),
        timestamp: new Date().toISOString()
    };

    // Generate reports
    generateReports(results);

    // Print summary
    printSummary(results);
}

// Start analysis
runAnalysis().catch(console.error);

// Export functions for testing
module.exports = {
    getTypeScriptFiles,
    analyzeComplexity,
    detectDuplication,
    analyzeCommentsRatio,
    analyzeDependencies,
    estimateTechnicalDebt,
    generateHtmlReport,
    runAnalysis,
    config,
    fileCache,
    analysisCache
};
