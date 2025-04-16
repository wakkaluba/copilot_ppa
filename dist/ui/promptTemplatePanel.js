"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromptTemplatePanel = void 0;
const vscode = __importStar(require("vscode"));
const manager_1 = require("../services/promptTemplates/manager");
class PromptTemplatePanel {
    static createOrShow(extensionUri) {
        const column = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;
        // If we already have a panel, show it.
        // Otherwise, create a new panel.
        const panel = vscode.window.createWebviewPanel(PromptTemplatePanel.viewType, 'Prompt Templates', column || vscode.ViewColumn.One, {
            enableScripts: true,
            localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'media')]
        });
        return new PromptTemplatePanel(panel, extensionUri);
    }
    constructor(panel, extensionUri) {
        this._disposables = [];
        this._panel = panel;
        // Set the webview's initial html content
        this._update();
        // Listen for when the panel is disposed
        // This happens when the user closes the panel or when the panel is closed programmatically
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
        // Update the content based on view changes
        this._panel.onDidChangeViewState(e => {
            if (this._panel.visible) {
                this._update();
            }
        }, null, this._disposables);
        // Handle messages from the webview
        this._panel.webview.onDidReceiveMessage(async (message) => {
            const templateManager = (0, manager_1.getPromptTemplateManager)();
            switch (message.command) {
                case 'getTemplates':
                    this._panel.webview.postMessage({
                        command: 'templatesLoaded',
                        templates: templateManager.getAllTemplates()
                    });
                    return;
                case 'getCategories':
                    this._panel.webview.postMessage({
                        command: 'categoriesLoaded',
                        categories: templateManager.getAllCategories()
                    });
                    return;
                case 'getTags':
                    this._panel.webview.postMessage({
                        command: 'tagsLoaded',
                        tags: templateManager.getAllTags()
                    });
                    return;
                case 'createTemplate':
                    try {
                        const newTemplate = message.template;
                        const created = templateManager.createTemplate(newTemplate);
                        this._panel.webview.postMessage({
                            command: 'templateCreated',
                            template: created
                        });
                        vscode.window.showInformationMessage(`Template "${created.name}" created`);
                    }
                    catch (error) {
                        vscode.window.showErrorMessage(`Failed to create template: ${error.message}`);
                    }
                    return;
                case 'updateTemplate':
                    try {
                        const { id, updates } = message;
                        const updated = templateManager.updateTemplate(id, updates);
                        if (updated) {
                            this._panel.webview.postMessage({
                                command: 'templateUpdated',
                                template: updated
                            });
                            vscode.window.showInformationMessage(`Template "${updated.name}" updated`);
                        }
                        else {
                            vscode.window.showErrorMessage(`Template not found: ${id}`);
                        }
                    }
                    catch (error) {
                        vscode.window.showErrorMessage(`Failed to update template: ${error.message}`);
                    }
                    return;
                case 'deleteTemplate':
                    try {
                        const { id } = message;
                        const success = templateManager.deleteTemplate(id);
                        this._panel.webview.postMessage({
                            command: 'templateDeleted',
                            id,
                            success
                        });
                        if (success) {
                            vscode.window.showInformationMessage('Template deleted');
                        }
                        else {
                            vscode.window.showErrorMessage(`Template not found: ${id}`);
                        }
                    }
                    catch (error) {
                        vscode.window.showErrorMessage(`Failed to delete template: ${error.message}`);
                    }
                    return;
                case 'cloneTemplate':
                    try {
                        const { id, newName } = message;
                        const cloned = templateManager.cloneTemplate(id, newName);
                        if (cloned) {
                            this._panel.webview.postMessage({
                                command: 'templateCreated',
                                template: cloned
                            });
                            vscode.window.showInformationMessage(`Template "${cloned.name}" created as a copy`);
                        }
                        else {
                            vscode.window.showErrorMessage(`Template not found: ${id}`);
                        }
                    }
                    catch (error) {
                        vscode.window.showErrorMessage(`Failed to clone template: ${error.message}`);
                    }
                    return;
                case 'exportTemplates':
                    try {
                        const { templateIds } = message;
                        const json = templateManager.exportTemplates(templateIds);
                        // Save to file
                        const saveUri = await vscode.window.showSaveDialog({
                            defaultUri: vscode.Uri.file('prompt-templates.json'),
                            filters: { 'JSON': ['json'] }
                        });
                        if (saveUri) {
                            await vscode.workspace.fs.writeFile(saveUri, Buffer.from(json, 'utf8'));
                            vscode.window.showInformationMessage(`Templates exported to ${saveUri.fsPath}`);
                        }
                    }
                    catch (error) {
                        vscode.window.showErrorMessage(`Failed to export templates: ${error.message}`);
                    }
                    return;
                case 'importTemplates':
                    try {
                        // Open file picker
                        const fileUri = await vscode.window.showOpenDialog({
                            canSelectFiles: true,
                            canSelectFolders: false,
                            canSelectMany: false,
                            filters: { 'JSON': ['json'] }
                        });
                        if (fileUri && fileUri.length > 0) {
                            const fileContent = await vscode.workspace.fs.readFile(fileUri[0]);
                            const json = Buffer.from(fileContent).toString('utf8');
                            const result = templateManager.importTemplates(json);
                            this._panel.webview.postMessage({
                                command: 'templatesImported',
                                success: result.success,
                                failed: result.failed
                            });
                            vscode.window.showInformationMessage(`Imported ${result.success} templates (${result.failed} failed)`);
                            // Refresh templates
                            this._panel.webview.postMessage({
                                command: 'templatesLoaded',
                                templates: templateManager.getAllTemplates()
                            });
                        }
                    }
                    catch (error) {
                        vscode.window.showErrorMessage(`Failed to import templates: ${error.message}`);
                    }
                    return;
                case 'applyTemplate':
                    try {
                        const { id } = message;
                        await templateManager.applyTemplate(id);
                    }
                    catch (error) {
                        vscode.window.showErrorMessage(`Failed to apply template: ${error.message}`);
                    }
                    return;
            }
        }, null, this._disposables);
    }
    _update() {
        const webview = this._panel.webview;
        this._panel.title = "Prompt Templates";
        this._panel.webview.html = this._getHtmlForWebview(webview);
    }
    _getHtmlForWebview(webview) {
        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Prompt Templates</title>
            <style>
                body {
                    font-family: var(--vscode-font-family);
                    padding: 20px;
                    color: var(--vscode-foreground);
                }
                .container {
                    display: flex;
                    height: calc(100vh - 40px);
                }
                .sidebar {
                    width: 250px;
                    border-right: 1px solid var(--vscode-panel-border);
                    padding-right: 15px;
                    overflow-y: auto;
                }
                .content {
                    flex: 1;
                    padding-left: 20px;
                    overflow-y: auto;
                }
                .template-list {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                }
                .template-item {
                    padding: 8px 10px;
                    cursor: pointer;
                    border-radius: 4px;
                    margin-bottom: 4px;
                }
                .template-item:hover {
                    background-color: var(--vscode-list-hoverBackground);
                }
                .template-item.active {
                    background-color: var(--vscode-list-activeSelectionBackground);
                    color: var(--vscode-list-activeSelectionForeground);
                }
                .template-item.system {
                    font-style: italic;
                }
                .toolbar {
                    display: flex;
                    margin-bottom: 15px;
                    gap: 10px;
                }
                button {
                    padding: 6px 12px;
                    background-color: var(--vscode-button-background);
                    color: var(--vscode-button-foreground);
                    border: none;
                    border-radius: 2px;
                    cursor: pointer;
                }
                button:hover {
                    background-color: var(--vscode-button-hoverBackground);
                }
                button:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
                .form-group {
                    margin-bottom: 15px;
                }
                label {
                    display: block;
                    margin-bottom: 5px;
                }
                input, select, textarea {
                    width: 100%;
                    padding: 8px;
                    background-color: var(--vscode-input-background);
                    color: var(--vscode-input-foreground);
                    border: 1px solid var(--vscode-input-border);
                    border-radius: 2px;
                }
                textarea {
                    min-height: 150px;
                    font-family: var(--vscode-editor-font-family);
                }
                .tag-container {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 5px;
                    margin-top: 5px;
                }
                .tag {
                    background-color: var(--vscode-badge-background);
                    color: var(--vscode-badge-foreground);
                    padding: 3px 8px;
                    border-radius: 10px;
                    font-size: 12px;
                    display: inline-flex;
                    align-items: center;
                }
                .tag .remove {
                    margin-left: 5px;
                    cursor: pointer;
                }
                .categories {
                    margin-bottom: 20px;
                }
                .category-item {
                    padding: 5px 0;
                    cursor: pointer;
                }
                .category-item:hover {
                    text-decoration: underline;
                }
                .category-item.active {
                    font-weight: bold;
                }
                .form-buttons {
                    display: flex;
                    justify-content: flex-end;
                    gap: 10px;
                    margin-top: 20px;
                }
                .search {
                    margin-bottom: 15px;
                }
                .hidden {
                    display: none;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="sidebar">
                    <div class="search">
                        <input type="text" id="searchInput" placeholder="Search templates...">
                    </div>
                    
                    <div class="categories">
                        <h3>Categories</h3>
                        <div id="categoryList">
                            <div class="category-item active" data-category="all">All Templates</div>
                            <!-- Categories will be loaded here -->
                        </div>
                    </div>
                    
                    <div class="toolbar">
                        <button id="newTemplateBtn">New</button>
                        <button id="importBtn">Import</button>
                        <button id="exportBtn">Export</button>
                    </div>
                    
                    <ul class="template-list" id="templateList">
                        <!-- Templates will be loaded here -->
                    </ul>
                </div>
                
                <div class="content">
                    <div id="templateDetail" class="hidden">
                        <h2 id="detailTitle">Template Details</h2>
                        
                        <div class="toolbar">
                            <button id="editBtn">Edit</button>
                            <button id="cloneBtn">Clone</button>
                            <button id="deleteBtn">Delete</button>
                            <button id="applyBtn">Apply</button>
                        </div>
                        
                        <div id="viewMode">
                            <div class="form-group">
                                <label>Name:</label>
                                <div id="viewName"></div>
                            </div>
                            
                            <div class="form-group">
                                <label>Description:</label>
                                <div id="viewDescription"></div>
                            </div>
                            
                            <div class="form-group">
                                <label>Category:</label>
                                <div id="viewCategory"></div>
                            </div>
                            
                            <div class="form-group">
                                <label>Tags:</label>
                                <div id="viewTags" class="tag-container"></div>
                            </div>
                            
                            <div class="form-group">
                                <label>Template Content:</label>
                                <pre id="viewContent"></pre>
                            </div>
                        </div>
                        
                        <div id="editMode" class="hidden">
                            <div class="form-group">
                                <label for="editName">Name:</label>
                                <input type="text" id="editName" required>
                            </div>
                            
                            <div class="form-group">
                                <label for="editDescription">Description:</label>
                                <textarea id="editDescription"></textarea>
                            </div>
                            
                            <div class="form-group">
                                <label for="editCategory">Category:</label>
                                <input type="text" id="editCategory" list="categories" required>
                                <datalist id="categories">
                                    <!-- Categories will be loaded here -->
                                </datalist>
                            </div>
                            
                            <div class="form-group">
                                <label for="editTags">Tags (comma separated):</label>
                                <input type="text" id="editTags">
                                <div id="editTagsContainer" class="tag-container"></div>
                            </div>
                            
                            <div class="form-group">
                                <label for="editContent">Template Content:</label>
                                <textarea id="editContent" required></textarea>
                            </div>
                            
                            <div class="form-buttons">
                                <button id="cancelBtn">Cancel</button>
                                <button id="saveBtn">Save</button>
                            </div>
                        </div>
                    </div>
                    
                    <div id="emptyState">
                        <h2>Prompt Templates</h2>
                        <p>Select a template from the list or create a new one.</p>
                        <p>Templates help you quickly apply common prompts to your code.</p>
                        <button id="createFirstBtn">Create Your First Template</button>
                    </div>
                </div>
            </div>

            <script>
                (function() {
                    const vscode = acquireVsCodeApi();
                    
                    // State management
                    let templates = [];
                    let categories = [];
                    let tags = [];
                    let selectedTemplate = null;
                    let currentCategory = 'all';
                    let isEditMode = false;
                    
                    // DOM Elements
                    const templateList = document.getElementById('templateList');
                    const categoryList = document.getElementById('categoryList');
                    const searchInput = document.getElementById('searchInput');
                    const templateDetail = document.getElementById('templateDetail');
                    const emptyState = document.getElementById('emptyState');
                    const viewMode = document.getElementById('viewMode');
                    const editMode = document.getElementById('editMode');
                    
                    // Detail view elements
                    const viewName = document.getElementById('viewName');
                    const viewDescription = document.getElementById('viewDescription');
                    const viewCategory = document.getElementById('viewCategory');
                    const viewTags = document.getElementById('viewTags');
                    const viewContent = document.getElementById('viewContent');
                    
                    // Edit form elements
                    const editName = document.getElementById('editName');
                    const editDescription = document.getElementById('editDescription');
                    const editCategory = document.getElementById('editCategory');
                    const editTags = document.getElementById('editTags');
                    const editTagsContainer = document.getElementById('editTagsContainer');
                    const editContent = document.getElementById('editContent');
                    
                    // Button elements
                    const newTemplateBtn = document.getElementById('newTemplateBtn');
                    const importBtn = document.getElementById('importBtn');
                    const exportBtn = document.getElementById('exportBtn');
                    const editBtn = document.getElementById('editBtn');
                    const cloneBtn = document.getElementById('cloneBtn');
                    const deleteBtn = document.getElementById('deleteBtn');
                    const applyBtn = document.getElementById('applyBtn');
                    const saveBtn = document.getElementById('saveBtn');
                    const cancelBtn = document.getElementById('cancelBtn');
                    const createFirstBtn = document.getElementById('createFirstBtn');
                    
                    // Initialize
                    function initialize() {
                        vscode.postMessage({ command: 'getTemplates' });
                        vscode.postMessage({ command: 'getCategories' });
                        vscode.postMessage({ command: 'getTags' });
                        
                        bindEventListeners();
                    }
                    
                    // Bind event listeners
                    function bindEventListeners() {
                        // Button click handlers
                        newTemplateBtn.addEventListener('click', createNewTemplate);
                        importBtn.addEventListener('click', importTemplates);
                        exportBtn.addEventListener('click', exportTemplates);
                        editBtn.addEventListener('click', editTemplate);
                        cloneBtn.addEventListener('click', cloneTemplate);
                        deleteBtn.addEventListener('click', deleteTemplate);
                        applyBtn.addEventListener('click', applyTemplate);
                        saveBtn.addEventListener('click', saveTemplate);
                        cancelBtn.addEventListener('click', cancelEdit);
                        createFirstBtn.addEventListener('click', createNewTemplate);
                        
                        // Search input
                        searchInput.addEventListener('input', filterTemplates);
                    }
                    
                    // Handle messages from extension
                    window.addEventListener('message', event => {
                        const message = event.data;
                        
                        switch (message.command) {
                            case 'templatesLoaded':
                                templates = message.templates;
                                renderTemplateList();
                                break;
                                
                            case 'categoriesLoaded':
                                categories = message.categories;
                                renderCategoryList();
                                break;
                                
                            case 'tagsLoaded':
                                tags = message.tags;
                                break;
                                
                            case 'templateCreated':
                                templates.push(message.template);
                                selectTemplate(message.template.id);
                                renderTemplateList();
                                break;
                                
                            case 'templateUpdated':
                                const idx = templates.findIndex(t => t.id === message.template.id);
                                if (idx !== -1) {
                                    templates[idx] = message.template;
                                    selectTemplate(message.template.id);
                                }
                                renderTemplateList();
                                break;
                                
                            case 'templateDeleted':
                                if (message.success) {
                                    templates = templates.filter(t => t.id !== message.id);
                                    selectedTemplate = null;
                                    renderTemplateList();
                                    renderDetail();
                                }
                                break;
                        }
                    });
                    
                    // Render the template list
                    function renderTemplateList() {
                        templateList.innerHTML = '';
                        
                        // Filter templates by category and search term
                        let filteredTemplates = templates;
                        
                        if (currentCategory !== 'all') {
                            filteredTemplates = filteredTemplates.filter(t => t.category === currentCategory);
                        }
                        
                        const searchTerm = searchInput.value.toLowerCase();
                        if (searchTerm) {
                            filteredTemplates = filteredTemplates.filter(t => 
                                t.name.toLowerCase().includes(searchTerm) || 
                                t.description?.toLowerCase().includes(searchTerm) ||
                                t.category.toLowerCase().includes(searchTerm) ||
                                t.tags.some(tag => tag.toLowerCase().includes(searchTerm))
                            );
                        }
                        
                        // Sort templates by name
                        filteredTemplates.sort((a, b) => a.name.localeCompare(b.name));
                        
                        if (filteredTemplates.length === 0) {
                            const li = document.createElement('li');
                            li.textContent = 'No templates found';
                            templateList.appendChild(li);
                        } else {
                            filteredTemplates.forEach(template => {
                                const li = document.createElement('li');
                                li.className = 'template-item';
                                if (template.isSystem) {
                                    li.classList.add('system');
                                }
                                if (selectedTemplate && template.id === selectedTemplate.id) {
                                    li.classList.add('active');
                                }
                                li.textContent = template.name;
                                li.dataset.id = template.id;
                                li.addEventListener('click', () => selectTemplate(template.id));
                                templateList.appendChild(li);
                            });
                        }
                        
                        // Update UI state
                        if (templates.length === 0) {
                            templateDetail.classList.add('hidden');
                            emptyState.classList.remove('hidden');
                        } else {
                            emptyState.classList.add('hidden');
                            if (selectedTemplate) {
                                templateDetail.classList.remove('hidden');
                            }
                        }
                    }
                    
                    // Render the category list
                    function renderCategoryList() {
                        // Keep the "All Templates" category
                        const allCategory = categoryList.querySelector('[data-category="all"]');
                        categoryList.innerHTML = '';
                        categoryList.appendChild(allCategory);
                        
                        categories.forEach(category => {
                            const div = document.createElement('div');
                            div.className = 'category-item';
                            if (category === currentCategory) {
                                div.classList.add('active');
                            }
                            div.textContent = category;
                            div.dataset.category = category;
                            div.addEventListener('click', () => {
                                currentCategory = category;
                                // Update active class
                                document.querySelectorAll('.category-item').forEach(el => {
                                    el.classList.remove('active');
                                });
                                div.classList.add('active');
                                renderTemplateList();
                            });
                            categoryList.appendChild(div);
                        });
                        
                        // Also update the categories datalist
                        const categoriesDatalist = document.getElementById('categories');
                        categoriesDatalist.innerHTML = '';
                        categories.forEach(category => {
                            const option = document.createElement('option');
                            option.value = category;
                            categoriesDatalist.appendChild(option);
                        });
                    }
                    
                    // Select a template and show details
                    function selectTemplate(id) {
                        selectedTemplate = templates.find(t => t.id === id);
                        
                        // Update active class
                        document.querySelectorAll('.template-item').forEach(el => {
                            el.classList.remove('active');
                        });
                        const selectedItem = document.querySelector(\`.template-item[data-id="\${id}"]\`);
                        if (selectedItem) {
                            selectedItem.classList.add('active');
                        }
                        
                        renderDetail();
                    }
                    
                    // Render template details
                    function renderDetail() {
                        if (!selectedTemplate) {
                            templateDetail.classList.add('hidden');
                            return;
                        }
                        
                        templateDetail.classList.remove('hidden');
                        
                        // Set view mode values
                        viewName.textContent = selectedTemplate.name;
                        viewDescription.textContent = selectedTemplate.description || 'No description';
                        viewCategory.textContent = selectedTemplate.category;
                        
                        // Render tags
                        viewTags.innerHTML = '';
                        if (selectedTemplate.tags.length === 0) {
                            viewTags.textContent = 'No tags';
                        } else {
                            selectedTemplate.tags.forEach(tag => {
                                const tagEl = document.createElement('span');
                                tagEl.className = 'tag';
                                tagEl.textContent = tag;
                                viewTags.appendChild(tagEl);
                            });
                        }
                        
                        viewContent.textContent = selectedTemplate.content;
                        
                        // Set edit mode values
                        editName.value = selectedTemplate.name;
                        editDescription.value = selectedTemplate.description || '';
                        editCategory.value = selectedTemplate.category;
                        editTags.value = selectedTemplate.tags.join(', ');
                        editContent.value = selectedTemplate.content;
                        
                        // Enable/disable buttons based on system status
                        const isSystem = selectedTemplate.isSystem === true;
                        editBtn.disabled = isSystem;
                        deleteBtn.disabled = isSystem;
                        
                        // Show view mode
                        viewMode.classList.remove('hidden');
                        editMode.classList.add('hidden');
                        isEditMode = false;
                    }
                    
                    // Filter templates by search term
                    function filterTemplates() {
                        renderTemplateList();
                    }
                    
                    // Create a new template
                    function createNewTemplate() {
                        selectedTemplate = {
                            id: 'new',
                            name: '',
                            content: '',
                            description: '',
                            category: '',
                            tags: []
                        };
                        
                        // Clear form inputs
                        editName.value = '';
                        editDescription.value = '';
                        editCategory.value = '';
                        editTags.value = '';
                        editContent.value = '';
                        
                        // Show edit mode
                        templateDetail.classList.remove('hidden');
                        viewMode.classList.add('hidden');
                        editMode.classList.remove('hidden');
                        isEditMode = true;
                    }
                    
                    // Import templates
                    function importTemplates() {
                        vscode.postMessage({ command: 'importTemplates' });
                    }
                    
                    // Export templates
                    function exportTemplates() {
                        // If a template is selected, only export that one
                        const templateIds = selectedTemplate ? [selectedTemplate.id] : undefined;
                        vscode.postMessage({ 
                            command: 'exportTemplates',
                            templateIds
                        });
                    }
                    
                    // Edit the selected template
                    function editTemplate() {
                        if (!selectedTemplate || selectedTemplate.isSystem) {
                            return;
                        }
                        
                        viewMode.classList.add('hidden');
                        editMode.classList.remove('hidden');
                        isEditMode = true;
                    }
                    
                    // Clone the selected template
                    function cloneTemplate() {
                        if (!selectedTemplate) {
                            return;
                        }
                        
                        vscode.postMessage({
                            command: 'cloneTemplate',
                            id: selectedTemplate.id
                        });
                    }
                    
                    // Delete the selected template
                    function deleteTemplate() {
                        if (!selectedTemplate || selectedTemplate.isSystem) {
                            return;
                        }
                        
                        if (confirm(\`Are you sure you want to delete "\${selectedTemplate.name}"?\`)) {
                            vscode.postMessage({
                                command: 'deleteTemplate',
                                id: selectedTemplate.id
                            });
                        }
                    }
                    
                    // Apply the selected template
                    function applyTemplate() {
                        if (!selectedTemplate) {
                            return;
                        }
                        
                        vscode.postMessage({
                            command: 'applyTemplate',
                            id: selectedTemplate.id
                        });
                    }
                    
                    // Save the template being edited
                    function saveTemplate() {
                        // Validation
                        if (!editName.value.trim()) {
                            alert('Name is required');
                            return;
                        }
                        
                        if (!editCategory.value.trim()) {
                            alert('Category is required');
                            return;
                        }
                        
                        if (!editContent.value.trim()) {
                            alert('Template content is required');
                            return;
                        }
                        
                        // Parse tags
                        const tagList = editTags.value
                            .split(',')
                            .map(tag => tag.trim())
                            .filter(tag => tag.length > 0);
                        
                        if (selectedTemplate.id === 'new') {
                            // Create new template
                            vscode.postMessage({
                                command: 'createTemplate',
                                template: {
                                    name: editName.value.trim(),
                                    content: editContent.value,
                                    description: editDescription.value.trim(),
                                    category: editCategory.value.trim(),
                                    tags: tagList
                                }
                            });
                        } else {
                            // Update existing template
                            vscode.postMessage({
                                command: 'updateTemplate',
                                id: selectedTemplate.id,
                                updates: {
                                    name: editName.value.trim(),
                                    content: editContent.value,
                                    description: editDescription.value.trim(),
                                    category: editCategory.value.trim(),
                                    tags: tagList
                                }
                            });
                        }
                        
                        // Switch back to view mode
                        viewMode.classList.remove('hidden');
                        editMode.classList.add('hidden');
                        isEditMode = false;
                    }
                    
                    // Cancel editing
                    function cancelEdit() {
                        if (selectedTemplate.id === 'new') {
                            // For new templates, hide the detail view
                            templateDetail.classList.add('hidden');
                            selectedTemplate = null;
                        } else {
                            // For existing templates, switch back to view mode
                            viewMode.classList.remove('hidden');
                            editMode.classList.add('hidden');
                            isEditMode = false;
                        }
                    }
                    
                    // Initialize the UI
                    initialize();
                })();
            </script>
        </body>
        </html>`;
    }
    dispose() {
        // Clean up resources
        this._panel.dispose();
        while (this._disposables.length) {
            const x = this._disposables.pop();
            if (x) {
                x.dispose();
            }
        }
    }
}
exports.PromptTemplatePanel = PromptTemplatePanel;
PromptTemplatePanel.viewType = 'copilotPPA.promptTemplatePanel';
//# sourceMappingURL=promptTemplatePanel.js.map