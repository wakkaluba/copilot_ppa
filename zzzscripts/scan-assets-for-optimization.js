// zzzscripts/scan-assets-for-optimization.js
// Scans media/ for large or non-optimized assets and prints a report.

const fs = require('fs');
const path = require('path');

const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.bmp', '.tiff', '.webp'];
const FONT_EXTENSIONS = ['.woff', '.woff2', '.ttf', '.otf', '.eot'];
const MAX_IMAGE_SIZE = 200 * 1024; // 200 KB
const MAX_FONT_SIZE = 500 * 1024; // 500 KB
const NON_OPTIMAL_IMAGE_FORMATS = ['.bmp', '.tiff'];

function scanDir(dir, results = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      scanDir(fullPath, results);
    } else {
      results.push(fullPath);
    }
  }
  return results;
}

function formatSize(bytes) {
  if (bytes > 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  if (bytes > 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return bytes + ' B';
}

function main() {
  const mediaDir = path.resolve(__dirname, '../media');
  if (!fs.existsSync(mediaDir)) {
    console.error('media/ directory not found.');
    process.exit(1);
  }
  const files = scanDir(mediaDir);
  const issues = [];

  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    const stat = fs.statSync(file);
    if (IMAGE_EXTENSIONS.includes(ext)) {
      if (stat.size > MAX_IMAGE_SIZE) {
        issues.push({
          file,
          size: stat.size,
          type: 'image',
          reason: 'Image exceeds 200 KB'
        });
      }
      if (NON_OPTIMAL_IMAGE_FORMATS.includes(ext)) {
        issues.push({
          file,
          size: stat.size,
          type: 'image',
          reason: 'Non-optimal image format (' + ext + ')'
        });
      }
    } else if (FONT_EXTENSIONS.includes(ext)) {
      if (stat.size > MAX_FONT_SIZE) {
        issues.push({
          file,
          size: stat.size,
          type: 'font',
          reason: 'Font exceeds 500 KB'
        });
      }
    }
  }

  if (issues.length === 0) {
    console.log('✅ All assets are within recommended size and format limits.');
    return;
  }

  console.log('Asset Optimization Report:');
  for (const issue of issues) {
    console.log(`- ${issue.file} (${formatSize(issue.size)}): ${issue.reason}`);
  }
  console.log('\nRecommendation: Optimize flagged images (e.g., compress, convert to webp/png/jpg) and fonts.');
}

if (require.main === module) {
  main();
}
