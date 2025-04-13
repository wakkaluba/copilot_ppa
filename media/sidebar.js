(function() {
    // Get access to the VS Code API
    const vscode = acquireVsCodeApi();
    
    // Elements
    const statusIndicator = document.getElementById('status-indicator');
    const statusText = document.getElementById('status-text');
    const statusMessage = document.getElementById('status-message');
    const modelSelector = document.getElementById('model-selector');
    const refreshModelsButton = document.getElementById('refresh-models-button');
    const connectButton = document.getElementById('connect-button');
    const disconnectButton = document.getElementById('disconnect-button');
    const openChatButton = document.getElementById('open-chat-button');
    const settingsButton = document.getElementById('settings-button');
    const providerTypeElement = document.getElementById('provider-type');
    const activeModelElement = document.getElementById('active-model');
    
    // State
    let currentState = {
        isConnected: false,
        activeModel: '',
        availableModels: [],
        providerType: 'None'
    };
    
    // Initialize event listeners
    function initializeEventListeners() {
        // Model selector change
        modelSelector.addEventListener('change', () => {
            const selectedModel = modelSelector.value;
            if (selectedModel) {
                vscode.postMessage({
                    type: 'selectModel',
                    model: selectedModel
                });
            }
        });
        
        // Refresh models button
        refreshModelsButton.addEventListener('click', () => {
            vscode.postMessage({ type: 'refreshModels' });
        });
        
        // Connect button
        connectButton.addEventListener('click', () => {
            vscode.postMessage({ type: 'connectLlm' });
        });
        
        // Disconnect button
        disconnectButton.addEventListener('click', () => {
            vscode.postMessage({ type: 'disconnectLlm' });
        });
        
        // Open chat button
        openChatButton.addEventListener('click', () => {
            vscode.postMessage({ type: 'openChat' });
            vscode.commands.executeCommand('localLlmAgent.chatView.focus');
        });
        
        // Settings button
        settingsButton.addEventListener('click', () => {
            vscode.postMessage({ type: 'openSettings' });
        });
    }
    
    // Update UI based on connection state
    function updateConnectionUI(connectionState) {
        // Get elements
        const statusIndicator = document.getElementById('status-indicator');
        const statusText = document.getElementById('status-text');
        const connectButton = document.getElementById('connect-button');
        const disconnectButton = document.getElementById('disconnect-button');
        const modelSelector = document.getElementById('model-selector');
        
        // Update based on connection state
        switch (connectionState) {
            case 'connected':
                statusIndicator.className = 'status-indicator connected';
                statusText.textContent = 'Connected';
                connectButton.classList.add('hidden');
                disconnectButton.classList.remove('hidden');
                modelSelector.disabled = true;
                break;
                
            case 'connecting':
                statusIndicator.className = 'status-indicator connecting';
                statusText.textContent = 'Connecting...';
                connectButton.classList.add('hidden');
                disconnectButton.classList.remove('hidden');
                disconnectButton.disabled = true;
                modelSelector.disabled = true;
                break;
                
            case 'error':
                statusIndicator.className = 'status-indicator error';
                statusText.textContent = 'Connection Error';
                connectButton.classList.remove('hidden');
                disconnectButton.classList.add('hidden');
                modelSelector.disabled = false;
                break;
                
            case 'disconnected':
            default:
                statusIndicator.className = 'status-indicator disconnected';
                statusText.textContent = 'Disconnected';
                connectButton.classList.remove('hidden');
                disconnectButton.classList.add('hidden');
                modelSelector.disabled = false;
                disconnectButton.disabled = false;
                break;
        }
    }
    
    // Update model selector options
    function updateModelSelector(availableModels, activeModel) {
        // Clear existing options
        while (modelSelector.firstChild) {
            modelSelector.removeChild(modelSelector.firstChild);
        }
        
        // Add default option
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Select a model';
        modelSelector.appendChild(defaultOption);
        
        // Add model options
        availableModels.forEach(model => {
            const option = document.createElement('option');
            option.value = model;
            option.textContent = model;
            option.selected = model === activeModel;
            modelSelector.appendChild(option);
        });
    }
    
    // Update provider information
    function updateProviderInfo(providerType, activeModel) {
        providerTypeElement.textContent = providerType || 'None';
        activeModelElement.textContent = activeModel || 'None';
    }
    
    // Handle messages from the extension
    window.addEventListener('message', event => {
        const message = event.data;
        
        switch (message.type) {
            case 'updateState':
                currentState = message.state;
                updateConnectionUI(currentState.connectionState || 
                                   (currentState.isConnected ? 'connected' : 'disconnected'));
                updateModelSelector(currentState.availableModels, currentState.activeModel);
                updateProviderInfo(currentState.providerType, currentState.activeModel);
                break;
                
            case 'updateStatus':
                statusMessage.textContent = message.status;
                statusMessage.style.display = message.status ? 'block' : 'none';
                break;
        }
    });
    
    // Initialize the UI
    function initialize() {
        initializeEventListeners();
        
        // Request initial state
        vscode.postMessage({ type: 'getState' });
    }
    
    // Start the UI when the page loads
    document.addEventListener('DOMContentLoaded', initialize);
    initialize();
})();
