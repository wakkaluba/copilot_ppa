import * as vscode from 'vscode';
import * as path from 'path';
import { LLMInterface } from '../llm/llmInterface';

/**
 * Class responsible for handling JSDoc/TSDoc generation and integration
 */
export class JSDocTSDocIntegration {
    private context: vscode.ExtensionContext;
    private llmProvider: LLMInterface;

    /**
     * Constructor for the JSDoc/TSDoc integration
     * @param context The VSCode extension context
     * @param llmProvider The LLM provider to use for generating documentation
     */
    constructor(context: vscode.ExtensionContext, llmProvider: LLMInterface) {
        this.context = context;
        this.llmProvider = llmProvider;
        
        this.registerCommands();
    }

    /**
     * Register commands for JSDoc/TSDoc generation
     */
    private registerCommands(): void {
        // Command to generate documentation for selection
        this.context.subscriptions.push(
            vscode.commands.registerCommand('localLLMAgent.generateDocumentation.selection', 
                async () => await this.generateDocumentationForSelection())
        );

        // Command to generate documentation for current file
        this.context.subscriptions.push(
            vscode.commands.registerCommand('localLLMAgent.generateDocumentation.file', 
                async () => await this.generateDocumentationForFile())
        );

        // Command to generate documentation for entire project
        this.context.subscriptions.push(
            vscode.commands.registerCommand('localLLMAgent.generateDocumentation.project', 
                async () => await this.generateDocumentationForProject())
        );
    }

    /**
     * Generate documentation for the selected code
     */
    private async generateDocumentationForSelection(): Promise<void> {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active editor found');
            return;
        }

        const selection = editor.selection;
        if (selection.isEmpty) {
            vscode.window.showInformationMessage('Please select code to document');
            return;
        }

        const selectedText = editor.document.getText(selection);
        const documentationStyle = this.getDocumentationStyle();
        const includeExamples = this.shouldIncludeExamples();
        const includeTypes = this.shouldIncludeTypes();
        
        const prompt = this.createDocumentationPrompt(
            selectedText, 
            documentationStyle, 
            editor.document.languageId,
            includeExamples,
            includeTypes
        );

