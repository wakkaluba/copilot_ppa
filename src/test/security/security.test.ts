import * as assert from 'assert';
import * as vscode from 'vscode';
import { Agent } from '../../agent/agent';
import { SecurityScanner } from './securityScanner';

suite('Security Test Suite', () => {
    let agent: Agent;
    let scanner: SecurityScanner;

    suiteSetup(() => {
        agent = new Agent();
        scanner = new SecurityScanner();
    });

    test('Workspace Trust Check', async () => {
        const isTrusted = await vscode.workspace.isTrusted;
        assert.strictEqual(isTrusted, true, 'Workspace must be trusted');
    });

    test('File Permission Check', async () => {
        const result = await scanner.checkFilePermissions();
        assert.ok(result.success, 'File permissions should be properly set');
    });

    test('Data Encryption Test', async () => {
        const testData = 'sensitive data';
        const encrypted = await scanner.checkDataEncryption(testData);
        assert.ok(encrypted !== testData, 'Data should be encrypted');
    });

    test('API Security Check', async () => {
        const result = await scanner.checkAPIEndpoints();
        assert.ok(result.usesHTTPS, 'API endpoints should use HTTPS');
        assert.ok(result.hasAuthentication, 'API endpoints should require authentication');
    });

    test('Input Validation Test', async () => {
        const maliciousInput = '<script>alert("xss")</script>';
        const result = await scanner.validateInput(maliciousInput);
        assert.ok(!result.hasSecurityRisks, 'Should detect and prevent malicious input');
    });

    test('Resource Access Control', async () => {
        const result = await scanner.checkResourceAccess();
        assert.ok(result.hasProperIsolation, 'Resources should be properly isolated');
    });
});
