/**
 * Script to create empty test folders and files where missing
 * This helps to prepare the project structure for future test implementation
 */
const fs = require('fs');
const path = require('path');

// Configuration
const config = {
    sourceRoots: ['src'],
    testRoot: 'test',
    fileExtensions: ['.js', '.ts'],
    excludeFolders: ['node_modules', '.git', '.vscode', 'test'],
    verbose: true
};

// Stats for reporting
const stats = {
    foundSourceFiles: 0,
    existingTestFiles: 0,
    createdTestFolders: 0,
    createdTestFiles: 0
};

/**
 * Create a basic test file template
 */
function createTestFileTemplate(sourceFile, isTypeScript) {
    const fileName = path.basename(sourceFile, path.extname(sourceFile));
    const relativePath = path.relative(process.cwd(), sourceFile);

    if (isTypeScript) {
        return `/**
 * Tests for ${fileName}
 * Source: ${relativePath}
 */
import * as assert from 'assert';
import * as path from 'path';
import * as vscode from 'vscode';
// TODO: Import the module to test
// import { } from '../../${relativePath.replace(/\\/g, '/')}';

describe('${fileName}', () => {
    beforeEach(() => {
        // Setup test environment
    });

    afterEach(() => {
        // Clean up test environment
    });

    it('should be properly tested', () => {
        // TODO: Implement tests
        assert.strictEqual(true, true);
    });
});
`;
    } else {
        return `/**
 * Tests for ${fileName}
 * Source: ${relativePath}
 */
const assert = require('assert');
const path = require('path');
const vscode = require('vscode');
// TODO: Import the module to test
// const { } = require('../../${relativePath.replace(/\\/g, '/')}');

describe('${fileName}', () => {
    beforeEach(() => {
        // Setup test environment
    });

    afterEach(() => {
        // Clean up test environment
    });

    it('should be properly tested', () => {
        // TODO: Implement tests
        assert.strictEqual(true, true);
    });
});
`;
    }
}

/**
 * Create the test folder and empty test file
 */
function createTestFile(sourceFile, testFile) {
    const testDir = path.dirname(testFile);
    const isTypeScript = path.extname(sourceFile) === '.ts';
    const testFileContent = createTestFileTemplate(sourceFile, isTypeScript);

    // Create test directory if it doesn't exist
    if (!fs.existsSync(testDir)) {
        fs.mkdirSync(testDir, { recursive: true });
        stats.createdTestFolders++;
        if (config.verbose) console.log(`Created test folder: ${testDir}`);
    }

    // Create test file
    fs.writeFileSync(testFile, testFileContent);
    stats.createdTestFiles++;
    if (config.verbose) console.log(`Created test file: ${testFile}`);
}

/**
 * Map source file path to test file path
 */
function mapToTestPath(sourcePath) {
    for (const sourceRoot of config.sourceRoots) {
        if (sourcePath.startsWith(sourceRoot)) {
            // Replace source root with test root
            const relativePath = path.relative(sourceRoot, sourcePath);
            const testFile = path.join(config.testRoot, relativePath);

            // Keep the same extension
            return testFile;
        }
    }
    return null;
}

/**
 * Process a source file to check if it needs a test file
 */
function processSourceFile(sourceFile) {
    stats.foundSourceFiles++;

    // Map to test path
    const testFile = mapToTestPath(sourceFile);
    if (!testFile) return;

    // Check if test file already exists
    if (fs.existsSync(testFile)) {
        stats.existingTestFiles++;
        if (config.verbose) console.log(`Test file already exists: ${testFile}`);
        return;
    }

    // Create test file
    createTestFile(sourceFile, testFile);
}

/**
 * Scan directory recursively for source files
 */
function scanDirectory(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        // Skip excluded folders
        if (entry.isDirectory() && !config.excludeFolders.includes(entry.name)) {
            scanDirectory(fullPath);
            continue;
        }

        // Process source files with target extensions
        if (entry.isFile() && config.fileExtensions.includes(path.extname(entry.name))) {
            processSourceFile(fullPath);
        }
    }
}

/**
 * Main function
 */
function main() {
    console.log('Creating missing test folders and files...');

    // Process each source root
    for (const sourceRoot of config.sourceRoots) {
        if (fs.existsSync(sourceRoot)) {
            scanDirectory(sourceRoot);
        } else {
            console.warn(`Source root ${sourceRoot} does not exist.`);
        }
    }

    // Print stats
    console.log('\nTest structure creation completed!');
    console.log(`Found ${stats.foundSourceFiles} source files`);
    console.log(`${stats.existingTestFiles} already have test files`);
    console.log(`Created ${stats.createdTestFolders} test folders`);
    console.log(`Created ${stats.createdTestFiles} test files`);
}

// Run the script
main();
