import * as vscode from 'vscode';
import * as sinon from 'sinon';
import * as assert from 'assert';
import { BestPracticesChecker } from '../../../../src/services/codeQuality/bestPracticesChecker';
import { createMockDocument, createMockExtensionContext, createMockOutputChannel } from '../../../helpers/mockHelpers';

describe('BestPracticesChecker Tests', () => {
    let checker: BestPracticesChecker;
    let sandbox: sinon.SinonSandbox;
    let outputChannel: vscode.OutputChannel;
    let mockContext: vscode.ExtensionContext;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
        outputChannel = createMockOutputChannel();
        mockContext = createMockExtensionContext();
        checker = new BestPracticesChecker(outputChannel, mockContext);
    });

    afterEach(() => {
        sandbox.restore();
    });

    test('checkCodeStyle should detect var usage', async () => {
        const document = createMockDocument(`
            function test() {
                var x = 1;
                return x * 2;
            }
        `);

        const issues = await checker.checkCodeStyle(document);
        
        assert.ok(issues.some(i => i.message.includes('var')));
        assert.ok(issues.some(i => i.type === 'convention'));
    });
});