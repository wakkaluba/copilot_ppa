#!/usr/bin/env node

const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

/**
 * Simple test runner for the project
 */
class TestRunner {
    constructor() {
        this.rootDir = path.resolve(__dirname, '../');
        this.failedTests = [];
    }

    /**
     * Runs the specified test file or all tests
     * @param {string|null} testFile Path to a specific test file to run, or null to run all tests
     */
    async runTests(testFile = null) {
        console.log('Starting test run...');
        
        const testCommand = testFile 
            ? `npx jest ${testFile} --colors`
            : 'npx jest --colors';
        
        try {
            console.log(`Running command: ${testCommand}`);
            await this.execCommand(testCommand);
            console.log('\n✅ All tests passed!');
            return true;
        } catch (error) {
            console.error('\n❌ Tests failed:', error.message);
            return false;
        }
    }

    /**
     * Runs a specific test by name pattern
     * @param {string} pattern Test name pattern to match
     */
    async runTestsByName(pattern) {
        console.log(`Running tests matching: "${pattern}"`);
        
        try {
            await this.execCommand(`npx jest --testNamePattern="${pattern}" --colors`);
            console.log('\n✅ All matching tests passed!');
            return true;
        } catch (error) {
            console.error('\n❌ Tests failed:', error.message);
            return false;
        }
    }

    /**
     * Executes a shell command
     * @param {string} command Command to execute
     * @returns {Promise<string>} Command output
     */
    execCommand(command) {
        return new Promise((resolve, reject) => {
            const proc = exec(command, {
                cwd: this.rootDir
            });

            let output = '';
            
            proc.stdout.on('data', (data) => {
                process.stdout.write(data);
                output += data;
            });

            proc.stderr.on('data', (data) => {
                process.stderr.write(data);
                output += data;
            });

            proc.on('close', (code) => {
                if (code === 0) {
                    resolve(output);
                } else {
                    reject(new Error(`Command failed with exit code ${code}`));
                }
            });
        });
    }
}

/**
 * Main entry point
 */
async function main() {
    const runner = new TestRunner();
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        // Run all tests
        await runner.runTests();
    } else if (args[0] === '--name' && args[1]) {
        // Run tests by name pattern
        await runner.runTestsByName(args[1]);
    } else {
        // Run specific test file
        await runner.runTests(args[0]);
    }
}

main().catch(error => {
    console.error('Error running tests:', error);
    process.exit(1);
});