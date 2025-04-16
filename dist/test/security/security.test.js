"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const assert = __importStar(require("assert"));
const vscode = __importStar(require("vscode"));
const agent_1 = require("../../agent/agent");
const securityScanner_1 = require("./securityScanner");
suite('Security Test Suite', () => {
    let agent;
    let scanner;
    suiteSetup(() => {
        agent = new agent_1.Agent();
        scanner = new securityScanner_1.SecurityScanner();
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
//# sourceMappingURL=security.test.js.map