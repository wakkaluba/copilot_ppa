// @ts-check

// Get all toggle elements
const fileToggle = document.getElementById('file-toggle');
const workspaceToggle = document.getElementById('workspace-toggle');
const processToggle = document.getElementById('process-toggle');
const otherToggle = document.getElementById('other-toggle');

// Get access to the VS Code API
const vscode = acquireVsCodeApi();

// Initialize toggle states
(function init() {
    // Request current settings from the extension
    vscode.postMessage({ command: 'getSettings' });
})();

// Handle messages from the extension
window.addEventListener('message', event => {
    const message = event.data;

    switch (message.command) {
        case 'settingsUpdated':
            updateToggleStates(message.settings);
            break;
    }
});

// Update all toggle states based on the settings
function updateToggleStates(settings) {
    fileToggle.checked = settings.file;
    workspaceToggle.checked = settings.workspace;
    processToggle.checked = settings.process;
    otherToggle.checked = settings.other;
}

// Add event listeners to toggles
fileToggle.addEventListener('change', () => {
    vscode.postMessage({
        command: 'toggleSetting',
        type: 'file',
        enable: fileToggle.checked
    });
});

workspaceToggle.addEventListener('change', () => {
    vscode.postMessage({
        command: 'toggleSetting',
        type: 'workspace',
        enable: workspaceToggle.checked
    });
});

processToggle.addEventListener('change', () => {
    vscode.postMessage({
        command: 'toggleSetting',
        type: 'process',
        enable: processToggle.checked
    });
});

otherToggle.addEventListener('change', () => {
    vscode.postMessage({
        command: 'toggleSetting',
        type: 'other',
        enable: otherToggle.checked
    });
});
