import * as vscode from 'vscode';
import * as sinon from 'sinon';
import * as assert from 'assert';
import { NotificationService } from '../../../src/services/notificationService';

suite('NotificationService Tests', () => {
    let notificationService: NotificationService;
    let sandbox: sinon.SinonSandbox;
    let showInformationMessageStub: sinon.SinonStub;
    let showWarningMessageStub: sinon.SinonStub;
    let showErrorMessageStub: sinon.SinonStub;
    let withProgressStub: sinon.SinonStub;

    setup(() => {
        sandbox = sinon.createSandbox();
        
        // Stub VS Code window notification methods
        showInformationMessageStub = sandbox.stub(vscode.window, 'showInformationMessage');
        showWarningMessageStub = sandbox.stub(vscode.window, 'showWarningMessage');
        showErrorMessageStub = sandbox.stub(vscode.window, 'showErrorMessage');
        withProgressStub = sandbox.stub(vscode.window, 'withProgress');

        notificationService = NotificationService.getInstance();
    });

    teardown(() => {
        sandbox.restore();
    });

    test('getInstance should return the same instance', () => {
        const instance1 = NotificationService.getInstance();
        const instance2 = NotificationService.getInstance();
        assert.strictEqual(instance1, instance2);
    });

    test('showInformation should show information message', async () => {
        const message = 'Test information message';
        showInformationMessageStub.resolves();

        await notificationService.showInformation(message);

        assert(showInformationMessageStub.calledOnce);
        assert(showInformationMessageStub.calledWith(message));
    });

    test('showWarning should show warning message', async () => {
        const message = 'Test warning message';
        showWarningMessageStub.resolves();

        await notificationService.showWarning(message);

        assert(showWarningMessageStub.calledOnce);
        assert(showWarningMessageStub.calledWith(message));
    });

    test('showError should show error message', async () => {
        const message = 'Test error message';
        showErrorMessageStub.resolves();

        await notificationService.showError(message);

        assert(showErrorMessageStub.calledOnce);
        assert(showErrorMessageStub.calledWith(message));
    });

    test('showProgress should show progress notification', async () => {
        const title = 'Test Progress';
        const task = sinon.stub().resolves('test result');
        withProgressStub.resolves('test result');

        const result = await notificationService.showProgress(title, task);

        assert(withProgressStub.calledOnce);
        assert.strictEqual(result, 'test result');
        assert(withProgressStub.firstCall.args[0].title === title);
        assert(withProgressStub.firstCall.args[0].location === vscode.ProgressLocation.Notification);
    });

    test('showError should include error details when error object provided', async () => {
        const message = 'Test error message';
        const error = new Error('Detailed error info');
        showErrorMessageStub.resolves();

        await notificationService.showError(message, error);

        assert(showErrorMessageStub.calledOnce);
        assert(showErrorMessageStub.calledWith(`${message}: ${error.message}`));
    });

    test('showInformation with items should show items and handle selection', async () => {
        const message = 'Select an option';
        const items = ['Option 1', 'Option 2'];
        const callback = sinon.stub();
        showInformationMessageStub.resolves('Option 1');

        await notificationService.showInformation(message, items, callback);

        assert(showInformationMessageStub.calledOnce);
        assert(showInformationMessageStub.calledWith(message, ...items));
        assert(callback.calledOnce);
        assert(callback.calledWith('Option 1'));
    });
});