import * as assert from 'assert';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import { UserInteractionService } from '../../../../../src/buildTools/optimization/services/UserInteractionService';

suite('UserInteractionService Tests', () => {
    let service;
    let sandbox;
    let showInformationMessageStub;
    let showWarningMessageStub;
    let showErrorMessageStub;
    let showQuickPickStub;
    let showInputBoxStub;

    setup(() => {
        sandbox = sinon.createSandbox();

        // Stub VS Code UI methods
        showInformationMessageStub = sandbox.stub(vscode.window, 'showInformationMessage');
        showWarningMessageStub = sandbox.stub(vscode.window, 'showWarningMessage');
        showErrorMessageStub = sandbox.stub(vscode.window, 'showErrorMessage');
        showQuickPickStub = sandbox.stub(vscode.window, 'showQuickPick');
        showInputBoxStub = sandbox.stub(vscode.window, 'showInputBox');

        // Set up default return values
        showInformationMessageStub.resolves('OK');
        showWarningMessageStub.resolves('OK');
        showErrorMessageStub.resolves('OK');
        showQuickPickStub.resolves('Option 1');
        showInputBoxStub.resolves('User input');

        // Create service instance
        service = new UserInteractionService();
    });

    teardown(() => {
        sandbox.restore();
    });

    test('should show information messages', async () => {
        await service.showInformation('Test information message');

        assert.ok(showInformationMessageStub.calledOnce);
        assert.ok(showInformationMessageStub.calledWith('Test information message'));
    });

    test('should show warning messages', async () => {
        await service.showWarning('Test warning message');

        assert.ok(showWarningMessageStub.calledOnce);
        assert.ok(showWarningMessageStub.calledWith('Test warning message'));
    });

    test('should show error messages', async () => {
        await service.showError('Test error message');

        assert.ok(showErrorMessageStub.calledOnce);
        assert.ok(showErrorMessageStub.calledWith('Test error message'));
    });

    test('should show information messages with options and return selection', async () => {
        showInformationMessageStub.resolves('Yes');

        const result = await service.showInformationWithOptions('Make changes?', ['Yes', 'No', 'Cancel']);

        assert.strictEqual(result, 'Yes');
        assert.ok(showInformationMessageStub.calledOnce);
        assert.ok(showInformationMessageStub.calledWith('Make changes?', 'Yes', 'No', 'Cancel'));
    });

    test('should show quick pick options', async () => {
        const options = ['Option 1', 'Option 2', 'Option 3'];
        showQuickPickStub.resolves('Option 2');

        const result = await service.showQuickPick('Select an option:', options);

        assert.strictEqual(result, 'Option 2');
        assert.ok(showQuickPickStub.calledOnce);
        const callArgs = showQuickPickStub.getCall(0).args;
        assert.deepStrictEqual(callArgs[0], options);
        assert.strictEqual(callArgs[1].placeHolder, 'Select an option:');
    });

    test('should show quick pick options with custom properties', async () => {
        const options = [
            { label: 'Option 1', description: 'First option' },
            { label: 'Option 2', description: 'Second option' }
        ];
        showQuickPickStub.resolves(options[1]);

        const result = await service.showQuickPick('Select an option:', options);

        assert.strictEqual(result, options[1]);
        assert.ok(showQuickPickStub.calledOnce);
    });

    test('should show input box', async () => {
        showInputBoxStub.resolves('User input text');

        const result = await service.showInputBox('Enter value:');

        assert.strictEqual(result, 'User input text');
        assert.ok(showInputBoxStub.calledOnce);
        assert.strictEqual(showInputBoxStub.getCall(0).args[0].prompt, 'Enter value:');
    });

    test('should handle canceled input box', async () => {
        showInputBoxStub.resolves(undefined);

        const result = await service.showInputBox('Enter value:');

        assert.strictEqual(result, undefined);
    });

    test('should handle confirmations with Yes/No options', async () => {
        showInformationMessageStub.resolves('Yes');

        const confirmed = await service.confirm('Proceed with changes?');

        assert.strictEqual(confirmed, true);
        assert.ok(showInformationMessageStub.calledWith('Proceed with changes?', 'Yes', 'No'));
    });

    test('should handle declined confirmations', async () => {
        showInformationMessageStub.resolves('No');

        const confirmed = await service.confirm('Proceed with changes?');

        assert.strictEqual(confirmed, false);
    });

    test('should handle canceled confirmations', async () => {
        showInformationMessageStub.resolves(undefined);

        const confirmed = await service.confirm('Proceed with changes?');

        assert.strictEqual(confirmed, false);
    });

    test('should show progress notification', async () => {
        const progressStub = {
            report: sinon.stub()
        };

        const withProgressStub = sandbox.stub(vscode.window, 'withProgress').callsFake(
            async (options, task) => {
                return task(progressStub);
            }
        );

        const taskMock = sinon.stub().resolves('Task result');

        const result = await service.withProgress('Processing...', taskMock);

        assert.strictEqual(result, 'Task result');
        assert.ok(withProgressStub.calledOnce);
        assert.ok(taskMock.calledOnce);
        assert.ok(taskMock.calledWith(progressStub));
    });

    test('should update progress in withProgress', async () => {
        const progressStub = {
            report: sinon.stub()
        };

        sandbox.stub(vscode.window, 'withProgress').callsFake(
            async (options, task) => {
                return task(progressStub);
            }
        );

        const taskMock = async (progress) => {
            progress.report({ message: 'Step 1', increment: 25 });
            progress.report({ message: 'Step 2', increment: 50 });
            return 'Done';
        };

        const result = await service.withProgress('Processing...', taskMock);

        assert.strictEqual(result, 'Done');
        assert.strictEqual(progressStub.report.callCount, 2);
        assert.deepStrictEqual(progressStub.report.getCall(0).args[0], { message: 'Step 1', increment: 25 });
        assert.deepStrictEqual(progressStub.report.getCall(1).args[0], { message: 'Step 2', increment: 50 });
    });
});
