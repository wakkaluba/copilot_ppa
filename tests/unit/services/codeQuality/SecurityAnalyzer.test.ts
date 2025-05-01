import * as vscode from 'vscode';
import { SecuritySeverity } from '../../../../src/security/types';
import { SecurityAnalyzer } from '../../../../src/services/codeQuality/analyzers/SecurityAnalyzer';
import { Logger } from '../../../../src/utils/logger';

jest.mock('../../../../src/utils/logger');

describe('SecurityAnalyzer', () => {
    let analyzer: SecurityAnalyzer;

    beforeEach(() => {
        jest.spyOn(Logger, 'getInstance').mockReturnValue({
            debug: jest.fn(),
            info: jest.fn(),
            warn: jest.fn(),
            error: jest.fn()
        } as unknown as Logger);

        analyzer = new SecurityAnalyzer();
    });

    describe('analyzeDocument', () => {
        it('should detect eval usage', async () => {
            const document = createMockDocument(`
                function unsafeCode() {
                    eval("console.log('test')");
                }
            `);

            const result = await analyzer.analyzeDocument(document);

            expect(result.issues.length).toBeGreaterThan(0);
            expect(result.issues[0].severity).toBe(SecuritySeverity.High);
            expect(result.issues[0].description.toLowerCase()).toContain('eval');
        });

        it('should detect SQL injection risks', async () => {
            const document = createMockDocument(`
                function queryDatabase(userInput) {
                    const query = "SELECT * FROM users WHERE id = " + userInput;
                    return db.execute(query);
                }
            `);

            const result = await analyzer.analyzeDocument(document);

            expect(result.issues.length).toBeGreaterThan(0);
            expect(result.issues[0].severity).toBe(SecuritySeverity.High);
            expect(result.issues[0].description.toLowerCase()).toContain('sql injection');
        });

        it('should detect unsafe regular expressions', async () => {
            const document = createMockDocument(`
                function validateInput(input) {
                    const pattern = new RegExp(input);
                    return pattern.test("some string");
                }
            `);

            const result = await analyzer.analyzeDocument(document);

            expect(result.issues.length).toBeGreaterThan(0);
            expect(result.issues[0].severity).toBe(SecuritySeverity.Medium);
            expect(result.issues[0].description.toLowerCase()).toContain('regular expression');
        });

        it('should detect insecure crypto usage', async () => {
            const document = createMockDocument(`
                const crypto = require('crypto');
                function hashPassword(password) {
                    return crypto.createHash('md5').update(password).digest('hex');
                }
            `);

            const result = await analyzer.analyzeDocument(document);

            expect(result.issues.length).toBeGreaterThan(0);
            expect(result.issues[0].severity).toBe(SecuritySeverity.High);
            expect(result.issues[0].description.toLowerCase()).toContain('md5');
        });

        it('should detect potential XSS vulnerabilities', async () => {
            const document = createMockDocument(`
                function displayUserInput(input) {
                    document.innerHTML = input;
                }
            `);

            const result = await analyzer.analyzeDocument(document);

            expect(result.issues.length).toBeGreaterThan(0);
            expect(result.issues[0].severity).toBe(SecuritySeverity.High);
            expect(result.issues[0].description.toLowerCase()).toContain('xss');
        });

        it('should not flag secure code', async () => {
            const document = createMockDocument(`
                function secureFunction(input) {
                    const sanitizedInput = sanitizeHtml(input);
                    return sanitizedInput;
                }
            `);

            const result = await analyzer.analyzeDocument(document);

            expect(result.issues.length).toBe(0);
        });

        it('should create appropriate diagnostics', async () => {
            const document = createMockDocument(`
                eval("alert('test')");
            `);

            const result = await analyzer.analyzeDocument(document);

            expect(result.diagnostics.length).toBeGreaterThan(0);
            expect(result.diagnostics[0].severity).toBe(vscode.DiagnosticSeverity.Error);
            expect(result.diagnostics[0].source).toBe('security');
        });
    });
});

function createMockDocument(content: string): vscode.TextDocument {
    return {
        getText: () => content,
        uri: { fsPath: 'test.ts' } as vscode.Uri,
        languageId: 'typescript',
        positionAt: (offset: number) => new vscode.Position(0, offset),
        lineAt: (line: number) => ({ text: content.split('\n')[line] } as vscode.TextLine),
    } as vscode.TextDocument;
}
