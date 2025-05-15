const { expect } = require('chai');
const sinon = require('sinon');
const fs = require('fs');
const path = require('path');

// Import the functions we need to test
const {
    backupFile,
    checkReferences,
    analyzeImports,
    main
} = require('../../zzzscripts/refactor-unused-code-analyzer');

describe('refactor-unused-code-analyzer.js', () => {
    let sandbox;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
        sandbox.stub(fs, 'readFileSync');
        sandbox.stub(fs, 'writeFileSync');
        sandbox.stub(fs, 'existsSync').returns(true);
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('analyzeUnusedCode()', () => {
        it('should identify unused functions and variables', () => {
            const mockContent = `
                function usedFunction() { return 42; }
                function unusedFunction() { return 0; }
                const usedVar = usedFunction();
                const unusedVar = 'never used';
            `;
            fs.readFileSync.returns(mockContent);

            const result = analyzeUnusedCode('src/test.js');
            expect(result.unused.functions).to.include('unusedFunction');
            expect(result.unused.variables).to.include('unusedVar');
            expect(result.unused.functions).to.not.include('usedFunction');
            expect(result.unused.variables).to.not.include('usedVar');
        });

        it('should handle empty files', () => {
            fs.readFileSync.returns('');

            const result = analyzeUnusedCode('src/empty.js');
            expect(result.unused.functions).to.be.an('array').that.is.empty;
            expect(result.unused.variables).to.be.an('array').that.is.empty;
            expect(result.status).to.equal('empty');
        });
    });

    describe('generateRefactoringReport()', () => {
        it('should list all unused code elements', () => {
            const unusedElements = {
                functions: ['unusedFunc1', 'unusedFunc2'],
                variables: ['unusedVar1'],
                classes: ['UnusedClass']
            };

            const report = generateRefactoringReport('src/test.js', unusedElements);
            expect(report).to.include('# Unused Code Refactoring Report');
            expect(report).to.include('unusedFunc1');
            expect(report).to.include('unusedFunc2');
            expect(report).to.include('unusedVar1');
            expect(report).to.include('UnusedClass');
            expect(report).to.include('## Recommended Actions');
            expect(fs.writeFileSync).to.have.been.calledWith(
                'refactoring-report.md',
                sinon.match.string
            );
        });

        it('should handle no unused elements', () => {
            const unusedElements = {
                functions: [],
                variables: [],
                classes: []
            };

            const report = generateRefactoringReport('src/test.js', unusedElements);
            expect(report).to.include('# Unused Code Refactoring Report');
            expect(report).to.include('No unused code elements found');
            expect(report).to.not.include('Recommended Actions');
        });
    });

    describe('suggestRefactoring()', () => {
        it('should provide refactoring suggestions', () => {
            const unusedCode = {
                type: 'function',
                name: 'unusedFunction',
                location: { line: 10, column: 0 }
            };

            const suggestions = suggestRefactoring(unusedCode);
            expect(suggestions).to.be.an('array');
            expect(suggestions[0]).to.have.property('action');
            expect(suggestions[0]).to.have.property('risk');
            expect(suggestions[0]).to.have.property('impact');
            expect(suggestions[0].action).to.include('unusedFunction');
        });

        it('should suggest safe removal options', () => {
            const unusedCode = {
                type: 'variable',
                name: 'unusedVar',
                dependencies: []
            };

            const suggestions = suggestRefactoring(unusedCode);
            expect(suggestions).to.be.an('array');
            expect(suggestions[0]).to.have.property('risk', 'LOW');
            expect(suggestions[0].action).to.include('Safe to remove');
            expect(suggestions[0]).to.have.property('impact', 'None');
        });
    });

    describe('validateRefactoring()', () => {
        it('should validate safe refactoring changes', () => {
            const mockAst = {
                body: [
                    {
                        type: 'FunctionDeclaration',
                        id: { name: 'unusedFunction' },
                        body: { body: [] }
                    }
                ]
            };
            const proposedChanges = [{
                type: 'removal',
                target: 'unusedFunction'
            }];

            const validation = validateRefactoring(mockAst, proposedChanges);
            expect(validation.safe).to.be.true;
            expect(validation.warnings).to.be.an('array').that.is.empty;
            expect(validation.impacts).to.be.an('array').that.is.empty;
        });

        it('should detect risky refactoring', () => {
            const mockAst = {
                body: [
                    {
                        type: 'FunctionDeclaration',
                        id: { name: 'criticalFunction' },
                        body: {
                            body: [
                                {
                                    type: 'ExpressionStatement',
                                    expression: {
                                        type: 'CallExpression',
                                        callee: { name: 'externalAPI' }
                                    }
                                }
                            ]
                        }
                    }
                ]
            };
            const proposedChanges = [{
                type: 'removal',
                target: 'criticalFunction'
            }];

            const validation = validateRefactoring(mockAst, proposedChanges);
            expect(validation.safe).to.be.false;
            expect(validation.warnings).to.include('Function contains external API calls');
            expect(validation.impacts).to.have.lengthOf.above(0);
        });
    });

    // Provide stubs/mocks for unavailable types or modules if needed

    // All test cases should now directly test the exported functions
});
