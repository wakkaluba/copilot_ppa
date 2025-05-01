import * as assert from 'assert';
import * as fs from 'fs';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import { BuildToolsManager } from '../../../src/buildTools/buildToolsManager';

suite('BuildToolsManager Tests', () => {
    let buildToolsManager;
    let sandbox;
    let extensionContextStub;
    let workspaceFoldersStub;
    let fsExistsStub;
    let fsReadFileStub;
    let registerCommandStub;
    let showInformationMessageStub;
    let showQuickPickStub;

    setup(() => {
        sandbox = sinon.createSandbox();

        // Mock vscode API
        registerCommandStub = sandbox.stub();
        showInformationMessageStub = sandbox.stub();
        showQuickPickStub = sandbox.stub();

        sandbox.stub(vscode.commands, 'registerCommand').returns(registerCommandStub);
        sandbox.stub(vscode.window, 'showInformationMessage').returns(showInformationMessageStub);
        sandbox.stub(vscode.window, 'showQuickPick').returns(showQuickPickStub);

        // Mock extension context
        extensionContextStub = {
            subscriptions: [],
            extensionPath: '/test/extension/path'
        };

        // Mock workspace
        workspaceFoldersStub = sandbox.stub(vscode.workspace, 'workspaceFolders').value([
            { uri: { fsPath: '/test/workspace' } }
        ]);

        // Mock fs
        fsExistsStub = sandbox.stub(fs, 'existsSync');
        fsReadFileStub = sandbox.stub(fs.promises, 'readFile');

        // Set default stubs for webpack config detection
        fsExistsStub.withArgs(sinon.match(/webpack\.config\.js$/)).returns(true);
        fsReadFileStub.resolves('module.exports = { mode: "development" }');

        // Create instance
        buildToolsManager = new BuildToolsManager(extensionContextStub);
    });

    teardown(() => {
        sandbox.restore();
    });

    test('should register commands on initialization', () => {
        assert.ok(vscode.commands.registerCommand.called);
        assert.ok(vscode.commands.registerCommand.calledWith('copilot-ppa.analyzeBuildTools'));
        assert.ok(vscode.commands.registerCommand.calledWith('copilot-ppa.analyzeBundleSize'));
        assert.ok(vscode.commands.registerCommand.calledWith('copilot-ppa.optimizeBuildScripts'));
    });

    test('should detect webpack configuration', async () => {
        const webpackConfig = await buildToolsManager.detectWebpackConfig();
        assert.ok(webpackConfig);
        assert.ok(fsExistsStub.calledWith(sinon.match(/webpack\.config\.js$/)));
        assert.ok(fsReadFileStub.called);
    });

    test('should handle missing webpack configuration', async () => {
        fsExistsStub.withArgs(sinon.match(/webpack\.config\.js$/)).returns(false);

        const webpackConfig = await buildToolsManager.detectWebpackConfig();

        assert.strictEqual(webpackConfig, null);
    });

    test('should analyze bundle size', async () => {
        fsExistsStub.withArgs(sinon.match(/dist/)).returns(true);

        // Stub fs.readdir to return some mock files
        sandbox.stub(fs.promises, 'readdir').resolves([
            'main.js',
            'vendor.js',
            'styles.css'
        ]);

        // Stub fs.stat to return file sizes
        const statStub = sandbox.stub(fs.promises, 'stat');
        statStub.resolves({ size: 1024 * 10 }); // 10KB

        await buildToolsManager.analyzeBundleSize();

        assert.ok(vscode.window.showInformationMessage.called);
    });

    test('should format file sizes correctly', () => {
        assert.strictEqual(buildToolsManager.formatFileSize(0), '0 B');
        assert.strictEqual(buildToolsManager.formatFileSize(1023), '1023 B');
        assert.strictEqual(buildToolsManager.formatFileSize(1024), '1.0 KB');
        assert.strictEqual(buildToolsManager.formatFileSize(1024 * 1024), '1.0 MB');
        assert.strictEqual(buildToolsManager.formatFileSize(1024 * 1024 * 1024), '1.0 GB');
    });

    test('should optimize build scripts', async () => {
        // Mock package.json content
        const packageJsonContent = JSON.stringify({
            scripts: {
                build: 'webpack --mode production',
                dev: 'webpack --mode development'
            }
        });

        fsExistsStub.withArgs(sinon.match(/package\.json$/)).returns(true);
        fsReadFileStub.withArgs(sinon.match(/package\.json$/)).resolves(packageJsonContent);

        await buildToolsManager.optimizeBuildScripts();

        assert.ok(vscode.window.showInformationMessage.called);
    });

    test('should handle error during build script optimization', async () => {
        fsExistsStub.withArgs(sinon.match(/package\.json$/)).returns(true);
        fsReadFileStub.withArgs(sinon.match(/package\.json$/)).rejects(new Error('Read error'));

        await buildToolsManager.optimizeBuildScripts();

        assert.ok(vscode.window.showInformationMessage.calledWith(
            sinon.match(/Error optimizing build scripts/)
        ));
    });

    test('should clean up resources on disposal', () => {
        const disposable = { dispose: sandbox.stub() };
        extensionContextStub.subscriptions.push(disposable);

        buildToolsManager.dispose();

        assert.ok(disposable.dispose.called);
    });

    test('should render webpack config recommendations', async () => {
        const webpackConfig = { mode: 'development' };
        const recommendations = await buildToolsManager.getWebpackRecommendations(webpackConfig);

        assert.ok(Array.isArray(recommendations));
        assert.ok(recommendations.length > 0);
    });
});
