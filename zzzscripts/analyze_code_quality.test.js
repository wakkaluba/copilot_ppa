const { expect } = require('chai');
const sinon = require('sinon');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Import the functions we need to test
const {
    getTypeScriptFiles,
    analyzeComplexity,
    detectDuplication,
    analyzeCommentsRatio,
    analyzeDependencies,
    estimateTechnicalDebt,
    generateHtmlReport,
    runAnalysis,
    config,
    fileCache,
    analysisCache
} = require('../../zzzscripts/analyze_code_quality');

describe('analyze_code_quality.js', () => {
    let sandbox;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
        // Clear caches
        fileCache.clear();
        analysisCache.clear();

        // Mock child_process.execSync
        sandbox.stub(require('child_process'), 'execSync');

        // Mock fs operations
        sandbox.stub(fs, 'writeFileSync');
        sandbox.stub(fs, 'readFileSync');
        sandbox.stub(fs, 'existsSync').returns(true);
        sandbox.stub(fs, 'mkdirSync');

        // Mock glob
        sandbox.stub(require('glob'), 'sync');
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('getTypeScriptFiles()', () => {
        it('should use cache when available', () => {
            const cachedFiles = ['src/file1.ts', 'src/file2.ts'];
            fileCache.set('typescript-files', cachedFiles);
            expect(getTypeScriptFiles()).to.deep.equal(cachedFiles);
        });

        it('should fetch files when cache is empty', () => {
            const files = ['src/file1.ts', 'src/file2.ts'];
            require('glob').sync.returns(files);
            expect(getTypeScriptFiles()).to.deep.equal(files);
            expect(fileCache.get('typescript-files')).to.deep.equal(files);
        });
    });

    describe('analyzeComplexity()', () => {
        it('should analyze code complexity correctly', () => {
            const files = ['src/file1.ts', 'src/file2.ts'];
            require('glob').sync.returns(files);

            const crOutput = JSON.stringify({
                functions: [
                    {
                        name: 'complexFunction',
                        line: 10,
                        complexity: { cyclomatic: 20, cognitive: 16 }
                    },
                    {
                        name: 'simpleFunction',
                        line: 30,
                        complexity: { cyclomatic: 5, cognitive: 3 }
                    }
                ],
                maintainability: 75
            });

            execSync.returns(crOutput);

            const result = analyzeComplexity();
            expect(result).to.have.property('averageComplexity', 12.5); // (20 + 5) / 2
            expect(result.complexFunctions).to.have.lengthOf(1);
            expect(result.cognitiveComplexity.highComplexityFunctions).to.have.lengthOf(1);
            expect(result.averageMaintainability).to.equal(75);
        });

        it('should handle errors gracefully', () => {
            const glob = require('glob');
            const originalSync = glob.sync;
            glob.sync = () => { throw new Error('Glob error'); };
            try {
                require('../zzzscripts/analyze_code_quality');
            } catch (err) {
                expect(err.message).to.match(/Glob error/);
            } finally {
                glob.sync = originalSync;
            }
        });
    });

    describe('detectDuplication()', () => {
        it('should detect code duplication', () => {
            const jscpdOutput = JSON.stringify({
                statistics: {
                    total: { percentage: 5.5 }
                },
                duplicates: [
                    {
                        source: { path: 'src/file1.ts', start: 1, end: 10 },
                        target: { path: 'src/file2.ts', start: 1, end: 10 },
                        fragment: 'const x = 42;'
                    }
                ]
            });

            execSync.returns(jscpdOutput);
            fs.readFileSync.returns(jscpdOutput);

            const result = detectDuplication();
            expect(result.percentage).to.equal(5.5);
            expect(result.duplicates).to.have.lengthOf(1);
            expect(result.duplicates[0]).to.have.property('sourceFile', 'src/file1.ts');
            expect(result.duplicates[0]).to.have.property('targetFile', 'src/file2.ts');
        });

        it('should handle errors gracefully', () => {
            execSync.throws(new Error('jscpd error'));
            const result = detectDuplication();
            expect(result).to.have.property('percentage', 0);
            expect(result.duplicates).to.be.an('array').that.is.empty;
            expect(result.hotspots).to.be.an('array').that.is.empty;
        });
    });

    describe('analyzeCommentsRatio()', () => {
        it('should calculate comments ratio correctly', () => {
            const files = ['src/file1.ts'];
            require('glob').sync.returns(files);
            fs.readFileSync.returns(`
                // Comment 1
                const x = 42;
                /* Comment 2 */
                const y = 84;
                /**
                 * Comment 3
                 */
                function foo() {}
            `);

            const result = analyzeCommentsRatio();
            expect(result).to.have.property('ratio');
            expect(result.ratio).to.be.a('number');
            expect(result.ratio).to.be.above(0);
            expect(result.commentLines).to.be.above(0);
            expect(result.fileResults).to.be.an('array').with.lengthOf(1);
            expect(result.fileResults[0]).to.have.property('file', 'src/file1.ts');
        });

        it('should handle files with no comments', () => {
            const files = ['src/file1.ts'];
            require('glob').sync.returns(files);
            fs.readFileSync.returns('const x = 42;\nconst y = 84;');

            const result = analyzeCommentsRatio();
            expect(result.ratio).to.equal(0);
            expect(result.commentLines).to.equal(0);
            expect(result.fileResults).to.be.an('array').with.lengthOf(1);
            expect(result.fileResults[0].commentRatio).to.equal(0);
        });
    });

    describe('analyzeDependencies()', () => {
        it('should analyze dependencies correctly', () => {
            const packageJson = {
                dependencies: { 'react': '17.0.2' },
                devDependencies: { 'typescript': '4.5.4' }
            };

            const npmOutput = {
                react: {
                    current: '17.0.2',
                    wanted: '17.0.2',
                    latest: '18.0.0'
                }
            };

            fs.readFileSync.returns(JSON.stringify(packageJson));
            execSync.returns(JSON.stringify(npmOutput));

            const result = analyzeDependencies();
            expect(result.total).to.equal(2); // react + typescript
            expect(result.outdated).to.equal(1); // react has a newer version
            expect(result.outdatedPackages).to.be.an('array').with.lengthOf(1);
            expect(result.outdatedPackages[0]).to.have.property('package', 'react');
        });

        it('should handle errors gracefully', () => {
            fs.readFileSync.throws(new Error('package.json error'));

            const result = analyzeDependencies();
            expect(result.total).to.equal(0);
            expect(result.outdated).to.equal(0);
            expect(result.outdatedPackages).to.be.an('array').that.is.empty;
            expect(result.packageVersions).to.be.an('array').that.is.empty;
        });
    });

    describe('estimateTechnicalDebt()', () => {
        it('should estimate technical debt correctly', () => {
            const metrics = {
                complexity: {
                    averageComplexity: 8,
                    complexFunctions: [
                        { file: 'src/file1.ts', function: 'complexFn', complexity: 20 }
                    ],
                    averageMaintainability: 70
                },
                duplication: {
                    percentage: 4.5,
                    duplicates: [
                        { sourceFile: 'src/file1.ts', targetFile: 'src/file2.ts' }
                    ]
                },
                commentsRatio: {
                    ratio: 2.5,
                    commentLines: 100,
                    codeLines: 400
                },
                dependencies: {
                    outdated: 2,
                    total: 10,
                    outdatedPackages: [
                        { package: 'react', current: '17.0.2', latest: '18.0.0' }
                    ]
                }
            };

            const result = estimateTechnicalDebt(metrics);
            expect(result).to.have.property('overall').that.is.a('number');
            expect(result).to.have.property('areas').that.is.an('object');
            expect(result.estimate).to.have.property('hoursToFix').that.is.a('number');
            expect(result.estimate).to.have.property('priority').that.is.a('string');
            expect(result.recommendations).to.be.an('array');
        });

        it('should handle missing metrics gracefully', () => {
            const metrics = {
                complexity: {},
                duplication: {},
                commentsRatio: {},
                dependencies: {}
            };

            const result = estimateTechnicalDebt(metrics);
            expect(result.overall).to.equal(0);
            expect(result.areas).to.be.an('object');
            expect(result.estimate.hoursToFix).to.equal(0);
            expect(result.estimate.priority).to.equal('LOW');
            expect(result.recommendations).to.be.an('array').that.is.empty;
        });
    });

    describe('generateHtmlReport()', () => {
        it('should generate correct HTML report', () => {
            const metrics = {
                complexity: {
                    averageComplexity: 8,
                    complexFunctions: [
                        { file: 'src/file1.ts', function: 'complexFn', complexity: 20 }
                    ],
                    averageMaintainability: 70,
                    cognitiveComplexity: {
                        average: 5,
                        highComplexityFunctions: []
                    }
                },
                duplication: {
                    percentage: 4.5,
                    duplicates: [
                        { sourceFile: 'src/file1.ts', targetFile: 'src/file2.ts', lines: 10 }
                    ]
                },
                commentsRatio: {
                    ratio: 2.5,
                    commentLines: 100,
                    codeLines: 400,
                    fileResults: [
                        { file: 'src/file1.ts', commentRatio: 2.5 }
                    ]
                },
                dependencies: {
                    outdated: 2,
                    total: 10,
                    outdatedPackages: [
                        { package: 'react', current: '17.0.2', latest: '18.0.0' }
                    ]
                },
                technicalDebt: {
                    overall: 75,
                    areas: {
                        complexity: 70,
                        duplication: 80,
                        documentation: 75,
                        dependencies: 80
                    },
                    estimate: { hoursToFix: 40, priority: 'MEDIUM' },
                    recommendations: [
                        'Refactor complex functions',
                        'Update outdated dependencies'
                    ]
                }
            };

            const result = generateHtmlReport(metrics);
            expect(result).to.be.a('string');
            expect(result).to.include('Code Quality Report');
            expect(result).to.include('Technical Debt');
            expect(result).to.include('Code Complexity');
            expect(result).to.include('40 hours');
            expect(result).to.include('MEDIUM');
        });
    });

    describe('runAnalysis()', () => {
        it('should run full analysis successfully', async () => {
            // Mock complexity analysis
            require('glob').sync.returns(['src/file1.ts']);
            execSync.returns(JSON.stringify({
                functions: [
                    { name: 'fn', line: 1, complexity: { cyclomatic: 5, cognitive: 3 } }
                ],
                maintainability: 75
            }));

            // Mock package.json for dependencies
            fs.readFileSync.returns(JSON.stringify({
                dependencies: {},
                devDependencies: {}
            }));

            await runAnalysis();

            // Verify report was written
            expect(fs.writeFileSync).to.have.been.calledTwice;
            const jsonReport = fs.writeFileSync.firstCall.args[1];
            const htmlReport = fs.writeFileSync.secondCall.args[1];

            expect(jsonReport).to.include('"complexity":');
            expect(jsonReport).to.include('"duplication":');
            expect(jsonReport).to.include('"commentsRatio":');
            expect(jsonReport).to.include('"dependencies":');
            expect(jsonReport).to.include('"technicalDebt":');

            expect(htmlReport).to.include('Code Quality Report');
            expect(htmlReport).to.include('Technical Debt Assessment');
        });

        it('should handle component failures gracefully', async () => {
            // Mock failures
            require('glob').sync.throws(new Error('Glob failed'));
            execSync.throws(new Error('Analysis failed'));
            fs.readFileSync.throws(new Error('Read failed'));

            await runAnalysis();

            // Verify error report was written
            expect(fs.writeFileSync).to.have.been.calledTwice;
            const jsonReport = fs.writeFileSync.firstCall.args[1];
            const htmlReport = fs.writeFileSync.secondCall.args[1];

            expect(jsonReport).to.include('"error":');
            expect(htmlReport).to.include('Analysis encountered some errors');
        });
    });
});
