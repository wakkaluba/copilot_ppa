const { JSDOM } = require('jsdom');
const { TextEncoder, TextDecoder } = require('util');

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

describe('Code Examples UI', () => {
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
                    <input type="text" id="search-input">
                    <button id="search-button">Search</button>
                    <select id="language-select">
                        <option value="">All Languages</option>
                        <option value="javascript">JavaScript</option>
                        <option value="typescript">TypeScript</option>
                    </select>
                    <div class="loading-indicator hidden"></div>
                    <div class="empty-state" style="display: none;"></div>
                    <div class="error-container hidden">
                        <div class="error-message"></div>
                    </div>
                    <div class="results-container"></div>
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

        // Load code examples script
        const examplesScript = require('fs').readFileSync(require('path').join(__dirname, 'codeExamples.js'), 'utf8');
        const scriptEl = document.createElement('script');
        scriptEl.textContent = examplesScript;
        document.body.appendChild(scriptEl);
    });

    describe('search functionality', () => {
        test('sends search request on button click', () => {
            const searchInput = document.getElementById('search-input');
            const searchButton = document.getElementById('search-button');

            searchInput.value = 'test query';
            searchButton.click();

            expect(vscode.postMessage).toHaveBeenCalledWith({
                type: 'search',
                query: 'test query',
                language: ''
            });
        });

        test('sends search request on Enter key', () => {
            const searchInput = document.getElementById('search-input');

            searchInput.value = 'test query';
            searchInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));

            expect(vscode.postMessage).toHaveBeenCalledWith({
                type: 'search',
                query: 'test query',
                language: ''
            });
        });

        test('includes selected language in search request', () => {
            const searchInput = document.getElementById('search-input');
            const searchButton = document.getElementById('search-button');
            const languageSelect = document.getElementById('language-select');

            searchInput.value = 'test query';
            languageSelect.value = 'typescript';
            searchButton.click();

            expect(vscode.postMessage).toHaveBeenCalledWith({
                type: 'search',
                query: 'test query',
                language: 'typescript'
            });
        });

        test('does not send request for empty query', () => {
            const searchButton = document.getElementById('search-button');
            searchButton.click();

            expect(vscode.postMessage).not.toHaveBeenCalled();
        });
    });

    describe('results display', () => {
        test('displays search results', () => {
            const results = [
                {
                    title: 'Example 1',
                    code: 'console.log("test")',
                    language: 'javascript',
                    source: { name: 'GitHub', url: 'https://github.com/example1' },
                    stars: 100
                },
                {
                    title: 'Example 2',
                    code: 'const test = () => {};',
                    language: 'typescript',
                    source: { name: 'GitHub', url: 'https://github.com/example2' },
                    stars: 200
                }
            ];

            const event = new window.MessageEvent('message', {
                data: {
                    type: 'searchResults',
                    results,
                    query: 'test',
                    language: ''
                }
            });
            window.dispatchEvent(event);

            const resultsContainer = document.querySelector('.results-container');
            const cards = resultsContainer.querySelectorAll('.code-example-card');

            expect(cards.length).toBe(2);
            expect(cards[0].querySelector('.code-example-title').textContent).toBe('Example 1');
            expect(cards[1].querySelector('.code-example-title').textContent).toBe('Example 2');
        });

        test('shows empty state for no results', () => {
            const event = new window.MessageEvent('message', {
                data: {
                    type: 'searchResults',
                    results: [],
                    query: 'no results',
                    language: 'javascript'
                }
            });
            window.dispatchEvent(event);

            const emptyState = document.querySelector('.empty-state');
            expect(emptyState.style.display).toBe('flex');
            expect(emptyState.textContent).toContain('no results');
            expect(emptyState.textContent).toContain('javascript');
        });
    });

    describe('loading state', () => {
        test('shows loading indicator', () => {
            const event = new window.MessageEvent('message', {
                data: { type: 'loading', loading: true }
            });
            window.dispatchEvent(event);

            const loadingIndicator = document.querySelector('.loading-indicator');
            const emptyState = document.querySelector('.empty-state');

            expect(loadingIndicator.classList.contains('hidden')).toBe(false);
            expect(emptyState.style.display).toBe('none');
        });

        test('hides loading indicator', () => {
            const event = new window.MessageEvent('message', {
                data: { type: 'loading', loading: false }
            });
            window.dispatchEvent(event);

            const loadingIndicator = document.querySelector('.loading-indicator');
            expect(loadingIndicator.classList.contains('hidden')).toBe(true);
        });
    });

    describe('error handling', () => {
        test('displays error message', () => {
            const errorMessage = 'Test error message';
            const event = new window.MessageEvent('message', {
                data: { type: 'error', message: errorMessage }
            });
            window.dispatchEvent(event);

            const errorContainer = document.querySelector('.error-container');
            const errorElement = document.querySelector('.error-message');

            expect(errorContainer.classList.contains('hidden')).toBe(false);
            expect(errorElement.textContent).toBe(errorMessage);
        });

        test('hides error message when starting new search', () => {
            // First show error
            window.dispatchEvent(new window.MessageEvent('message', {
                data: { type: 'error', message: 'Error' }
            }));

            // Then start new search
            const searchInput = document.getElementById('search-input');
            const searchButton = document.getElementById('search-button');

            searchInput.value = 'new search';
            searchButton.click();

            const errorContainer = document.querySelector('.error-container');
            expect(errorContainer.classList.contains('hidden')).toBe(true);
        });
    });

    describe('interaction handling', () => {
        test('sends copy request when clicking copy button', () => {
            // Display a result first
            const event = new window.MessageEvent('message', {
                data: {
                    type: 'searchResults',
                    results: [{
                        title: 'Test',
                        code: 'test code',
                        source: { name: 'GitHub', url: 'https://github.com' }
                    }],
                    query: 'test'
                }
            });
            window.dispatchEvent(event);

            const copyButton = document.querySelector('.action-button');
            copyButton.click();

            expect(vscode.postMessage).toHaveBeenCalledWith({
                type: 'copy',
                code: 'test code'
            });
        });

        test('sends insert request when clicking insert button', () => {
            // Display a result first
            const event = new window.MessageEvent('message', {
                data: {
                    type: 'searchResults',
                    results: [{
                        title: 'Test',
                        code: 'test code',
                        source: { name: 'GitHub', url: 'https://github.com' }
                    }],
                    query: 'test'
                }
            });
            window.dispatchEvent(event);

            const insertButton = document.querySelector('.insert-button');
            insertButton.click();

            expect(vscode.postMessage).toHaveBeenCalledWith({
                type: 'insert',
                code: 'test code'
            });
        });

        test('sends open link request when clicking source link', () => {
            // Display a result first
            const event = new window.MessageEvent('message', {
                data: {
                    type: 'searchResults',
                    results: [{
                        title: 'Test',
                        code: 'test code',
                        source: { name: 'GitHub', url: 'https://github.com/test' }
                    }],
                    query: 'test'
                }
            });
            window.dispatchEvent(event);

            const sourceLink = document.querySelector('.code-example-source a');
            sourceLink.click();

            expect(vscode.postMessage).toHaveBeenCalledWith({
                type: 'openLink',
                url: 'https://github.com/test'
            });
        });
    });
});
