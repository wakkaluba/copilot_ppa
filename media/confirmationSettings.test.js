const { JSDOM } = require('jsdom');
const { TextEncoder, TextDecoder } = require('util');

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

describe('Confirmation Settings', () => {
    let dom;
    let document;
    let window;
    let vscode;

    beforeEach(() => {
        // Mock VS Code API
        vscode = {
            postMessage: jest.fn()
        };
        global.acquireVsCodeApi = () => vscode;

        // Set up DOM environment
        const html = `
            <html>
                <body>
                    <input type="checkbox" id="file-toggle">
                    <input type="checkbox" id="workspace-toggle">
                    <input type="checkbox" id="process-toggle">
                    <input type="checkbox" id="other-toggle">
                </body>
            </html>
        `;

        dom = new JSDOM(html, {
            runScripts: 'dangerously',
            resources: 'usable',
            url: 'http://localhost'
        });
        document = dom.window.document;
        window = dom.window;

        // Load the confirmationSettings.js script
        const settingsScript = require('fs').readFileSync(require('path').join(__dirname, 'confirmationSettings.js'), 'utf8');
        const scriptEl = document.createElement('script');
        scriptEl.textContent = settingsScript;
        document.body.appendChild(scriptEl);
    });

    describe('initialization', () => {
        test('requests initial settings on load', () => {
            expect(vscode.postMessage).toHaveBeenCalledWith({
                command: 'getSettings'
            });
        });
    });

    describe('toggle state updates', () => {
        test('updates all toggle states when settings are received', () => {
            const settings = {
                file: true,
                workspace: false,
                process: true,
                other: false
            };

            const event = new window.MessageEvent('message', {
                data: {
                    command: 'settingsUpdated',
                    settings: settings
                }
            });
            window.dispatchEvent(event);

            expect(document.getElementById('file-toggle').checked).toBe(true);
            expect(document.getElementById('workspace-toggle').checked).toBe(false);
            expect(document.getElementById('process-toggle').checked).toBe(true);
            expect(document.getElementById('other-toggle').checked).toBe(false);
        });
    });

    describe('toggle change events', () => {
        test('notifies extension when file toggle changes', () => {
            const fileToggle = document.getElementById('file-toggle');
            fileToggle.checked = true;
            fileToggle.dispatchEvent(new Event('change'));

            expect(vscode.postMessage).toHaveBeenCalledWith({
                command: 'toggleSetting',
                type: 'file',
                enable: true
            });
        });

        test('notifies extension when workspace toggle changes', () => {
            const workspaceToggle = document.getElementById('workspace-toggle');
            workspaceToggle.checked = true;
            workspaceToggle.dispatchEvent(new Event('change'));

            expect(vscode.postMessage).toHaveBeenCalledWith({
                command: 'toggleSetting',
                type: 'workspace',
                enable: true
            });
        });

        test('notifies extension when process toggle changes', () => {
            const processToggle = document.getElementById('process-toggle');
            processToggle.checked = true;
            processToggle.dispatchEvent(new Event('change'));

            expect(vscode.postMessage).toHaveBeenCalledWith({
                command: 'toggleSetting',
                type: 'process',
                enable: true
            });
        });

        test('notifies extension when other toggle changes', () => {
            const otherToggle = document.getElementById('other-toggle');
            otherToggle.checked = true;
            otherToggle.dispatchEvent(new Event('change'));

            expect(vscode.postMessage).toHaveBeenCalledWith({
                command: 'toggleSetting',
                type: 'other',
                enable: true
            });
        });

        test('handles multiple toggle changes', () => {
            const toggles = ['file', 'workspace', 'process', 'other'];

            toggles.forEach(type => {
                const toggle = document.getElementById(`${type}-toggle`);
                toggle.checked = true;
                toggle.dispatchEvent(new Event('change'));

                expect(vscode.postMessage).toHaveBeenCalledWith({
                    command: 'toggleSetting',
                    type: type,
                    enable: true
                });

                toggle.checked = false;
                toggle.dispatchEvent(new Event('change'));

                expect(vscode.postMessage).toHaveBeenCalledWith({
                    command: 'toggleSetting',
                    type: type,
                    enable: false
                });
            });
        });
    });
});
