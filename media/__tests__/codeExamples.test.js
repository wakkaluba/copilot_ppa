// filepath: d:\___coding\tools\copilot_ppa\media\__tests__\codeExamples.test.js

describe('Code Examples UI', () => {
    let mockVSCode;
    let searchInput;
    let searchButton;
    let languageSelect;
    let resultsContainer;
    let loadingIndicator;
    let emptyState;
    let errorContainer;
    let errorMessage;

    // Mock DOM elements and VSCode API before each test
    beforeEach(() => {
        // Create mock DOM elements
        document.body.innerHTML = `
            <input id="search-input" type="text" />
            <button id="search-button">Search</button>
            <select id="language-select">
                <option value="">All Languages</option>
                <option value="javascript">JavaScript</option>
                <option value="typescript">TypeScript</option>
                <option value="python">Python</option>
            </select>
            <div class="results-container"></div>
            <div class="loading-indicator hidden"></div>
            <div class="empty-state" style="display: none;"></div>
            <div class="error-container hidden">
                <div class="error-message"></div>
            </div>
        `;

        // Get DOM elements
        searchInput = document.getElementById('search-input');
        searchButton = document.getElementById('search-button');
        languageSelect = document.getElementById('language-select');
        resultsContainer = document.querySelector('.results-container');
        loadingIndicator = document.querySelector('.loading-indicator');
        emptyState = document.querySelector('.empty-state');
        errorContainer = document.querySelector('.error-container');
        errorMessage = document.querySelector('.error-message');

        // Mock VS Code API
        mockVSCode = {
            postMessage: jest.fn()
        };
        global.acquireVsCodeApi = jest.fn(() => mockVSCode);

        // Load the codeExamples.js script
        require('../codeExamples.js');
    });

    afterEach(() => {
        jest.resetModules();
        document.body.innerHTML = '';
        jest.restoreAllMocks();
    });

    describe('Search Functionality', () => {
        test('should send search message when search button is clicked', () => {
            // Setup
            searchInput.value = 'react hooks';
            languageSelect.value = 'javascript';

            // Execute
            searchButton.click();

            // Verify
            expect(mockVSCode.postMessage).toHaveBeenCalledWith({
                type: 'search',
                query: 'react hooks',
                language: 'javascript'
            });
            expect(loadingIndicator.classList.contains('hidden')).toBe(false);
        });

        test('should send search message when Enter key is pressed in search input', () => {
            // Setup
            searchInput.value = 'async await';
            languageSelect.value = 'typescript';

            // Execute - simulate Enter key press
            const enterKeyEvent = new KeyboardEvent('keydown', { key: 'Enter' });
            searchInput.dispatchEvent(enterKeyEvent);

            // Verify
            expect(mockVSCode.postMessage).toHaveBeenCalledWith({
                type: 'search',
                query: 'async await',
                language: 'typescript'
            });
        });

        test('should not send search message if query is empty', () => {
            // Setup
            searchInput.value = '   '; // Just whitespace

            // Execute
            searchButton.click();

            // Verify
            expect(mockVSCode.postMessage).not.toHaveBeenCalled();
        });

        test('should show loading indicator when search starts', () => {
            // Setup
            searchInput.value = 'express middleware';

            // Verify initial state
            expect(loadingIndicator.classList.contains('hidden')).toBe(true);

            // Execute
            searchButton.click();

            // Verify loading state
            expect(loadingIndicator.classList.contains('hidden')).toBe(false);
        });
    });

    describe('Message Handling', () => {
        test('should handle loading message', () => {
            // Setup - initial state
            loadingIndicator.classList.add('hidden');

            // Execute - send loading message
            window.dispatchEvent(new MessageEvent('message', {
                data: { type: 'loading', loading: true }
            }));

            // Verify - loading indicator should be visible
            expect(loadingIndicator.classList.contains('hidden')).toBe(false);

            // Execute - send loading complete message
            window.dispatchEvent(new MessageEvent('message', {
                data: { type: 'loading', loading: false }
            }));

            // Verify - loading indicator should be hidden
            expect(loadingIndicator.classList.contains('hidden')).toBe(true);
        });

        test('should handle error message', () => {
            // Execute - send error message
            window.dispatchEvent(new MessageEvent('message', {
                data: { type: 'error', message: 'API connection failed' }
            }));

            // Verify - error should be displayed
            expect(errorContainer.classList.contains('hidden')).toBe(false);
            expect(errorMessage.textContent).toBe('API connection failed');

            // Execute - send another type of message to clear error
            window.dispatchEvent(new MessageEvent('message', {
                data: { type: 'loading', loading: true }
            }));

            // Error should still be displayed until explicitly cleared
            expect(errorContainer.classList.contains('hidden')).toBe(false);
        });

        test('should display empty state when no results are found', () => {
            // Execute - send empty search results
            window.dispatchEvent(new MessageEvent('message', {
                data: {
                    type: 'searchResults',
                    results: [],
                    query: 'nonexistent code',
                    language: 'javascript'
                }
            }));

            // Verify - empty state should be visible with correct message
            expect(emptyState.style.display).toBe('flex');
            expect(emptyState.innerHTML).toContain('No code examples found for "nonexistent code" in javascript');
            expect(resultsContainer.innerHTML).toBe('');
        });
    });

    describe('Search Results Display', () => {
        const mockResults = [
            {
                title: 'React Hooks Example',
                code: 'function useCustomHook() {\n  const [state, setState] = useState(0);\n  return state;\n}',
                language: 'javascript',
                source: {
                    name: 'React Docs',
                    url: 'https://reactjs.org/docs/hooks-intro.html'
                },
                stars: 5000
            },
            {
                title: 'Express Middleware',
                code: 'app.use((req, res, next) => {\n  console.log("Middleware");\n  next();\n});',
                language: 'javascript',
                source: {
                    name: 'Express Docs',
                    url: 'https://expressjs.com/en/guide/using-middleware.html'
                }
            }
        ];

        test('should display search results correctly', () => {
            // Execute - send search results
            window.dispatchEvent(new MessageEvent('message', {
                data: {
                    type: 'searchResults',
                    results: mockResults,
                    query: 'react hooks',
                    language: 'javascript'
                }
            }));

            // Verify - loading should be hidden, empty state should be hidden
            expect(loadingIndicator.classList.contains('hidden')).toBe(true);
            expect(emptyState.style.display).toBe('none');

            // Verify - results should be displayed
            expect(resultsContainer.children.length).toBe(2);

            // Check first result card
            const firstCard = resultsContainer.children[0];
            expect(firstCard.className).toBe('code-example-card');

            // Check title
            const title = firstCard.querySelector('.code-example-title');
            expect(title.textContent).toBe('React Hooks Example');

            // Check source link
            const sourceLink = firstCard.querySelector('.code-example-source a');
            expect(sourceLink.textContent).toBe('React Docs');
            expect(sourceLink.href).toContain('https://reactjs.org/docs/hooks-intro.html');

            // Check language
            const language = firstCard.querySelector('.code-example-language');
            expect(language.textContent).toBe('javascript');

            // Check stars
            const stars = firstCard.querySelector('.code-example-stars');
            expect(stars.textContent).toBe('5000');

            // Check code content
            const codeContent = firstCard.querySelector('pre');
            expect(codeContent.textContent).toBe(mockResults[0].code);

            // Check action buttons
            const actionButtons = firstCard.querySelectorAll('.code-example-actions button');
            expect(actionButtons.length).toBe(2);
            expect(actionButtons[0].textContent).toBe('Copy');
            expect(actionButtons[1].textContent).toBe('Insert');
        });

        test('should handle results without optional fields', () => {
            // Execute - send result without stars
            window.dispatchEvent(new MessageEvent('message', {
                data: {
                    type: 'searchResults',
                    results: [mockResults[1]], // Second example doesn't have stars
                    query: 'express',
                    language: ''
                }
            }));

            // Verify card was created
            expect(resultsContainer.children.length).toBe(1);
            const card = resultsContainer.children[0];

            // Second example shouldn't have stars element
            const stars = card.querySelector('.code-example-stars');
            expect(stars).not.toBeNull(); // The element will be created but should be empty
        });

        test('should handle button click events properly', () => {
            // Set up results first
            window.dispatchEvent(new MessageEvent('message', {
                data: {
                    type: 'searchResults',
                    results: mockResults,
                    query: 'middleware',
                    language: ''
                }
            }));

            // Get the buttons from the first card
            const card = resultsContainer.children[0];
            const copyButton = card.querySelector('.action-button');
            const insertButton = card.querySelector('.insert-button');

            // Click copy button
            copyButton.click();

            // Verify copy message was sent
            expect(mockVSCode.postMessage).toHaveBeenCalledWith({
                type: 'copy',
                code: mockResults[0].code
            });

            // Click insert button
            insertButton.click();

            // Verify insert message was sent
            expect(mockVSCode.postMessage).toHaveBeenCalledWith({
                type: 'insert',
                code: mockResults[0].code
            });
        });

        test('should open source links through VS Code', () => {
            // Set up results first
            window.dispatchEvent(new MessageEvent('message', {
                data: {
                    type: 'searchResults',
                    results: mockResults,
                    query: 'docs',
                    language: ''
                }
            }));

            // Get the source link from the first card
            const card = resultsContainer.children[0];
            const sourceLink = card.querySelector('.code-example-source a');

            // Click the source link
            sourceLink.click();

            // Verify the proper message was sent to VS Code
            expect(mockVSCode.postMessage).toHaveBeenCalledWith({
                type: 'openLink',
                url: 'https://reactjs.org/docs/hooks-intro.html'
            });
        });
    });

    describe('Error Handling', () => {
        test('should clear error when showError is called with null', () => {
            // Setup - show an error first
            window.dispatchEvent(new MessageEvent('message', {
                data: { type: 'error', message: 'Test error' }
            }));

            // Verify error is shown
            expect(errorContainer.classList.contains('hidden')).toBe(false);

            // Now perform a search which should clear the error
            searchInput.value = 'new search';
            searchButton.click();

            // Verify error is hidden
            expect(errorContainer.classList.contains('hidden')).toBe(true);
        });
    });
});
