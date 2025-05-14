const { expect } = require('chai');
const sinon = require('sinon');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

describe('identify-unused-code.js', () => {
    let sandbox;

    beforeEach(() => {
        sandbox = sinon.createSandbox();

        // Mock filesystem operations
        sandbox.stub(fs, 'existsSync').returns(true);
        sandbox.stub(fs, 'readFileSync');
        sandbox.stub(fs, 'writeFileSync');

        // Mock execSync
        sandbox.stub(require('child_process'), 'execSync');

        // Mock glob module
        sandbox.stub(require('glob'), 'sync');
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('findCodeFiles()', () => {
        it('should find all relevant code files', () => {
            require('glob').sync.returns([
                'src/file1.js',
                'src/file2.ts',
                'src/nested/file3.tsx'
            ]);

            const files = findCodeFiles();
            expect(files).to.have.lengthOf(3);
            expect(files).to.include('src/file1.js');
            expect(files).to.include('src/file2.ts');
            expect(files).to.include('src/nested/file3.tsx');
            expect(require('glob').sync).to.have.been.calledWith('src/**/*.{js,ts,tsx}');
        });

        it('should exclude ignored directories', () => {
            require('glob').sync.returns([
                'src/file1.js',
                'node_modules/pkg/file.js',
                'dist/file2.js'
            ]);

            const files = findCodeFiles();
            expect(files).to.have.lengthOf(1);
            expect(files).to.include('src/file1.js');
            expect(files).to.not.include('node_modules/pkg/file.js');
            expect(files).to.not.include('dist/file2.js');
        });
    });

    describe('isFileReferenced()', () => {
        it('should detect file references', () => {
            execSync.returns('src/file2.js\nsrc/file3.js');

            const isReferenced = isFileReferenced('src/file1.js');
            expect(isReferenced).to.be.true;
            expect(execSync).to.have.been.calledWith(
                sinon.match(/git.*grep.*src\/file1\.js/)
            );
        });

        it('should handle files with no references', () => {
            execSync.throws(new Error('No matches found'));

            const isReferenced = isFileReferenced('src/unused.js');
            expect(isReferenced).to.be.false;
        });
    });

    describe('analyzeFileContent()', () => {
        it('should identify unused classes', () => {
            fs.readFileSync.returns(`
                export class TestClass {
                    method() {}
                }
            `);
            execSync.throws(new Error('No matches found'));

            const result = analyzeFileContent('src/test.js');
            expect(result.unusedClasses).to.have.lengthOf(1);
            expect(result.unusedClasses[0]).to.equal('TestClass');
        });

        it('should handle files without classes', () => {
            fs.readFileSync.returns('const foo = 42;');

            const result = analyzeFileContent('src/test.js');
            expect(result.unusedClasses).to.have.lengthOf(0);
            expect(result.hasContent).to.be.true;
        });

        it('should handle invalid file content', () => {
            fs.readFileSync.throws(new Error('File read error'));

            const result = analyzeFileContent('src/test.js');
            expect(result).to.deep.equal({
                hasContent: false,
                unusedClasses: [],
                error: 'File read error'
            });
        });
    });

    describe('generateReport()', () => {
        it('should generate report with orphaned files', () => {
            const orphanedFiles = ['src/unused1.js', 'src/unused2.ts'];
            const orphanedClasses = [
                { name: 'UnusedClass', file: 'src/file1.js' }
            ];

            const report = generateReport(orphanedFiles, orphanedClasses);
            expect(report).to.include('# Orphaned Code Report');
            expect(report).to.include('src/unused1.js');
            expect(report).to.include('src/unused2.ts');
            expect(report).to.include('UnusedClass');
            expect(report).to.include('src/file1.js');
            expect(fs.writeFileSync).to.have.been.calledWith(
                'orphaned-code-report.md',
                sinon.match.string
            );
        });

        it('should generate report with no orphaned items', () => {
            const orphanedFiles = [];
            const orphanedClasses = [];

            const report = generateReport(orphanedFiles, orphanedClasses);
            expect(report).to.include('# Orphaned Code Report');
            expect(report).to.include('No orphaned code found');
            expect(fs.writeFileSync).to.have.been.calledWith(
                'orphaned-code-report.md',
                sinon.match.string
            );
        });
    });

    describe('main()', () => {
        it('should analyze codebase completely', () => {
            require('glob').sync.returns(['src/file1.js', 'src/file2.ts']);
            fs.readFileSync.returns('export class TestClass {}');
            execSync.throws(new Error('No matches found'));

            const result = main();
            expect(result).to.have.property('success', true);
            expect(result).to.have.property('orphanedFilesCount');
            expect(result).to.have.property('orphanedClassesCount');
            expect(fs.writeFileSync).to.have.been.calledWith(
                'orphaned-code-report.md',
                sinon.match.string
            );
        });

        it('should handle errors gracefully', () => {
            require('glob').sync.throws(new Error('Glob error'));

            const result = main();
            expect(result).to.have.property('success', false);
            expect(result).to.have.property('error');
            expect(result.error.message).to.include('Glob error');
        });
    });
});
