import * as vscode from 'vscode';
import { SecuritySeverity } from '../../../security/types';
import { SecurityAnalyzer } from '../../../services/codeQuality/analyzers/SecurityAnalyzer';

describe('SecurityAnalyzer', () => {
    let analyzer: SecurityAnalyzer;

    beforeEach(() => {
        analyzer = new SecurityAnalyzer();
    });

    describe('analyzeDocument', () => {
        it('should detect eval usage in JavaScript', async () => {
            const document = createMockDocument(
                'javascript',
                'function riskyCode() { eval(userInput); }'
            );

            const result = await analyzer.analyzeDocument(document);

            expect(result.issues.length).toBe(1);
            expect(result.issues[0].id).toBe('SEC001');
            expect(result.issues[0].severity).toBe(SecuritySeverity.High);
        });

        it('should detect hardcoded secrets', async () => {
            const document = createMockDocument(
                'typescript',
                'const password = "supersecret123";\nconst apiKey = "abc123";'
            );

            const result = await analyzer.analyzeDocument(document);

            expect(result.issues.length).toBe(2);
            expect(result.issues[0].id).toBe('SEC002');
            expect(result.issues[0].severity).toBe(SecuritySeverity.Critical);
        });

        it('should detect XSS vulnerabilities', async () => {
            const document = createMockDocument(
                'javascript',
                'element.innerHTML = userInput;'
            );

            const result = await analyzer.analyzeDocument(document);

            expect(result.issues.length).toBe(1);
            expect(result.issues[0].id).toBe('SEC003');
            expect(result.issues[0].severity).toBe(SecuritySeverity.Medium);
        });

        it('should detect Python security issues', async () => {
            const document = createMockDocument(
                'python',
                'subprocess.call(cmd, shell=True)\npickle.loads(data)'
            );

            const result = await analyzer.analyzeDocument(document);

            expect(result.issues.length).toBe(2);
            expect(result.issues.some(i => i.id === 'SEC004')).toBe(true);
            expect(result.issues.some(i => i.id === 'SEC005')).toBe(true);
        });

        it('should detect Java security issues', async () => {
            const document = createMockDocument(
                'java',
                'Statement stmt = conn.createStatement();\nString query = "SELECT * FROM users WHERE id = " + userId;\nResultSet rs = stmt.executeQuery(query);'
            );

            const result = await analyzer.analyzeDocument(document);

            expect(result.issues.length).toBe(1);
            expect(result.issues[0].id).toBe('SEC006');
            expect(result.issues[0].severity).toBe(SecuritySeverity.Critical);
        });

        it('should create appropriate diagnostics', async () => {
            const document = createMockDocument(
                'javascript',
                'eval(userInput);'
            );

            const result = await analyzer.analyzeDocument(document);

            expect(result.diagnostics.length).toBe(1);
            expect(result.diagnostics[0].severity).toBe(vscode.DiagnosticSeverity.Error);
            expect(result.diagnostics[0].source).toBe('security');
        });
    });
});

function createMockDocument(languageId: string, content: string): vscode.TextDocument {
    return {
        languageId,
        getText: () => content,
        uri: { fsPath: 'test.ts' } as vscode.Uri,
        positionAt: (offset: number) => new vscode.Position(0, offset),
        lineAt: (line: number) => ({ text: content.split('\n')[line] } as vscode.TextLine),
    } as vscode.TextDocument;
}
