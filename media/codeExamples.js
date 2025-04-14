(function() {
    // Get reference to VS Code API
    const vscode = acquireVsCodeApi();
    
    // Get DOM elements
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const languageSelect = document.getElementById('language-select');
    const resultsContainer = document.querySelector('.results-container');
    const loadingIndicator = document.querySelector('.loading-indicator');
    const emptyState = document.querySelector('.empty-state');
    const errorContainer = document.querySelector('.error-container');
    const errorMessage = document.querySelector('.error-message');
    
    // Add event listeners
    searchButton.addEventListener('click', performSearch);
    searchInput.addEventListener('keydown', event => {
        if (event.key === 'Enter') {
            performSearch();
        }
    });
    
    // Perform search
    function performSearch() {
        const query = searchInput.value.trim();
        const language = languageSelect.value;
        
        if (!query) {
            return;
        }
        
        // Send search request to extension
        vscode.postMessage({
            type: 'search',
            query,
            language
        });
        
        // Show loading indicator
        showLoading(true);
        
        // Hide error if shown
        showError(null);
    }
    
    // Handle receiving messages from the extension
    window.addEventListener('message', event => {
        const message = event.data;
        
        switch (message.type) {
            case 'loading':
                showLoading(message.loading);
                break;
            case 'searchResults':
                displaySearchResults(message.results, message.query, message.language);
                break;
            case 'error':
                showError(message.message);
                break;
        }
    });
    
    // Display search results
    function displaySearchResults(results, query, language) {
        // Hide loading indicator
        showLoading(false);
        
        // Clear previous results
        resultsContainer.innerHTML = '';
        
        if (results.length === 0) {
            // Show empty state
            emptyState.style.display = 'flex';
            emptyState.innerHTML = `<p>No code examples found for "${query}"${language ? ` in ${language}` : ''}</p>`;
            return;
        }
        
        // Hide empty state
        emptyState.style.display = 'none';
        
        // Create elements for each result
        results.forEach(example => {
            const card = document.createElement('div');
            card.className = 'code-example-card';
            
            // Header
            const header = document.createElement('div');
            header.className = 'code-example-header';
            
            const titleInfo = document.createElement('div');
            
            const title = document.createElement('div');
            title.className = 'code-example-title';
            title.textContent = example.title;
            
            const sourceElement = document.createElement('div');
            sourceElement.className = 'code-example-source';
            
            const sourceLink = document.createElement('a');
            sourceLink.href = example.source.url;
            sourceLink.textContent = example.source.name;
            sourceLink.title = 'View source on GitHub';
            sourceLink.addEventListener('click', event => {
                event.preventDefault();
                vscode.postMessage({
                    type: 'openLink',
                    url: example.source.url
                });
            });
            
            sourceElement.appendChild(document.createTextNode('Source: '));
            sourceElement.appendChild(sourceLink);
            
            titleInfo.appendChild(title);
            titleInfo.appendChild(sourceElement);
            
            const metaInfo = document.createElement('div');
            metaInfo.style.display = 'flex';
            metaInfo.style.flexDirection = 'column';
            metaInfo.style.alignItems = 'flex-end';
            
            if (example.language) {
                const language = document.createElement('div');
                language.className = 'code-example-language';
                language.textContent = example.language;
                metaInfo.appendChild(language);
            }
            
            if (example.stars !== undefined) {
                const stars = document.createElement('div');
                stars.className = 'code-example-stars';
                stars.textContent = example.stars;
                metaInfo.appendChild(stars);
            }
            
            header.appendChild(titleInfo);
            header.appendChild(metaInfo);
            
            // Content
            const content = document.createElement('div');
            content.className = 'code-example-content';
            
            const pre = document.createElement('pre');
            pre.textContent = example.code;
            content.appendChild(pre);
            
            // Actions
            const actions = document.createElement('div');
            actions.className = 'code-example-actions';
            
            const copyButton = document.createElement('button');
            copyButton.className = 'action-button';
            copyButton.textContent = 'Copy';
            copyButton.addEventListener('click', () => {
                vscode.postMessage({
                    type: 'copy',
                    code: example.code
                });
            });
            
            const insertButton = document.createElement('button');
            insertButton.className = 'action-button insert-button';
            insertButton.textContent = 'Insert';
            insertButton.addEventListener('click', () => {
                vscode.postMessage({
                    type: 'insert',
                    code: example.code
                });
            });
            
            actions.appendChild(copyButton);
            actions.appendChild(insertButton);
            
            // Add all elements to card
            card.appendChild(header);
            card.appendChild(content);
            card.appendChild(actions);
            
            // Add card to results container
            resultsContainer.appendChild(card);
        });
    }
    
    // Show/hide loading indicator
    function showLoading(loading) {
        if (loading) {
            loadingIndicator.classList.remove('hidden');
            emptyState.style.display = 'none';
        } else {
            loadingIndicator.classList.add('hidden');
        }
    }
    
    // Show/hide error message
    function showError(errorText) {
        if (errorText) {
            errorContainer.classList.remove('hidden');
            errorMessage.textContent = errorText;
        } else {
            errorContainer.classList.add('hidden');
        }
    }
})();
