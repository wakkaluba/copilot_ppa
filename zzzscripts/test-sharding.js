/**
 * Test Sharding Utility
 *
 * This script enables parallel test execution by dividing tests into shards
 * Usage:
 *   node test-sharding.js --shards=4 --shard-index=0
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const { execSync } = require('child_process');
const logger = require('./logger');

// Parse command line arguments
const args = process.argv.slice(2).reduce((acc, arg) => {
  const [key, value] = arg.replace(/^--/, '').split('=');
  acc[key] = value;
  return acc;
}, {});

// Default values
const totalShards = parseInt(args.shards || '1', 10);
const shardIndex = parseInt(args['shard-index'] || '0', 10);
const testGlob = args.testGlob || '{tests,src}/**/*.test.{ts,js}';
const jestArgs = args.jestArgs || '';

// Validate inputs
if (shardIndex >= totalShards) {
  logger.error(`Error: Shard index (${shardIndex}) must be less than total shards (${totalShards})`);
  process.exit(1);
}

// Find all test files
const testFiles = glob.sync(testGlob, {
  ignore: ['**/node_modules/**']
});

if (testFiles.length === 0) {
  logger.warn('Warning: No test files found matching pattern:', testGlob);
  process.exit(0);
}

// Distribute test files across shards
const shardSize = Math.ceil(testFiles.length / totalShards);
const startIndex = shardIndex * shardSize;
const endIndex = Math.min(startIndex + shardSize, testFiles.length);
const shardTestFiles = testFiles.slice(startIndex, endIndex);

if (shardTestFiles.length === 0) {
  logger.warn(`Warning: No test files assigned to shard ${shardIndex}`);
  process.exit(0);
}

// Create temporary test file with the assigned tests
const tempTestFile = path.join(__dirname, `../temp-tests-shard-${shardIndex}.json`);
fs.writeFileSync(tempTestFile, JSON.stringify(shardTestFiles, null, 2));

logger.log(`Running test shard ${shardIndex + 1}/${totalShards} with ${shardTestFiles.length} tests`);

try {
  // Run Jest with the shard-specific tests
  const command = `npx jest --testPathPattern="^(${shardTestFiles.join('|').replace(/\\/g, '\\\\').replace(/\//g, '\\/')})$" --shard=${shardIndex + 1}/${totalShards} ${jestArgs}`;
  logger.log(`Executing: ${command}`);

  // Pass through stdout/stderr and exit code
  execSync(command, { stdio: 'inherit' });
  logger.log(`Shard ${shardIndex + 1}/${totalShards} completed successfully`);
} catch (error) {
  logger.error(`Shard ${shardIndex + 1}/${totalShards} failed with error:`, error.message);
  process.exit(error.status);
} finally {
  // Clean up temp file
  if (fs.existsSync(tempTestFile)) {
    fs.unlinkSync(tempTestFile);
  }
}
