describe('Sidebar UI Tests', () => {
    let mockVscode;
    let statusIndicator;
    let statusText;
    let statusMessage;
    let modelSelector;
    let refreshModelsButton;
    let connectButton;
    let disconnectButton;
    let openChatButton;
    let settingsButton;
    let providerTypeElement;
    let activeModelElement;

    beforeEach(() => {
        // Mock DOM elements
        document.body.innerHTML = `
            <div id="status-indicator"></div>
            <div id="status-text"></div>
            <div id="status-message"></div>
            <select id="model-selector"></select>
            <button id="refresh-models-button">Refresh</button>
            <button id="connect-button">Connect</button>
            <button id="disconnect-button">Disconnect</button>
            <button id="open-chat-button">Open Chat</button>
            <button id="settings-button">Settings</button>
            <div id="provider-type"></div>
            <div id="active-model"></div>
        `;

        // Get DOM elements
        statusIndicator = document.getElementById('status-indicator');
        statusText = document.getElementById('status-text');
        statusMessage = document.getElementById('status-message');
        modelSelector = document.getElementById('model-selector');
        refreshModelsButton = document.getElementById('refresh-models-button');
        connectButton = document.getElementById('connect-button');
        disconnectButton = document.getElementById('disconnect-button');
        openChatButton = document.getElementById('open-chat-button');
        settingsButton = document.getElementById('settings-button');
        providerTypeElement = document.getElementById('provider-type');
        activeModelElement = document.getElementById('active-model');

        // Mock VS Code API
        mockVscode = {
            postMessage: jest.fn(),
            setState: jest.fn(),
            getState: jest.fn().mockReturnValue(null)
        };
        global.acquireVsCodeApi = jest.fn().mockReturnValue(mockVscode);

        // Load sidebar.js to initialize handlers
        require('./sidebar.js');
    });

    afterEach(() => {
        document.body.innerHTML = '';
        jest.clearAllMocks();
    });

    describe('Connection UI', () => {
        test('updates UI for connected state', () => {
            window.dispatchEvent(new MessageEvent('message', {
                data: {
                    type: 'updateState',
                    state: {
                        connectionState: 'connected',
                        isConnected: true,
                        activeModel: 'gpt-4',
                        availableModels: ['gpt-3.5-turbo', 'gpt-4'],
                        providerType: 'OpenAI'
                    }
                }
            }));

            expect(statusIndicator.classList.contains('connected')).toBe(true);
            expect(statusText.textContent).toBe('Connected');
            expect(connectButton.classList.contains('hidden')).toBe(true);
            expect(disconnectButton.classList.contains('hidden')).toBe(false);
            expect(modelSelector.disabled).toBe(true);
        });

        test('updates UI for connecting state', () => {
            window.dispatchEvent(new MessageEvent('message', {
                data: {
                    type: 'updateState',
                    state: {
                        connectionState: 'connecting',
                        isConnected: false
                    }
                }
            }));

            expect(statusIndicator.classList.contains('connecting')).toBe(true);
            expect(statusText.textContent).toBe('Connecting...');
            expect(connectButton.classList.contains('hidden')).toBe(true);
            expect(disconnectButton.disabled).toBe(true);
        });

        test('updates UI for error state', () => {
            window.dispatchEvent(new MessageEvent('message', {
                data: {
                    type: 'updateState',
                    state: {
                        connectionState: 'error',
                        isConnected: false
                    }
                }
            }));

            expect(statusIndicator.classList.contains('error')).toBe(true);
            expect(statusText.textContent).toBe('Connection Error');
        });
    });

    describe('Model Selection', () => {
        test('updates model selector with available models', () => {
            const models = ['gpt-3.5-turbo', 'gpt-4', 'claude-2'];
            const activeModel = 'gpt-4';

            window.dispatchEvent(new MessageEvent('message', {
                data: {
                    type: 'updateState',
                    state: {
                        availableModels: models,
                        activeModel: activeModel
                    }
                }
            }));

            expect(modelSelector.children.length).toBe(models.length + 1); // +1 for default option
            expect(modelSelector.value).toBe(activeModel);
        });

        test('sends model selection message', () => {
            modelSelector.value = 'gpt-4';
            modelSelector.dispatchEvent(new Event('change'));

            expect(mockVscode.postMessage).toHaveBeenCalledWith({
                type: 'selectModel',
                model: 'gpt-4'
            });
        });
    });

    describe('Button Actions', () => {
        test('refresh button sends refreshModels message', () => {
            refreshModelsButton.click();

            expect(mockVscode.postMessage).toHaveBeenCalledWith({
                type: 'refreshModels'
            });
        });

        test('connect button sends connectLlm message', () => {
            connectButton.click();

            expect(mockVscode.postMessage).toHaveBeenCalledWith({
                type: 'connectLlm'
            });
        });

        test('disconnect button sends disconnectLlm message', () => {
            disconnectButton.click();

            expect(mockVscode.postMessage).toHaveBeenCalledWith({
                type: 'disconnectLlm'
            });
        });

        test('settings button sends openSettings message', () => {
            settingsButton.click();

            expect(mockVscode.postMessage).toHaveBeenCalledWith({
                type: 'openSettings'
            });
        });
    });

    describe('Status Messages', () => {
        test('displays status message', () => {
            window.dispatchEvent(new MessageEvent('message', {
                data: {
                    type: 'updateStatus',
                    status: 'Loading models...'
                }
            }));

            expect(statusMessage.textContent).toBe('Loading models...');
            expect(statusMessage.style.display).toBe('block');
        });

        test('hides status message when empty', () => {
            window.dispatchEvent(new MessageEvent('message', {
                data: {
                    type: 'updateStatus',
                    status: ''
                }
            }));

            expect(statusMessage.style.display).toBe('none');
        });
    });

    describe('Provider Information', () => {
        test('updates provider information', () => {
            window.dispatchEvent(new MessageEvent('message', {
                data: {
                    type: 'updateState',
                    state: {
                        providerType: 'OpenAI',
                        activeModel: 'gpt-4'
                    }
                }
            }));

            expect(providerTypeElement.textContent).toBe('OpenAI');
            expect(activeModelElement.textContent).toBe('gpt-4');
        });

        test('shows None when no provider or model', () => {
            window.dispatchEvent(new MessageEvent('message', {
                data: {
                    type: 'updateState',
                    state: {
                        providerType: null,
                        activeModel: null
                    }
                }
            }));

            expect(providerTypeElement.textContent).toBe('None');
            expect(activeModelElement.textContent).toBe('None');
        });
    });
});
