/**
 * run-orphaned-code-analysis.js
 *
 * Scans the src/ directory for orphaned (unreferenced) code files and exports.
 * Generates a report and cleanup recommendations, with safety checks for dynamic imports and edge cases.
 *
 * Usage: node zzzscripts/run-orphaned-code-analysis.js
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

/**
 * Analyze import/export relationships in a file.
 * @param {string} filePath
 * @returns {object}
 */
function analyzeCodeUsage(filePath) {
  const code = fs.readFileSync(filePath, 'utf-8');
  const importRegex = /import\s+[^'"`]*['"`]([^'"`]+)['"`]/g;
  const dynamicImportRegex = /import\(['"`]([^'"`]+)['"`]\)/g;
  const exportRegex = /export\s+\{?\s*([\w,\s]*)\}?/g;
  const reExportRegex = /export\s+\{\s*([\w,\s]*)\s*\}\s+from\s+['"`]([^'"`]+)['"`]/g;

  const imports = [];
  const dynamicImports = [];
  const exports = [];
  const reExports = [];

  let match;
  while ((match = importRegex.exec(code))) {
    imports.push(match[1]);
  }
  while ((match = dynamicImportRegex.exec(code))) {
    dynamicImports.push(match[1]);
  }
  while ((match = exportRegex.exec(code))) {
    if (match[1]) {
      exports.push(...match[1].split(',').map(s => s.trim()).filter(Boolean));
    }
  }
  while ((match = reExportRegex.exec(code))) {
    if (match[1]) {
      reExports.push(...match[1].split(',').map(s => s.trim()).filter(Boolean));
    }
  }

  return {
    imports,
    dynamicImports,
    exports,
    reExports,
    hasDynamicImports: dynamicImports.length > 0,
    needsManualReview: dynamicImports.length > 0
  };
}

/**
 * Find orphaned files (not imported by any other file).
 * @param {object} importsMap
 * @returns {string[]}
 */
function findOrphanedFiles(importsMap) {
  const allFiles = Object.keys(importsMap);
  const referenced = new Set();
  for (const file of allFiles) {
    for (const imp of importsMap[file]) {
      const resolved = path.resolve(path.dirname(file), imp);
      for (const candidate of allFiles) {
        if (candidate.startsWith(resolved)) {
          referenced.add(candidate);
        }
      }
    }
  }
  return allFiles.filter(f => !referenced.has(f));
}

/**
 * Validate orphaned files for dynamic imports and edge cases.
 * @param {Array<{file: string, exports: string[], imports: string[]}>} orphans
 * @returns {object}
 */
function validateOrphans(orphans) {
  const confirmed = [];
  const needsReview = [];
  for (const orphan of orphans) {
    const code = fs.readFileSync(orphan.file, 'utf-8');
    if (/import\(['"`].+['"`]\)/.test(code)) {
      needsReview.push(orphan);
    } else {
      confirmed.push(orphan);
    }
  }
  return {
    confirmed,
    needsReview,
    safe: needsReview.length === 0
  };
}

/**
 * Generate a Markdown report of orphaned files and exports.
 * @param {object} orphans
 * @returns {string}
 */
function generateOrphanReport(orphans) {
  let report = '# Orphaned Code Analysis Report\n\n';
  if (orphans.files && orphans.files.length) {
    report += '## Orphaned Files\n';
    for (const file of orphans.files) {
      report += `- ${file}\n`;
    }
  }
  if (orphans.exports && orphans.exports.length) {
    report += '\n## Orphaned Exports\n';
    for (const exp of orphans.exports) {
      report += `- ${exp.file}: ${exp.symbols.join(', ')}\n`;
    }
  }
  if (orphans.recommendations && orphans.recommendations.length) {
    report += '\n## Cleanup Recommendations\n';
    for (const rec of orphans.recommendations) {
      report += `- ${rec.file}: ${rec.action} (impact: ${rec.impact})\n`;
    }
  }
  report += '\n## Safety Measures\n- Back up files before deletion.\n- Review files with dynamic imports manually.\n';
  fs.writeFileSync('orphaned-code-report.md', report);
  return report;
}

/**
 * Analyze the full dependency chain for a given entry file.
 * @param {string} entry
 * @param {object} deps
 * @returns {object}
 */
function analyzeDependencyChain(entry, deps) {
  const chain = [];
  const visited = new Set();
  let broken = false;
  const missingDependencies = [];
  function visit(file) {
    if (visited.has(file)) return;
    visited.add(file);
    chain.push(file);
    for (const dep of deps[file] || []) {
      if (!deps[dep]) {
        broken = true;
        missingDependencies.push(dep);
      } else {
        visit(dep);
      }
    }
  }
  visit(entry);
  const orphans = Object.keys(deps).filter(f => !visited.has(f));
  return {
    chain,
    orphans,
    broken,
    missingDependencies,
    valid: !broken
  };
}

// Main script logic
(function main() {
  const SRC_DIR = path.resolve(__dirname, '../src');
  const files = glob.sync(`${SRC_DIR}/**/*.{js,ts}`);
  const importsMap = {};
  for (const file of files) {
    const usage = analyzeCodeUsage(file);
    importsMap[file] = usage.imports.map(imp => {
      // Resolve relative imports to absolute paths
      if (imp.startsWith('.')) {
        return path.resolve(path.dirname(file), imp.endsWith('.js') || imp.endsWith('.ts') ? imp : imp + '.js');
      }
      return imp;
    });
  }
  const orphanedFiles = findOrphanedFiles(importsMap);
  const orphans = orphanedFiles.map(f => ({ file: f, exports: analyzeCodeUsage(f).exports, imports: importsMap[f] }));
  const validation = validateOrphans(orphans);
  const report = generateOrphanReport({
    files: validation.confirmed.map(o => o.file),
    exports: validation.confirmed.map(o => ({ file: o.file, symbols: o.exports })),
    recommendations: validation.confirmed.map(o => ({ file: o.file, action: 'remove', impact: 'none' }))
  });
  console.log(report);
})();

// Export for testing
module.exports = {
  findOrphanedFiles,
  analyzeCodeUsage,
  validateOrphans,
  generateOrphanReport,
  analyzeDependencyChain
};
