import * as vscode from 'vscode';
import * as sinon from 'sinon';
import * as assert from 'assert';
import { DisplaySettingsService } from '../../../src/services/displaySettingsService';

suite('DisplaySettingsService Tests', () => {
    let displaySettingsService: DisplaySettingsService;
    let sandbox: sinon.SinonSandbox;
    let configurationStub: sinon.SinonStub;
    let onDidChangeConfigurationStub: sinon.SinonStub;

    setup(() => {
        sandbox = sinon.createSandbox();
        
        // Stub VS Code workspace configuration
        configurationStub = sandbox.stub(vscode.workspace, 'getConfiguration');
        configurationStub.returns({
            get: sandbox.stub().returns({
                fontSize: 14,
                messageSpacing: 12,
                codeBlockTheme: 'default',
                userMessageColor: '#569cd6',
                agentMessageColor: '#4ec9b0',
                timestampDisplay: true,
                compactMode: false
            }),
            update: sandbox.stub().resolves()
        });

        // Stub configuration change event
        onDidChangeConfigurationStub = sandbox.stub(vscode.workspace, 'onDidChangeConfiguration');
        onDidChangeConfigurationStub.returns({ dispose: () => {} });

        displaySettingsService = DisplaySettingsService.getInstance();
    });

    teardown(() => {
        sandbox.restore();
    });

    test('getInstance should return the same instance', () => {
        const instance1 = DisplaySettingsService.getInstance();
        const instance2 = DisplaySettingsService.getInstance();
        assert.strictEqual(instance1, instance2);
    });

    test('getSettings should return default settings when no configuration exists', () => {
        configurationStub.returns({
            get: sandbox.stub().returns(undefined)
        });

        const settings = displaySettingsService.getSettings();
        
        assert.strictEqual(settings.fontSize, 14);
        assert.strictEqual(settings.messageSpacing, 12);
        assert.strictEqual(settings.codeBlockTheme, 'default');
        assert.strictEqual(settings.userMessageColor, '#569cd6');
        assert.strictEqual(settings.agentMessageColor, '#4ec9b0');
        assert.strictEqual(settings.timestampDisplay, true);
        assert.strictEqual(settings.compactMode, false);
    });

    test('updateSetting should update configuration and fire change event', async () => {
        const updateStub = sandbox.stub().resolves();
        configurationStub.returns({
            get: sandbox.stub().returns({}),
            update: updateStub
        });

        await displaySettingsService.updateSetting('fontSize', 16);

        assert(updateStub.calledOnce);
        assert(updateStub.calledWith('display', { fontSize: 16 }, vscode.ConfigurationTarget.Global));
    });

    test('applySettingsToElement should apply styles to HTML element', () => {
        const element = {
            style: {},
            classList: {
                add: sandbox.stub(),
                remove: sandbox.stub()
            }
        };

        displaySettingsService.applySettingsToElement(element as any);

        assert.strictEqual(element.style.fontSize, '14px');
        assert(element.classList.remove.calledWith('compact-mode'));
    });

    test('applySettingsToElement should apply compact mode when enabled', () => {
        configurationStub.returns({
            get: sandbox.stub().returns({
                fontSize: 14,
                compactMode: true
            })
        });

        const element = {
            style: {},
            classList: {
                add: sandbox.stub(),
                remove: sandbox.stub()
            }
        };

        displaySettingsService.applySettingsToElement(element as any);

        assert(element.classList.add.calledWith('compact-mode'));
    });
});