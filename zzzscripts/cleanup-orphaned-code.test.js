const { expect } = require('chai');
const sinon = require('sinon');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Import the functions we need to test
const {
    parseOrphanedReport,
    backupFile,
    processOrphanedFiles,
    main
} = require('../../zzzscripts/cleanup-orphaned-code');

describe('cleanup-orphaned-code.js', () => {
    let sandbox;

    beforeEach(() => {
        sandbox = sinon.createSandbox();

        // Mock filesystem operations
        sandbox.stub(fs, 'existsSync').returns(true);
        sandbox.stub(fs, 'readFileSync');
        sandbox.stub(fs, 'writeFileSync');
        sandbox.stub(fs, 'unlinkSync');
        sandbox.stub(fs, 'copyFileSync');
        sandbox.stub(fs, 'mkdirSync');

        // Mock execSync
        sandbox.stub(require('child_process'), 'execSync');
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('parseOrphanedReport()', () => {
        it('should parse report correctly', () => {
            const mockReport = `# Orphaned Code Report

## Orphaned Files
- file1.js
- file2.ts

## Orphaned Classes
- Class1 in file1.js
- Class2 in file2.ts`;

            fs.readFileSync.returns(mockReport);

            const result = parseOrphanedReport('report.md');
            expect(result).to.deep.equal({
                files: ['file1.js', 'file2.ts'],
                classes: [
                    { name: 'Class1', file: 'file1.js' },
                    { name: 'Class2', file: 'file2.ts' }
                ]
            });
        });

        it('should handle empty report gracefully', () => {
            fs.readFileSync.returns('# Orphaned Code Report\n\nNo orphaned code found.');

            const result = parseOrphanedReport('report.md');
            expect(result).to.deep.equal({
                files: [],
                classes: []
            });
        });

        it('should handle missing file gracefully', () => {
            const result = require('../zzzscripts/cleanup-orphaned-code').parseOrphanedReport('missing.json');
            expect(result).to.deep.equal({
                files: [],
                classes: [],
                error: 'Report file not found'
            });
        });
    });

    describe('processOrphanedFiles()', () => {
        it('should backup files before removal', () => {
            const mockFiles = ['src/file1.js', 'src/file2.ts'];

            processOrphanedFiles(mockFiles);

            // Verify backup directory was created
            expect(fs.mkdirSync).to.have.been.calledWith(sinon.match(/backup-\d+/), { recursive: true });

            // Verify each file was backed up and removed
            mockFiles.forEach(file => {
                const backupPath = sinon.match(/backup-\d+/);
                expect(fs.copyFileSync).to.have.been.calledWith(file, sinon.match(backupPath));
                expect(fs.unlinkSync).to.have.been.calledWith(file);
            });
        });

        it('should skip missing files', () => {
            const mockFiles = ['src/missing.js'];
            fs.existsSync.returns(false);

            processOrphanedFiles(mockFiles);

            // Verify no backup or remove operations were attempted
            expect(fs.copyFileSync).to.not.have.been.called;
            expect(fs.unlinkSync).to.not.have.been.called;
        });

        it('should handle backup failures gracefully', () => {
            const mockFiles = ['src/file1.js'];
            fs.copyFileSync.throws(new Error('Backup failed'));

            const result = processOrphanedFiles(mockFiles);
            expect(result).to.deep.equal({
                processedFiles: [],
                skippedFiles: ['src/file1.js'],
                errors: [
                    {
                        file: 'src/file1.js',
                        error: 'Backup failed'
                    }
                ]
            });

            // Verify file was not removed since backup failed
            expect(fs.unlinkSync).to.not.have.been.called;
        });
    });

    describe('main()', () => {
        it('should process report and files successfully', () => {
            const mockReport = `# Orphaned Code Report\n\n## Orphaned Files\n- file1.js\n- file2.ts`;
            fs.readFileSync.returns(mockReport);

            const result = main();
            expect(result).to.have.property('success', true);
            expect(result.processedFiles).to.have.lengthOf(2);
            expect(fs.copyFileSync).to.have.been.calledTwice;
            expect(fs.unlinkSync).to.have.been.calledTwice;
        });

        it('should handle empty report gracefully', () => {
            fs.readFileSync.returns('# Orphaned Code Report\n\nNo orphaned code found.');

            const result = main();
            expect(result).to.have.property('success', true);
            expect(result.processedFiles).to.have.lengthOf(0);
            expect(fs.copyFileSync).to.not.have.been.called;
            expect(fs.unlinkSync).to.not.have.been.called;
        });

        it('should handle file operation errors gracefully', () => {
            fs.readFileSync.throws(new Error('File read error'));

            const result = main();
            expect(result).to.have.property('success', false);
            expect(result).to.have.property('error');
            expect(result.error.message).to.include('File read error');
            expect(fs.copyFileSync).to.not.have.been.called;
            expect(fs.unlinkSync).to.not.have.been.called;
        });
    });
});
