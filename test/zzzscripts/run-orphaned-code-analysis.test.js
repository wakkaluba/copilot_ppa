const { expect } = require('chai');
const sinon = require('sinon');
const fs = require('fs');
const path = require('path');

// Import the functions we need to test
const {
    findOrphanedFiles,
    analyzeCodeUsage,
    validateOrphans,
    generateOrphanReport,
    analyzeDependencyChain
} = require('../../zzzscripts/run-orphaned-code-analysis');

describe('run-orphaned-code-analysis.js', () => {
    let sandbox;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
        sandbox.stub(fs, 'readFileSync');
        sandbox.stub(fs, 'writeFileSync');
        sandbox.stub(fs, 'existsSync').returns(true);
        sandbox.stub(require('glob'), 'sync');
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('findOrphanedFiles()', () => {
        it('should identify unreferenced files', () => {
            require('glob').sync.returns([
                'src/used.js',
                'src/orphaned.js'
            ]);

            const imports = {
                'src/used.js': ['src/index.js'],
                'src/orphaned.js': []
            };

            const result = findOrphanedFiles(imports);
            expect(result).to.have.lengthOf(1);
            expect(result[0]).to.equal('src/orphaned.js');
            expect(result).to.not.include('src/used.js');
        });

        it('should handle circular references', () => {
            require('glob').sync.returns([
                'src/a.js',
                'src/b.js'
            ]);

            const imports = {
                'src/a.js': ['src/b.js'],
                'src/b.js': ['src/a.js']
            };

            const result = findOrphanedFiles(imports);
            expect(result).to.have.lengthOf(2); // Both files are orphaned since they only reference each other
            expect(result).to.include('src/a.js');
            expect(result).to.include('src/b.js');
        });
    });

    describe('analyzeCodeUsage()', () => {
        it('should analyze import/export relationships', () => {
            fs.readFileSync.returns(`
                import { foo } from './module1';
                import { bar } from './module2';
                export { foo };
            `);

            const result = analyzeCodeUsage('src/test.js');
            expect(result.imports).to.deep.equal(['./module1', './module2']);
            expect(result.exports).to.deep.equal(['foo']);
            expect(result.reExports).to.deep.equal(['foo']);
            expect(result.localExports).to.be.an('array').that.is.empty;
        });

        it('should handle dynamic imports', () => {
            fs.readFileSync.returns(`
                const module = await import('./dynamic');
                import('./lazy').then(m => m.default());
            `);

            const result = analyzeCodeUsage('src/test.js');
            expect(result.dynamicImports).to.deep.equal(['./dynamic', './lazy']);
            expect(result.hasDynamicImports).to.be.true;
            expect(result.needsManualReview).to.be.true;
        });
    });

    describe('validateOrphans()', () => {
        it('should validate truly orphaned code', () => {
            const orphans = [{
                file: 'src/unused.js',
                exports: ['unused'],
                imports: []
            }];

            const validation = validateOrphans(orphans);
            expect(validation.confirmed).to.have.lengthOf(1);
            expect(validation.confirmed[0]).to.have.property('file', 'src/unused.js');
            expect(validation.needsReview).to.be.an('array').that.is.empty;
            expect(validation.safe).to.be.true;
        });

        it('should detect false positives', () => {
            const orphans = [{
                file: 'src/dynamically-loaded.js',
                exports: ['dynamic'],
                imports: []
            }];

            fs.readFileSync.returns(`
                const loadDynamic = () => import('./dynamically-loaded.js');
            `);

            const validation = validateOrphans(orphans);
            expect(validation.confirmed).to.be.an('array').that.is.empty;
            expect(validation.needsReview).to.have.lengthOf(1);
            expect(validation.needsReview[0].file).to.equal('src/dynamically-loaded.js');
            expect(validation.safe).to.be.false;
        });
    });

    describe('generateOrphanReport()', () => {
        it('should list orphaned files and exports', () => {
            const orphans = {
                files: ['src/unused.js'],
                exports: [{
                    file: 'src/partial.js',
                    symbols: ['unusedExport']
                }]
            };

            const report = generateOrphanReport(orphans);
            expect(report).to.include('# Orphaned Code Analysis Report');
            expect(report).to.include('src/unused.js');
            expect(report).to.include('src/partial.js');
            expect(report).to.include('unusedExport');
            expect(fs.writeFileSync).to.have.been.calledWith(
                'orphaned-code-report.md',
                sinon.match.string
            );
        });

        it('should provide cleanup recommendations', () => {
            const orphans = {
                files: ['src/unused.js'],
                exports: [],
                recommendations: [{
                    file: 'src/unused.js',
                    action: 'remove',
                    impact: 'none'
                }]
            };

            const report = generateOrphanReport(orphans);
            expect(report).to.include('## Cleanup Recommendations');
            expect(report).to.include('src/unused.js');
            expect(report).to.include('remove');
            expect(report).to.include('## Safety Measures');
            expect(report).to.include('Back up files');
        });
    });

    describe('analyzeDependencyChain()', () => {
        it('should analyze full dependency chain', () => {
            const mockDeps = {
                'src/index.js': ['src/a.js'],
                'src/a.js': ['src/b.js'],
                'src/b.js': [],
                'src/orphan.js': []
            };

            const result = analyzeDependencyChain('src/index.js', mockDeps);
            expect(result.chain).to.deep.equal(['src/index.js', 'src/a.js', 'src/b.js']);
            expect(result.orphans).to.deep.equal(['src/orphan.js']);
            expect(result.valid).to.be.true;
        });

        it('should handle broken dependency chains', () => {
            const mockDeps = {
                'src/index.js': ['src/missing.js'],
                'src/orphan.js': []
            };

            const result = analyzeDependencyChain('src/index.js', mockDeps);
            expect(result.chain).to.deep.equal(['src/index.js']);
            expect(result.broken).to.be.true;
            expect(result.missingDependencies).to.include('src/missing.js');
            expect(result.orphans).to.deep.equal(['src/orphan.js']);
        });
    });
});
