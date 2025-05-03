#!/usr/bin/env node

/**
 * This script runs tests specifically for the codeReview module with coverage reporting
 */
const { exec } = require('child_process');
const path = require('path');

// Get the root directory of the project
const rootDir = path.resolve(__dirname, '../');

// Command to run Jest with our custom setup
const command = `npx jest --config=jest.config.js "test/unit/codeReview/.*\\.test\\.(js|ts)$" --coverage --setupFilesAfterEnv=${path.join(rootDir, 'test/unit/codeReview/jest.setup.js')} --collectCoverageFrom="src/codeReview/**/*.{js,ts}"`;

console.log(`Running command: ${command}`);

// Execute the command
const child = exec(command, { cwd: rootDir });

// Stream output
child.stdout.pipe(process.stdout);
child.stderr.pipe(process.stderr);

// Handle completion
child.on('exit', (code) => {
  process.exit(code);
});
