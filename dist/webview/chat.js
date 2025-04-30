"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Memory management buttons
document.getElementById('clearMemory').addEventListener('click', () => {
    if (confirm('Are you sure you want to clear Copilot\'s memory? This will remove all conversation history.')) {
        vscode.postMessage({
            command: 'clearMemory'
        });
    }
});
document.getElementById('resetFiles').addEventListener('click', () => {
    if (confirm('Are you sure you want to reset the list of changed files?')) {
        vscode.postMessage({
            command: 'resetChangedFiles'
        });
    }
});
document.getElementById('restartCopilot').addEventListener('click', () => {
    if (confirm('Are you sure you want to restart Copilot? This will clear all memory and reset the service.')) {
        vscode.postMessage({
            command: 'restartCopilot'
        });
    }
});
window.addEventListener('message', event => {
    switch (event.data.command) {
        case 'memoryCleared':
            showNotification('Memory cleared successfully', 'info');
            break;
        case 'changedFilesReset':
            showNotification('Changed files list has been reset', 'info');
            break;
        case 'copilotRestarted':
            showNotification('Copilot has been restarted successfully', 'info');
            break;
    }
});
//# sourceMappingURL=chat.js.map