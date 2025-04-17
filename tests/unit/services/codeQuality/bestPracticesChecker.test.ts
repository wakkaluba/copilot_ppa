import * as vscode from 'vscode';
import * as sinon from 'sinon';
import { strict as assert } from 'assert';
import { BestPracticesChecker } from '../../../../src/services/codeQuality/bestPracticesChecker';
import { createMockDocument, createMockExtensionContext, createMockOutputChannel } from '../../../helpers/mockHelpers';

suite('BestPracticesChecker Tests', () => {
    let checker: BestPracticesChecker;
    let sandbox: sinon.SinonSandbox;
    let outputChannel: vscode.OutputChannel;
    let context: vscode.ExtensionContext;

    setup(() => {
        sandbox = sinon.createSandbox();
        outputChannel = createMockOutputChannel();
        context = createMockExtensionContext();
        
        sandbox.stub(vscode.window, 'createOutputChannel').returns(outputChannel);
        checker = new BestPracticesChecker(context);
    });

    teardown(() => {
        sandbox.restore();
    });

    test('checkCodeStyle should detect var usage', async () => {
        const document = createMockDocument(`
            function test() {
                var x = 1;
                return x;
            }
        `);

        const issues = await checker.checkCodeStyle(document);
        
        assert.ok(issues.some(i => i.message.includes('var')));
        assert.ok(issues.some(i => i.type === 'convention'));
    });

    test('checkCodeStyle should detect console.log usage', async () => {
        const document = createMockDocument(`
            function debug() {
                console.log('debugging');
                console.error('error');
            }
        `);

        const issues = await checker.checkCodeStyle(document);
        
        assert.ok(issues.some(i => i.message.includes('console.log')));
        assert.ok(issues.some(i => i.type === 'debugging'));
    });

    test('checkTypes should detect missing type annotations', async () => {
        const document = createMockDocument(`
            function add(a, b) {
                return a + b;
            }
        `);

        const issues = await checker.checkTypes(document);
        
        assert.ok(issues.some(i => i.message.includes('type annotation')));
        assert.ok(issues.some(i => i.type === 'typing'));
    });

    test('checkVariables should detect magic numbers', async () => {
        const document = createMockDocument(`
            function calculateDiscount(price) {
                return price * 0.15;
            }
        `);

        const issues = await checker.checkVariables(document);
        
        assert.ok(issues.some(i => i.message.includes('magic number')));
        assert.ok(issues.some(i => i.type === 'maintainability'));
    });

    test('checkFunctionLength should detect long functions', async () => {
        const document = createMockDocument(`
            function processData() {
                let result = 0;
                // ... 30 lines of code ...
                for (let i = 0; i < 10; i++) {
                    for (let j = 0; j < 10; j++) {
                        result += i * j;
                    }
                }
                // ... more lines of code ...
                return result;
            }
        `);

        const issues = await checker.checkFunctionLength(document);
        
        assert.ok(issues.some(i => i.message.includes('function length')));
        assert.ok(issues.some(i => i.type === 'complexity'));
    });

    test('checkSingleResponsibility should detect multiple responsibility functions', async () => {
        const document = createMockDocument(`
            function processAndValidateAndSaveData(data) {
                // Validation
                if (!data.id) throw new Error('No ID');
                
                // Processing
                const processed = transform(data);
                
                // Saving
                saveToDatabase(processed);
                
                return processed;
            }
        `);

        const issues = await checker.checkSingleResponsibility(document);
        
        assert.ok(issues.some(i => i.message.includes('single responsibility')));
        assert.ok(issues.some(i => i.type === 'design'));
    });

    test('checkNaming should detect inconsistent naming conventions', async () => {
        const document = createMockDocument(`
            class userManager {
                GetUser(userId) {
                    return this._fetch_user_data(userId);
                }
                
                _fetch_user_data(id) {
                    return { id };
                }
            }
        `);

        const issues = await checker.checkNaming(document);
        
        assert.ok(issues.some(i => i.message.includes('naming convention')));
        assert.ok(issues.some(i => i.type === 'convention'));
    });

    test('checkDocumentation should check documentation completeness', async () => {
        const document = createMockDocument(`
            class UserService {
                processUserData(data) {
                    if (!this.validateData(data)) {
                        throw new Error('Invalid data');
                    }
                    return this.transformData(data);
                }
            }
        `);

        const issues = await checker.checkDocumentation(document);
        
        assert.ok(issues.some(i => i.message.includes('documentation')));
        assert.ok(issues.some(i => i.type === 'documentation'));
    });

    test('checkErrorHandling should detect missing error handling', async () => {
        const document = createMockDocument(`
            async function fetchData() {
                const response = await fetch('api/data');
                const data = await response.json();
                return data;
            }
        `);

        const issues = await checker.checkErrorHandling(document);
        
        assert.ok(issues.some(i => i.message.includes('error handling')));
        assert.ok(issues.some(i => i.type === 'reliability'));
    });

    test('checkAll should run all checks', async () => {
        const document = createMockDocument(`
            function problematicFunction() {
                var result = 0;
                console.log('debug');
                return result * 0.15;
            }
        `);

        const issues = await checker.checkAll(document);
        
        assert.ok(issues.some(i => i.type === 'convention'));
        assert.ok(issues.some(i => i.type === 'debugging'));
        assert.ok(issues.some(i => i.type === 'maintainability'));
    });
});