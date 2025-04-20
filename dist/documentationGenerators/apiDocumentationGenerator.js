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
exports.ApiDocumentationGenerator = exports.ApiDocFormat = void 0;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const os = __importStar(require("os"));
/**
 * Format options for API documentation
 */
var ApiDocFormat;
(function (ApiDocFormat) {
    ApiDocFormat["MARKDOWN"] = "markdown";
    ApiDocFormat["HTML"] = "html";
    ApiDocFormat["JSON"] = "json";
    ApiDocFormat["YAML"] = "yaml";
    ApiDocFormat["OPENAPI"] = "openapi";
})(ApiDocFormat || (exports.ApiDocFormat = ApiDocFormat = {}));
/**
 * API Documentation Generator class
 * Generates API documentation from source code
 */
class ApiDocumentationGenerator {
    context;
    llmProvider;
    outputDir = '';
    /**
     * Constructor for API Documentation Generator
     * @param context The VSCode extension context
     * @param llmProvider The LLM provider to use for generating documentation
     */
    constructor(context, llmProvider) {
        this.context = context;
        this.llmProvider = llmProvider;
        this.registerCommands();
    }
    /**
     * Register commands for API documentation generation
     */
    registerCommands() {
        // Command to generate API documentation for a file
        this.context.subscriptions.push(vscode.commands.registerCommand('localLLMAgent.generateDocumentation.apiFile', async () => await this.generateApiDocForFile()));
        // Command to generate API documentation for a project
        this.context.subscriptions.push(vscode.commands.registerCommand('localLLMAgent.generateDocumentation.apiProject', async () => await this.generateApiDocForProject()));
        // Command to generate OpenAPI specification
        this.context.subscriptions.push(vscode.commands.registerCommand('localLLMAgent.generateDocumentation.openapi', async () => await this.generateOpenApiSpec()));
    }
    /**
     * Generate API documentation for the current file
     */
    async generateApiDocForFile() {
        try {
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                vscode.window.showErrorMessage('No active editor found');
                return;
            }
            const document = editor.document;
            const fileContent = document.getText();
            const filePath = document.uri.fsPath;
            const fileName = path.basename(filePath);
            const fileExt = path.extname(filePath).toLowerCase();
            // Check if file is a valid source file
            const supportedExtensions = ['.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.cs', '.go', '.php', '.rb'];
            if (!supportedExtensions.includes(fileExt)) {
                vscode.window.showWarningMessage(`File type ${fileExt} is not supported for API documentation generation`);
                return;
            }
            // Ask for output format
            const formatOptions = Object.values(ApiDocFormat);
            const selectedFormat = await vscode.window.showQuickPick(formatOptions, {
                placeHolder: 'Select API documentation format'
            });
            if (!selectedFormat) {
                return; // User cancelled
            }
            vscode.window.showInformationMessage(`Generating API documentation for ${fileName}...`);
            // Create prompt based on file language and selected format
            const prompt = this.createApiDocPrompt(fileContent, fileExt, selectedFormat);
            const apiDoc = await this.llmProvider.sendPrompt(prompt);
            if (apiDoc) {
                // Show documentation in a new document
                const docLang = this.getLanguageIdForFormat(selectedFormat);
                const doc = await vscode.workspace.openTextDocument({
                    content: apiDoc,
                    language: docLang
                });
                await vscode.window.showTextDocument(doc, { viewColumn: vscode.ViewColumn.Beside });
                // Ask if user wants to save the documentation
                const saveAction = await vscode.window.showInformationMessage('API documentation generated. Do you want to save it?', 'Save', 'Save As', 'No');
                if (saveAction === 'Save' || saveAction === 'Save As') {
                    await this.saveDocumentation(apiDoc, fileName, selectedFormat, saveAction === 'Save As');
                }
                vscode.window.showInformationMessage('API documentation generated successfully');
            }
            else {
                vscode.window.showErrorMessage('Failed to generate API documentation');
            }
        }
        catch (error) {
            vscode.window.showErrorMessage(`Error generating API documentation: ${error}`);
        }
    }
    /**
     * Generate API documentation for the entire project
     */
    async generateApiDocForProject() {
        try {
            const workspaceFolders = vscode.workspace.workspaceFolders;
            if (!workspaceFolders) {
                vscode.window.showErrorMessage('No workspace folder open');
                return;
            }
            // Ask for output format
            const formatOptions = Object.values(ApiDocFormat);
            const selectedFormat = await vscode.window.showQuickPick(formatOptions, {
                placeHolder: 'Select API documentation format'
            });
            if (!selectedFormat) {
                return; // User cancelled
            }
            // Ask for output directory
            const projectRoot = workspaceFolders[0].uri.fsPath;
            const defaultDocsDir = path.join(projectRoot, 'docs', 'api');
            const createDocsDir = await vscode.window.showQuickPick(['Yes', 'No'], {
                placeHolder: `Create docs directory at ${defaultDocsDir}?`
            });
            if (createDocsDir === 'Yes') {
                this.outputDir = defaultDocsDir;
                // Create directory if it doesn't exist
                if (!fs.existsSync(this.outputDir)) {
                    fs.mkdirSync(this.outputDir, { recursive: true });
                }
            }
            else if (createDocsDir === 'No') {
                const options = {
                    canSelectFiles: false,
                    canSelectFolders: true,
                    canSelectMany: false,
                    openLabel: 'Select Output Directory'
                };
                const selectedDirs = await vscode.window.showOpenDialog(options);
                if (selectedDirs && selectedDirs.length > 0) {
                    this.outputDir = selectedDirs[0].fsPath;
                }
                else {
                    return; // User cancelled
                }
            }
            else {
                return; // User cancelled
            }
            // Get source files based on preferred languages
            const filesToProcess = await this.getProjectSourceFiles(projectRoot);
            if (filesToProcess.length === 0) {
                vscode.window.showInformationMessage('No source files found to process');
                return;
            }
            // Show progress indicator
            vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: "Generating API Documentation",
                cancellable: true
            }, async (progress, token) => {
                const totalFiles = filesToProcess.length;
                let processedFiles = 0;
                const incrementValue = 100 / totalFiles;
                // Create index file contents based on format
                let indexContent = '';
                if (selectedFormat === ApiDocFormat.MARKDOWN) {
                    indexContent = `# API Documentation\n\n## Table of Contents\n\n`;
                }
                else if (selectedFormat === ApiDocFormat.HTML) {
                    indexContent = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>API Documentation</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        h1 { color: #333; }
        .toc { margin-bottom: 30px; }
        .toc ul { list-style-type: none; padding-left: 20px; }
        .toc li { margin: 5px 0; }
    </style>
</head>
<body>
    <h1>API Documentation</h1>
    <div class="toc">
        <h2>Table of Contents</h2>
        <ul>`;
                }
                for (const file of filesToProcess) {
                    if (token.isCancellationRequested) {
                        vscode.window.showInformationMessage('Documentation generation cancelled');
                        return;
                    }
                    const fileName = path.basename(file);
                    const fileExt = path.extname(file).toLowerCase();
                    progress.report({
                        message: `Processing ${fileName} (${processedFiles + 1}/${totalFiles})`,
                        increment: incrementValue
                    });
                    try {
                        const fileContent = fs.readFileSync(file, 'utf8');
                        // Create prompt for this file
                        const prompt = this.createApiDocPrompt(fileContent, fileExt, selectedFormat);
                        const apiDoc = await this.llmProvider.sendPrompt(prompt);
                        if (apiDoc) {
                            // Create output filename
                            const relativePath = path.relative(projectRoot, file);
                            const safeFileName = relativePath.replace(/[\/\\]/g, '_');
                            const outputExt = this.getFileExtensionForFormat(selectedFormat);
                            const outputFileName = `${path.parse(safeFileName).name}${outputExt}`;
                            const outputPath = path.join(this.outputDir, outputFileName);
                            // Write documentation file
                            fs.writeFileSync(outputPath, apiDoc, 'utf8');
                            // Add to index
                            const displayName = relativePath;
                            if (selectedFormat === ApiDocFormat.MARKDOWN) {
                                indexContent += `- [${displayName}](${outputFileName})\n`;
                            }
                            else if (selectedFormat === ApiDocFormat.HTML) {
                                indexContent += `            <li><a href="${outputFileName}">${displayName}</a></li>\n`;
                            }
                        }
                    }
                    catch (error) {
                        console.error(`Error processing ${file}:`, error);
                    }
                    processedFiles++;
                }
                // Finalize and write index file
                if (selectedFormat === ApiDocFormat.HTML) {
                    indexContent += `        </ul>
    </div>
</body>
</html>`;
                }
                const indexFileName = selectedFormat === ApiDocFormat.HTML ? 'index.html' : 'index.md';
                fs.writeFileSync(path.join(this.outputDir, indexFileName), indexContent, 'utf8');
                // Open the index file
                const indexUri = vscode.Uri.file(path.join(this.outputDir, indexFileName));
                await vscode.commands.executeCommand('vscode.open', indexUri);
                vscode.window.showInformationMessage(`API documentation generated for ${processedFiles} files`);
            });
        }
        catch (error) {
            vscode.window.showErrorMessage(`Error generating project API documentation: ${error}`);
        }
    }
    /**
     * Generate OpenAPI specification for a REST API project
     */
    async generateOpenApiSpec() {
        try {
            const workspaceFolders = vscode.workspace.workspaceFolders;
            if (!workspaceFolders) {
                vscode.window.showErrorMessage('No workspace folder open');
                return;
            }
            const projectRoot = workspaceFolders[0].uri.fsPath;
            // Ask for OpenAPI version
            const versionOptions = ['OpenAPI 3.0', 'OpenAPI 3.1', 'Swagger 2.0'];
            const selectedVersion = await vscode.window.showQuickPick(versionOptions, {
                placeHolder: 'Select OpenAPI specification version'
            });
            if (!selectedVersion) {
                return; // User cancelled
            }
            // Ask for output format
            const formatOptions = ['JSON', 'YAML'];
            const selectedFormat = await vscode.window.showQuickPick(formatOptions, {
                placeHolder: 'Select output format'
            });
            if (!selectedFormat) {
                return; // User cancelled
            }
            // Ask for basic API information
            const apiInfo = await this.collectApiInfo();
            if (!apiInfo) {
                return; // User cancelled
            }
            // Find relevant API files
            const apiFiles = await this.findApiFiles(projectRoot);
            if (apiFiles.length === 0) {
                vscode.window.showWarningMessage('No API endpoint files found. Generating basic OpenAPI spec.');
            }
            vscode.window.showInformationMessage('Analyzing API code and generating OpenAPI specification...');
            // Create combined content from all API files
            let combinedApiCode = '';
            for (const file of apiFiles) {
                const content = fs.readFileSync(file, 'utf8');
                combinedApiCode += `\n// FILE: ${path.relative(projectRoot, file)}\n${content}\n`;
            }
            // Create prompt for OpenAPI generation
            const prompt = this.createOpenApiPrompt(combinedApiCode, apiInfo, selectedVersion, selectedFormat);
            const openApiSpec = await this.llmProvider.sendPrompt(prompt);
            if (openApiSpec) {
                // Create output file
                const ext = selectedFormat.toLowerCase() === 'json' ? '.json' : '.yaml';
                const outputFileName = `openapi${ext}`;
                const outputPath = path.join(projectRoot, outputFileName);
                // Check if file already exists
                if (fs.existsSync(outputPath)) {
                    const action = await vscode.window.showWarningMessage(`${outputFileName} already exists. What would you like to do?`, 'Overwrite', 'Save As', 'Cancel');
                    if (action === 'Cancel') {
                        return;
                    }
                    else if (action === 'Save As') {
                        const uri = await vscode.window.showSaveDialog({
                            defaultUri: vscode.Uri.file(outputPath),
                            filters: {
                                'OpenAPI': [ext.substring(1)]
                            }
                        });
                        if (uri) {
                            fs.writeFileSync(uri.fsPath, openApiSpec, 'utf8');
                            await vscode.commands.executeCommand('vscode.open', uri);
                        }
                        return;
                    }
                }
                // Write and open the file
                fs.writeFileSync(outputPath, openApiSpec, 'utf8');
                const uri = vscode.Uri.file(outputPath);
                await vscode.commands.executeCommand('vscode.open', uri);
                vscode.window.showInformationMessage(`OpenAPI specification saved to ${outputFileName}`);
                // Ask if user wants to preview with Swagger UI
                const previewAction = await vscode.window.showInformationMessage('Would you like to preview the OpenAPI specification in Swagger UI?', 'Yes', 'No');
                if (previewAction === 'Yes') {
                    // Create a temp HTML file with Swagger UI and open it
                    const swaggerUiHtml = this.generateSwaggerUiHtml(outputFileName);
                    const tempDir = path.join(os.tmpdir(), 'vscode-api-doc-preview');
                    if (!fs.existsSync(tempDir)) {
                        fs.mkdirSync(tempDir, { recursive: true });
                    }
                    const htmlPath = path.join(tempDir, 'swagger-preview.html');
                    fs.writeFileSync(htmlPath, swaggerUiHtml, 'utf8');
                    // Copy the OpenAPI file to the temp directory
                    fs.copyFileSync(outputPath, path.join(tempDir, outputFileName));
                    // Open the HTML file in the default browser
                    vscode.env.openExternal(vscode.Uri.file(htmlPath));
                }
            }
            else {
                vscode.window.showErrorMessage('Failed to generate OpenAPI specification');
            }
        }
        catch (error) {
            vscode.window.showErrorMessage(`Error generating OpenAPI specification: ${error}`);
        }
    }
    /**
     * Get source files from the project based on language preferences
     * @param projectRoot The root path of the project
     * @returns Array of file paths
     */
    async getProjectSourceFiles(projectRoot) {
        const config = vscode.workspace.getConfiguration('localLLMAgent.documentation.api');
        const includeJs = config.get('includeJavaScript', true);
        const includeTs = config.get('includeTypeScript', true);
        const includePy = config.get('includePython', false);
        const includeJava = config.get('includeJava', false);
        const includeCs = config.get('includeCSharp', false);
        const includeGo = config.get('includeGo', false);
        const patterns = [];
        if (includeJs)
            patterns.push('**/*.js', '**/*.jsx');
        if (includeTs)
            patterns.push('**/*.ts', '**/*.tsx');
        if (includePy)
            patterns.push('**/*.py');
        if (includeJava)
            patterns.push('**/*.java');
        if (includeCs)
            patterns.push('**/*.cs');
        if (includeGo)
            patterns.push('**/*.go');
        const excludePatterns = [
            '**/node_modules/**',
            '**/dist/**',
            '**/build/**',
            '**/coverage/**',
            '**/test/**',
            '**/tests/**',
            '**/*.test.*',
            '**/*.spec.*',
            '**/*.min.*'
        ];
        const files = [];
        for (const pattern of patterns) {
            const uris = await vscode.workspace.findFiles(pattern, `{${excludePatterns.join(',')}}`);
            for (const uri of uris) {
                files.push(uri.fsPath);
            }
        }
        return files;
    }
    /**
     * Find API-related files in the project
     * @param projectRoot The root path of the project
     * @returns Array of API file paths
     */
    async findApiFiles(projectRoot) {
        // Look for common API file patterns
        const apiPatterns = [
            '**/api/**/*.{js,ts,jsx,tsx,py,java,cs,go}',
            '**/controllers/**/*.{js,ts,jsx,tsx,py,java,cs,go}',
            '**/routes/**/*.{js,ts,jsx,tsx,py,java,cs,go}',
            '**/endpoints/**/*.{js,ts,jsx,tsx,py,java,cs,go}',
            '**/*api*.{js,ts,jsx,tsx,py,java,cs,go}',
            '**/*controller*.{js,ts,jsx,tsx,py,java,cs,go}',
            '**/*route*.{js,ts,jsx,tsx,py,java,cs,go}',
            '**/*endpoint*.{js,ts,jsx,tsx,py,java,cs,go}'
        ];
        const excludePatterns = [
            '**/node_modules/**',
            '**/dist/**',
            '**/build/**',
            '**/coverage/**'
        ];
        const apiFiles = [];
        for (const pattern of apiPatterns) {
            const uris = await vscode.workspace.findFiles(pattern, `{${excludePatterns.join(',')}}`);
            for (const uri of uris) {
                apiFiles.push(uri.fsPath);
            }
        }
        return Array.from(new Set(apiFiles)); // Remove duplicates
    }
    /**
     * Collect basic API information from the user
     * @returns API information object or undefined if cancelled
     */
    async collectApiInfo() {
        const apiTitle = await vscode.window.showInputBox({
            prompt: 'Enter API title',
            placeHolder: 'My API',
            value: 'My API'
        });
        if (apiTitle === undefined) {
            return undefined; // User cancelled
        }
        const apiDescription = await vscode.window.showInputBox({
            prompt: 'Enter API description',
            placeHolder: 'Description of the API',
            value: 'API Documentation generated by Local LLM Agent'
        });
        if (apiDescription === undefined) {
            return undefined; // User cancelled
        }
        const apiVersion = await vscode.window.showInputBox({
            prompt: 'Enter API version',
            placeHolder: '1.0.0',
            value: '1.0.0'
        });
        if (apiVersion === undefined) {
            return undefined; // User cancelled
        }
        const apiBasePath = await vscode.window.showInputBox({
            prompt: 'Enter API base path',
            placeHolder: '/api',
            value: '/api'
        });
        if (apiBasePath === undefined) {
            return undefined; // User cancelled
        }
        return {
            title: apiTitle,
            description: apiDescription,
            version: apiVersion,
            basePath: apiBasePath
        };
    }
    /**
     * Create a prompt for API documentation generation
     * @param code The source code to document
     * @param fileExt The file extension to determine language
     * @param format The desired output format
     * @returns Prompt for the LLM
     */
    createApiDocPrompt(code, fileExt, format) {
        // Determine language based on file extension
        let language = 'JavaScript';
        if (fileExt === '.ts' || fileExt === '.tsx') {
            language = 'TypeScript';
        }
        else if (fileExt === '.py') {
            language = 'Python';
        }
        else if (fileExt === '.java') {
            language = 'Java';
        }
        else if (fileExt === '.cs') {
            language = 'C#';
        }
        else if (fileExt === '.go') {
            language = 'Go';
        }
        else if (fileExt === '.php') {
            language = 'PHP';
        }
        else if (fileExt === '.rb') {
            language = 'Ruby';
        }
        // Create format-specific instructions
        let formatInstructions = '';
        if (format === ApiDocFormat.MARKDOWN) {
            formatInstructions = `
- Use Markdown format with headers and code blocks
- Use ## for main sections and ### for subsections
- Document each function/method under its own header
- Use code blocks with the appropriate language syntax highlighting
- Include parameter tables with | Name | Type | Description | format
- Add "Returns" section for return values
- Add "Example" sections where appropriate`;
        }
        else if (format === ApiDocFormat.HTML) {
            formatInstructions = `
- Generate valid HTML with proper formatting
- Use <h2> for main sections and <h3> for subsections
- Use <code> and <pre> tags for code examples
- Use <table> for parameters and return values
- Include a table of contents at the top with anchor links
- Use CSS classes for styling (you can define simple styles in a <style> tag)`;
        }
        else if (format === ApiDocFormat.JSON || format === ApiDocFormat.YAML) {
            formatInstructions = `
- Generate valid ${format.toUpperCase()} that could be consumed by documentation tools
- Include these key properties for each API element:
  - name: Name of the function/class/method
  - description: Description of what it does
  - parameters: Array of parameter objects with name, type, description
  - returns: Description of return value with type
  - examples: Array of example code snippets (if applicable)
  - deprecated: Boolean indicating if deprecated (if applicable)
  - since: Version when introduced (if known)`;
        }
        else if (format === ApiDocFormat.OPENAPI) {
            formatInstructions = `
- Generate OpenAPI 3.0 specification in YAML format
- Focus on extracting API endpoints if this appears to be a REST API
- Include paths, methods, request parameters, request bodies, and responses
- Define schemas for request and response objects
- Add examples where appropriate`;
        }
        return `Generate comprehensive API documentation for the following ${language} code in ${format.toUpperCase()} format:

\`\`\`${language.toLowerCase()}
${code}
\`\`\`

Instructions:
- Document all public APIs, classes, methods, and functions
- Include descriptions of what each element does
- Document parameters with names, types, and descriptions
- Document return values with types and descriptions
- Note any exceptions or errors that might be thrown
- Include any important usage notes or warnings
${formatInstructions}

The documentation should be comprehensive and clear, intended for developers who will use this API.`;
    }
    /**
     * Create a prompt for OpenAPI specification generation
     * @param apiCode Combined API code
     * @param apiInfo Basic API information
     * @param version OpenAPI version
     * @param format Output format (JSON or YAML)
     * @returns Prompt for the LLM
     */
    createOpenApiPrompt(apiCode, apiInfo, version, format) {
        return `Generate a comprehensive ${version} specification in ${format} format for the following API code:

\`\`\`
${apiCode}
\`\`\`

API Information:
- Title: ${apiInfo.title}
- Description: ${apiInfo.description}
- Version: ${apiInfo.version}
- Base Path: ${apiInfo.basePath}

Instructions:
- Analyze the code to identify API endpoints, request methods, parameters, and response schemas
- Generate a complete ${version} specification
- Include paths for all API endpoints
- Define request parameters, request bodies, and response schemas
- Add examples for request/response pairs
- Include appropriate status codes for responses
- Add detailed descriptions for all components
- Ensure the output is valid ${format} that conforms to the ${version} specification

If the code doesn't contain clear API endpoints, create a reasonable API specification based on the functions and data structures in the code.

Generate ONLY the ${version} specification in ${format} format, without additional explanations.`;
    }
    /**
     * Save the generated documentation to a file
     * @param content The documentation content
     * @param sourceName The source file name
     * @param format The documentation format
     * @param useDialog Whether to show a save dialog
     */
    async saveDocumentation(content, sourceName, format, useDialog) {
        try {
            const workspaceFolders = vscode.workspace.workspaceFolders;
            if (!workspaceFolders) {
                vscode.window.showErrorMessage('No workspace folder open');
                return;
            }
            const ext = this.getFileExtensionForFormat(format);
            const baseName = path.parse(sourceName).name;
            const defaultFileName = `${baseName}-api-docs${ext}`;
            const defaultPath = path.join(workspaceFolders[0].uri.fsPath, 'docs', defaultFileName);
            let savePath;
            if (useDialog) {
                const uri = await vscode.window.showSaveDialog({
                    defaultUri: vscode.Uri.file(defaultPath),
                    filters: {
                        'Documentation': [ext.substring(1)]
                    }
                });
                if (uri) {
                    savePath = uri.fsPath;
                }
                else {
                    return; // User cancelled
                }
            }
            else {
                // Ensure docs directory exists
                const docsDir = path.join(workspaceFolders[0].uri.fsPath, 'docs');
                if (!fs.existsSync(docsDir)) {
                    fs.mkdirSync(docsDir, { recursive: true });
                }
                savePath = defaultPath;
            }
            if (savePath) {
                fs.writeFileSync(savePath, content, 'utf8');
                vscode.window.showInformationMessage(`Documentation saved to ${path.basename(savePath)}`);
                // Open the saved file
                const uri = vscode.Uri.file(savePath);
                await vscode.commands.executeCommand('vscode.open', uri);
            }
        }
        catch (error) {
            vscode.window.showErrorMessage(`Error saving documentation: ${error}`);
        }
    }
    /**
     * Get the file extension for a given documentation format
     * @param format The documentation format
     * @returns The appropriate file extension
     */
    getFileExtensionForFormat(format) {
        switch (format.toLowerCase()) {
            case ApiDocFormat.HTML:
                return '.html';
            case ApiDocFormat.JSON:
                return '.json';
            case ApiDocFormat.YAML:
                return '.yaml';
            case ApiDocFormat.OPENAPI:
                return '.yaml';
            case ApiDocFormat.MARKDOWN:
            default:
                return '.md';
        }
    }
    /**
     * Get the language ID for a given documentation format
     * @param format The documentation format
     * @returns The VSCode language ID
     */
    getLanguageIdForFormat(format) {
        switch (format.toLowerCase()) {
            case ApiDocFormat.HTML:
                return 'html';
            case ApiDocFormat.JSON:
                return 'json';
            case ApiDocFormat.YAML:
            case ApiDocFormat.OPENAPI:
                return 'yaml';
            case ApiDocFormat.MARKDOWN:
            default:
                return 'markdown';
        }
    }
    /**
     * Generate HTML with Swagger UI for previewing OpenAPI specifications
     * @param specFile The filename of the OpenAPI specification
     * @returns HTML content for Swagger UI
     */
    generateSwaggerUiHtml(specFile) {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Swagger UI</title>
    <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@4.5.0/swagger-ui.css" />
    <style>
        html { box-sizing: border-box; overflow: -moz-scrollbars-vertical; overflow-y: scroll; }
        *, *:before, *:after { box-sizing: inherit; }
        body { margin: 0; background: #fafafa; }
    </style>
</head>
<body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@4.5.0/swagger-ui-bundle.js"></script>
    <script src="https://unpkg.com/swagger-ui-dist@4.5.0/swagger-ui-standalone-preset.js"></script>
    <script>
        window.onload = function() {
            window.ui = SwaggerUIBundle({
                url: "${specFile}",
                dom_id: '#swagger-ui',
                deepLinking: true,
                presets: [
                    SwaggerUIBundle.presets.apis,
                    SwaggerUIStandalonePreset
                ],
                layout: "StandaloneLayout"
            });
        };
    </script>
</body>
</html>`;
    }
}
exports.ApiDocumentationGenerator = ApiDocumentationGenerator;
//# sourceMappingURL=apiDocumentationGenerator.js.map