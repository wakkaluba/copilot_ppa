const { expect } = require('chai');
const sinon = require('sinon');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

describe('improve-code-coverage.js', () => {
    let sandbox;

    beforeEach(() => {
        sandbox = sinon.createSandbox();

        // Mock filesystem operations
        sandbox.stub(fs, 'existsSync').returns(true);
        sandbox.stub(fs, 'readFileSync');
        sandbox.stub(fs, 'writeFileSync');
        sandbox.stub(fs, 'mkdirSync');

        // Mock execSync
        sandbox.stub(require('child_process'), 'execSync');

        // Mock path operations
        sandbox.stub(path, 'resolve').returns('/mocked/path');
        sandbox.stub(path, 'join').callsFake((...args) => args.join('/'));
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('runTestsWithCoverage()', () => {
        it('should execute tests with coverage enabled', () => {
            execSync.returns(JSON.stringify({
                total: {
                    lines: { pct: 85.5 },
                    statements: { pct: 84.2 },
                    functions: { pct: 90.1 },
                    branches: { pct: 75.3 }
                }
            }));

            const coverage = runTestsWithCoverage();
            expect(coverage).to.deep.equal({
                lines: 85.5,
                statements: 84.2,
                functions: 90.1,
                branches: 75.3,
                success: true
            });
            expect(execSync).to.have.been.calledWith('npm run test:coverage');
        });

        it('should handle test failures gracefully', () => {
            execSync.throws(new Error('Test execution failed'));

            const coverage = runTestsWithCoverage();
            expect(coverage).to.deep.equal({
                lines: 0,
                statements: 0,
                functions: 0,
                branches: 0,
                success: false,
                error: 'Test execution failed'
            });
        });
    });

    describe('analyzeTestCases()', () => {
        it('should analyze test coverage correctly', () => {
            execSync.withArgs('git ls-files "**/*.test.js"')
                .returns('test/file1.test.js\ntest/file2.test.js');

            const testFiles = ['src/file1.js', 'src/file2.js'];
            const result = analyzeTestCases(testFiles);

            expect(result).to.have.property('coverage', 100); // All files have tests
            expect(result.files).to.have.lengthOf(2);
            expect(result.missingTests).to.be.an('array').that.is.empty;
            expect(result.recommendations).to.be.an('array');
        });

        it('should identify missing test files', () => {
            execSync.withArgs('git ls-files "**/*.test.js"').returns('');

            const testFiles = ['src/file1.js', 'src/file2.js'];
            const result = analyzeTestCases(testFiles);

            expect(result).to.have.property('coverage', 0); // No test files found
            expect(result.missingTests).to.have.lengthOf(2);
            expect(result.recommendations).to.be.an('array');
            expect(result.recommendations[0]).to.include('Create test files');
        });
    });

    describe('analyzeCodePerformance()', () => {
        it('should analyze code performance metrics', () => {
            const mockEslintOutput = JSON.stringify([
                {
                    filePath: 'src/file1.js',
                    messages: [{ ruleId: 'complexity', severity: 2 }]
                }
            ]);
            execSync.returns(mockEslintOutput);

            const result = analyzeCodePerformance();
            expect(result).to.have.property('complexityScore');
            expect(result.issues).to.be.an('array').with.lengthOf(1);
            expect(result.recommendations).to.be.an('array');
            expect(result.issues[0]).to.have.property('file', 'src/file1.js');
        });

        it('should handle missing ESLint config gracefully', () => {
            fs.existsSync.withArgs('/mocked/path/.eslintrc.js').returns(false);
            fs.existsSync.withArgs('/mocked/path/.eslintrc.json').returns(false);

            const result = analyzeCodePerformance();
            expect(result).to.have.property('complexityScore', 0);
            expect(result.issues).to.be.an('array').that.is.empty;
            expect(result.recommendations).to.include('Add ESLint configuration');
        });
    });

    describe('analyzeCodeComprehensibility()', () => {
        it('should calculate documentation ratio', () => {
            execSync.withArgs(sinon.match(/grep -r/)).returns('100');
            execSync.withArgs(sinon.match(/git ls-files/)).returns('50');

            const result = analyzeCodeComprehensibility();
            expect(result).to.have.property('documentationRatio', 2); // 100/50
            expect(result).to.have.property('score').that.is.above(0);
            expect(result.recommendations).to.be.an('array');
            expect(result.recommendations[0]).to.include('documentation ratio');
        });

        it('should handle files without documentation', () => {
            execSync.withArgs(sinon.match(/grep -r/)).returns('0');
            execSync.withArgs(sinon.match(/git ls-files/)).returns('50');

            const result = analyzeCodeComprehensibility();
            expect(result).to.have.property('documentationRatio', 0);
            expect(result).to.have.property('score', 0);
            expect(result.recommendations[0]).to.include('Add documentation');
        });
    });

    describe('main()', () => {
        it('should generate comprehensive coverage report', () => {
            // Mock test coverage data
            execSync.withArgs('npm run test:coverage').returns(
                JSON.stringify({
                    total: {
                        lines: { pct: 85 },
                        statements: { pct: 84 },
                        functions: { pct: 90 },
                        branches: { pct: 75 }
                    }
                })
            );

            // Mock test files data
            execSync.withArgs(sinon.match(/git ls-files/))
                .returns('test/file1.test.js\ntest/file2.test.js');

            const result = main();
            expect(result).to.have.property('success', true);
            expect(result).to.have.property('coverageReport');
            expect(result).to.have.property('testAnalysis');
            expect(result).to.have.property('performanceAnalysis');
            expect(result).to.have.property('comprehensibilityAnalysis');
            expect(result.recommendations).to.be.an('array');
            expect(fs.writeFileSync).to.have.been.calledWith(
                'coverage-improvement-report.md',
                sinon.match.string
            );
        });

        it('should handle analysis failures gracefully', () => {
            execSync.withArgs('npm run test:coverage')
                .throws(new Error('Test execution failed'));

            const result = main();
            expect(result).to.have.property('success', false);
            expect(result).to.have.property('error');
            expect(result.error.message).to.include('Test execution failed');
        });
    });
});