        try {
            vscode.window.showInformationMessage('Generating documentation...');
            const response = await this.llmProvider.sendPrompt(prompt);
            
            if (response) {
                await editor.edit(editBuilder => {
                    // Insert the generated documentation above the selected code
                    const position = selection.start;
                    const lineStart = new vscode.Position(position.line, 0);
                    editBuilder.insert(lineStart, response + '\n');
                });
                vscode.window.showInformationMessage('Documentation generated successfully');
            } else {
                vscode.window.showErrorMessage('Failed to generate documentation');
            }
        } catch (error) {
            vscode.window.showErrorMessage(`Error generating documentation: ${error}`);
        }
    }

    /**
     * Generate documentation for the current file
     */
    private async generateDocumentationForFile(): Promise<void> {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active editor found');
            return;
        }

        const fileContent = editor.document.getText();
        const documentationStyle = this.getDocumentationStyle();
        const includeExamples = this.shouldIncludeExamples();
        const includeTypes = this.shouldIncludeTypes();
        
        const prompt = this.createDocumentationPrompt(
            fileContent, 
            documentationStyle, 
            editor.document.languageId,
            includeExamples,
            includeTypes,
            true // isFullFile
        );

        try {
            vscode.window.showInformationMessage('Generating documentation for the entire file...');
            const response = await this.llmProvider.sendPrompt(prompt);
            
            if (response) {
                // Show documentation in a new document
                const doc = await vscode.workspace.openTextDocument({
                    content: response,
                    language: editor.document.languageId
                });
                await vscode.window.showTextDocument(doc, { viewColumn: vscode.ViewColumn.Beside });
                vscode.window.showInformationMessage('File documentation generated successfully');
            } else {
                vscode.window.showErrorMessage('Failed to generate file documentation');
            }
        } catch (error) {
            vscode.window.showErrorMessage(`Error generating file documentation: ${error}`);
        }
    }

    /**
     * Generate documentation for the entire project
     */
    private async generateDocumentationForProject(): Promise<void> {
        vscode.window.showInformationMessage('Project documentation generation started...');
        
        // Get JavaScript and TypeScript files in the workspace
        const jsFiles = await vscode.workspace.findFiles('**/*.{js,jsx}', '**/node_modules/**');
        const tsFiles = await vscode.workspace.findFiles('**/*.{ts,tsx}', '**/node_modules/**');
        const allFiles = [...jsFiles, ...tsFiles];
        
        if (allFiles.length === 0) {
            vscode.window.showInformationMessage('No JavaScript or TypeScript files found in the project');
            return;
        }
        
        // Show progress
        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "Generating Project Documentation",
            cancellable: true
        }, async (progress, token) => {
            const documentationStyle = this.getDocumentationStyle();
            const includeExamples = this.shouldIncludeExamples();
            const includeTypes = this.shouldIncludeTypes();
            
            const totalFiles = allFiles.length;
            let processedFiles = 0;
            
            // Create a folder for documentation
            const workspaceFolders = vscode.workspace.workspaceFolders;
            if (!workspaceFolders) {
                vscode.window.showErrorMessage('No workspace folder open');
                return;
            }
            
            const docsFolder = path.join(workspaceFolders[0].uri.fsPath, 'docs');
            try {
                // Ensure docs folder exists
                await vscode.workspace.fs.createDirectory(vscode.Uri.file(docsFolder));
                
                for (const file of allFiles) {
                    if (token.isCancellationRequested) {
                        vscode.window.showInformationMessage('Documentation generation canceled');
                        return;
                    }
                    
                    try {
                        const fileContent = await this.readFile(file);
                        const fileExt = path.extname(file.fsPath);
                        const languageId = fileExt === '.js' || fileExt === '.jsx' ? 'javascript' : 'typescript';
                        
                        const prompt = this.createDocumentationPrompt(
                            fileContent, 
                            documentationStyle, 
                            languageId,
                            includeExamples,
                            includeTypes,
                            true
                        );
                        
                        const response = await this.llmProvider.sendPrompt(prompt);
                        
                        if (response) {
                            // Save documentation to docs folder
                            const relativePath = path.relative(workspaceFolders[0].uri.fsPath, file.fsPath);
                            const docFileName = relativePath.replace(/\\/g, '_').replace(/\//g, '_') + '.md';
                            const docFilePath = path.join(docsFolder, docFileName);
                            
                            // Write the documentation to a markdown file
                            const docContent = `# Documentation for ${relativePath}\n\n${response}`;
                            await vscode.workspace.fs.writeFile(
                                vscode.Uri.file(docFilePath), 
                                Buffer.from(docContent, 'utf8')
                            );
                            
                            processedFiles++;
                            progress.report({ 
                                message: `Processed ${processedFiles}/${totalFiles} files`,
                                increment: 100 / totalFiles 
                            });
                        }
                        
                    } catch (error) {
                        console.error(`Error documenting file ${file.fsPath}:`, error);
                        vscode.window.showWarningMessage(`Skipped ${path.basename(file.fsPath)} due to an error`);
                    }
                }
                
                vscode.window.showInformationMessage(`Completed documentation for ${processedFiles}/${totalFiles} files`);
                
                // Open the docs folder
                vscode.env.openExternal(vscode.Uri.file(docsFolder));
                
            } catch (error) {
                console.error('Error in project documentation:', error);
                vscode.window.showErrorMessage(`Documentation generation failed: ${error}`);
            }
        });
    }

    /**
     * Read the content of a file
     * @param fileUri The URI of the file to read
     * @returns The content of the file as a string
     */
    private async readFile(fileUri: vscode.Uri): Promise<string> {
        const content = await vscode.workspace.fs.readFile(fileUri);
        return Buffer.from(content).toString('utf-8');
    }

    /**
     * Create a prompt for generating documentation
     * @param code The code to document
     * @param style The documentation style (JSDoc or TSDoc)
     * @param languageId The language ID of the code
     * @param includeExamples Whether to include examples in the documentation
     * @param includeTypes Whether to include types in the documentation
     * @param isFullFile Whether the code is a full file or just a selection
     * @returns A prompt for the LLM to generate documentation
     */
    private createDocumentationPrompt(
        code: string, 
        style: string, 
        languageId: string,
        includeExamples: boolean,
        includeTypes: boolean,
        isFullFile: boolean = false
    ): string {
        const examplesInstruction = includeExamples ? 
            "Include practical usage examples for functions, methods, and classes." : 
            "Do not include examples in the documentation.";
            
        const typesInstruction = includeTypes ? 
            "Include detailed type information for all parameters, return values, and properties." : 
            "Keep type information minimal.";
            
        const styleGuide = style === 'jsdoc' ? 
            "Use JSDoc format with /** ... */ comment blocks and appropriate @tags." : 
            "Use TSDoc format which extends JSDoc with TypeScript-specific annotations.";
            
        const scopeInstruction = isFullFile ? 
            "Generate documentation for all relevant code elements in the file, including module/file level documentation." : 
            "Generate documentation only for the provided code selection.";
            
        let langSpecificInstructions = "";
        if (languageId === 'javascript' || languageId === 'typescript') {
            langSpecificInstructions = "Document all exported functions, classes, interfaces, types, and variables. For classes, document methods, properties, and constructor parameters.";
        } else if (languageId === 'javascriptreact' || languageId === 'typescriptreact') {
            langSpecificInstructions = "Document React components including their props, state, and key methods. Include component lifecycle information where relevant.";
        }

        return `
You are a code documentation expert. Generate high-quality ${style} documentation for the following ${languageId} code:

${styleGuide}
${examplesInstruction}
${typesInstruction}
${scopeInstruction}
${langSpecificInstructions}

Make the documentation clear, concise, and professionally written. Focus on explaining what the code does, why it exists, and how to use it.

CODE TO DOCUMENT:
\`\`\`${languageId}
${code}
\`\`\`

Generate only the documentation comments, not the code itself.
`;
    }

    /**
     * Get the documentation style from settings
     * @returns The documentation style (jsdoc or tsdoc)
     */
    private getDocumentationStyle(): string {
        return vscode.workspace.getConfiguration('localLLMAgent.documentation').get('style', 'jsdoc');
    }

    /**
     * Check if examples should be included in the documentation
     * @returns Whether to include examples
     */
    private shouldIncludeExamples(): boolean {
        return vscode.workspace.getConfiguration('localLLMAgent.documentation').get('includeExamples', true);
    }

    /**
     * Check if types should be included in the documentation
     * @returns Whether to include types
     */
    private shouldIncludeTypes(): boolean {
        return vscode.workspace.getConfiguration('localLLMAgent.documentation').get('includeTypes', true);
    }

    /**
     * Generate documentation for the current node at cursor position
     * This can be registered as a separate command
     */
    async generateDocumentationForCurrentNode(): Promise<void> {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active editor found');
            return;
        }
        
        const position = editor.selection.active;
        const document = editor.document;
        
        // This is a simplified approach - in a real implementation,
        // we would use a language parser to find the exact node
        
        // For now, we'll use a simple heuristic to find the current function or class
        const currentLine = position.line;
        let startLine = currentLine;
        let endLine = currentLine;
        
        // Find the start of the current block (class, function, etc.)
        while (startLine > 0) {
            const line = document.lineAt(startLine - 1).text.trim();
            if (line.match(/^(class|interface|function|const|let|var|export)/)) {
                break;
            }
            startLine--;
        }
        
        // Find the end of the block by looking for matching braces
        let braceCount = 0;
        let foundStartBrace = false;
        
        for (let i = startLine; i < document.lineCount; i++) {
            const line = document.lineAt(i).text;
            
            for (const char of line) {
                if (char === '{') {
                    foundStartBrace = true;
                    braceCount++;
                } else if (char === '}') {
                    braceCount--;
                }
            }
            
            if (foundStartBrace && braceCount === 0) {
                endLine = i;
                break;
            }
        }
        
        // Get the text of the current node
        const range = new vscode.Range(
            new vscode.Position(startLine, 0),
            new vscode.Position(endLine + 1, 0)
        );
        
        const selectedText = document.getText(range);
        
        // Generate documentation for the selected text
        const documentationStyle = this.getDocumentationStyle();
        const includeExamples = this.shouldIncludeExamples();
        const includeTypes = this.shouldIncludeTypes();
        
        const prompt = this.createDocumentationPrompt(
            selectedText, 
            documentationStyle, 
            document.languageId,
            includeExamples,
            includeTypes
        );
        
        try {
            vscode.window.showInformationMessage('Generating documentation...');
            const response = await this.llmProvider.sendPrompt(prompt);
            
            if (response) {
                await editor.edit(editBuilder => {
                    // Insert the generated documentation above the selected code
                    const position = new vscode.Position(startLine, 0);
                    editBuilder.insert(position, response + '\n');
                });
                vscode.window.showInformationMessage('Documentation generated successfully');
            } else {
                vscode.window.showErrorMessage('Failed to generate documentation');
            }
        } catch (error) {
            vscode.window.showErrorMessage(`Error generating documentation: ${error}`);
        }
    }
}
