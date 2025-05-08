const { assert } = require('chai');
const sinon = require('sinon');
const vscode = require('vscode');
const { CodeSecurityScanner } = require('../codeScanner');
const { SecurityRecommendations } = require('../securityRecommendations');

// Mock the RecommendationGenerator class
class MockRecommendationGenerator {
    constructor(codeScanner) {
        this.codeScanner = codeScanner;
    }

    async generateRecommendations() {
        return {
            issues: [
                {
                    id: 'VULN-001',
                    title: 'SQL Injection Vulnerability',
                    description: 'Potential SQL injection vulnerability detected',
                    severity: 'high',
                    cwe: 'CWE-89',
                    location: { file: 'test.js', line: 10, column: 5 },
                    recommendation: 'Use parameterized queries instead of string concatenation'
                },
                {
                    id: 'VULN-002',
                    title: 'Cross-site Scripting (XSS)',
                    description: 'Potential XSS vulnerability detected',
                    severity: 'medium',
                    cwe: 'CWE-79',
                    location: { file: 'test.js', line: 25, column: 12 },
                    recommendation: 'Sanitize user input before rendering to HTML'
                }
            ],
            scannedFiles: 5
        };
    }
}

// Mock the HtmlRenderer class
class MockHtmlRenderer {
    static showRecommendations(context, result) {
        // This is a static method that doesn't return anything
    }
}

describe('SecurityRecommendations.js', () => {
    let sandbox;
    let mockContext;
    let mockCodeScanner;
    let securityRecommendations;
    let generatorStub;
    let rendererStub;

    beforeEach(() => {
        sandbox = sinon.createSandbox();

        // Mock the extension context
        mockContext = {
            subscriptions: [],
            extensionPath: '/test/extension/path',
            extensionUri: vscode.Uri.file('/test/extension/path'),
            storageUri: vscode.Uri.file('/test/storage/path'),
            globalStorageUri: vscode.Uri.file('/test/global/storage/path'),
            logUri: vscode.Uri.file('/test/log/path'),
            extensionMode: vscode.ExtensionMode.Development,
            asAbsolutePath: (path) => `/test/extension/path/${path}`,
        };

        // Mock CodeSecurityScanner
        mockCodeScanner = sinon.createStubInstance(CodeSecurityScanner);

        // Mock the RecommendationGenerator
        generatorStub = sandbox.stub(MockRecommendationGenerator.prototype, 'generateRecommendations');
        generatorStub.resolves({
            issues: [
                {
                    id: 'VULN-001',
                    title: 'SQL Injection Vulnerability',
                    description: 'Potential SQL injection vulnerability detected',
                    severity: 'high',
                    cwe: 'CWE-89',
                    location: { file: 'test.js', line: 10, column: 5 },
                    recommendation: 'Use parameterized queries instead of string concatenation'
                },
                {
                    id: 'VULN-002',
                    title: 'Cross-site Scripting (XSS)',
                    description: 'Potential XSS vulnerability detected',
                    severity: 'medium',
                    cwe: 'CWE-79',
                    location: { file: 'test.js', line: 25, column: 12 },
                    recommendation: 'Sanitize user input before rendering to HTML'
                }
            ],
            scannedFiles: 5
        });

        // Mock HtmlRenderer
        rendererStub = sandbox.stub(MockHtmlRenderer, 'showRecommendations');

        // Mock the module imports
        const originalRequire = require;
        const mockedRequire = function(id) {
            if (id === './recommendations/RecommendationGenerator') {
                return { RecommendationGenerator: MockRecommendationGenerator };
            } else if (id === './recommendations/HtmlRenderer') {
                return { HtmlRenderer: MockHtmlRenderer };
            }
            return originalRequire(id);
        };

        // Replace the require function
        global.require = mockedRequire;

        // Create an instance of SecurityRecommendations
        securityRecommendations = new SecurityRecommendations(mockContext, mockCodeScanner);
    });

    afterEach(() => {
        sandbox.restore();
        // Restore the original require function
        global.require = require;
    });

    describe('generateRecommendations', () => {
        it('should generate security recommendations', async () => {
            const result = await securityRecommendations.generateRecommendations();

            assert.isTrue(generatorStub.calledOnce);
            assert.isObject(result);
            assert.isArray(result.issues);
            assert.equal(result.issues.length, 2);
            assert.equal(result.scannedFiles, 5);

            // Verify properties of the first issue
            const firstIssue = result.issues[0];
            assert.equal(firstIssue.id, 'VULN-001');
            assert.equal(firstIssue.title, 'SQL Injection Vulnerability');
            assert.equal(firstIssue.severity, 'high');
        });

        it('should handle errors when generating recommendations', async () => {
            const error = new Error('Failed to generate recommendations');
            generatorStub.rejects(error);

            try {
                await securityRecommendations.generateRecommendations();
                assert.fail('Should have thrown an error');
            } catch (e) {
                assert.equal(e, error);
            }
        });
    });

    describe('showRecommendations', () => {
        it('should show recommendations in a webview', async () => {
            const mockResult = {
                issues: [
                    {
                        id: 'VULN-001',
                        title: 'SQL Injection Vulnerability',
                        description: 'Potential SQL injection vulnerability detected',
                        severity: 'high',
                        cwe: 'CWE-89',
                        location: { file: 'test.js', line: 10, column: 5 },
                        recommendation: 'Use parameterized queries instead of string concatenation'
                    }
                ],
                scannedFiles: 1
            };

            await securityRecommendations.showRecommendations(mockResult);

            assert.isTrue(rendererStub.calledOnce);
            assert.isTrue(rendererStub.calledWith(mockContext, mockResult));
        });
    });
});
