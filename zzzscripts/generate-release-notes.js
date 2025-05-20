#!/usr/bin/env node
/**
 * Script: generate-release-notes.js
 * Generates release notes from commit messages and optionally publishes to CHANGELOG.md.
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function getLatestTag() {
  try {
    return execSync('git describe --tags --abbrev=0', { encoding: 'utf-8' }).trim();
  } catch {
    return '';
  }
}

function getCommitsSinceTag(tag) {
  const range = tag ? `${tag}..HEAD` : 'HEAD';
  return execSync(`git log ${range} --pretty=format:"- %s (%an)"`, { encoding: 'utf-8' });
}

function main() {
  const latestTag = getLatestTag();
  const commits = getCommitsSinceTag(latestTag);
  const releaseNotes = `# Release Notes\n\n${commits}\n`;
  const changelogPath = path.resolve(__dirname, '../CHANGELOG.md');
  fs.appendFileSync(changelogPath, `\n${releaseNotes}`);
  console.log('Release notes generated and appended to CHANGELOG.md');
}

if (require.main === module) {
  main();
}
