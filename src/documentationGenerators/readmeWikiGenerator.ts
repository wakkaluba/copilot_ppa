import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { LLMInterface } from '../llm/llmInterface';

/**
 * Types of documentation that can be generated
 */
export enum DocumentationType {
    README = 'README',
    CONTRIBUTING = 'CONTRIBUTING',
    WIKI_HOME = 'Wiki Home',
    WIKI_GETTING_STARTED = 'Wiki Getting Started',
    WIKI_API = 'Wiki API',
    WIKI_EXAMPLES = 'Wiki Examples',
    WIKI_FAQ = 'Wiki FAQ',
    WIKI_TROUBLESHOOTING = 'Wiki Troubleshooting',
    CUSTOM = 'Custom'
}

/**
 * README/Wiki Generator class for creating project documentation
 */
export class ReadmeWikiGenerator {
    private context: vscode.ExtensionContext;
    private llmProvider: LLMInterface;

    /**
     * Constructor for the README/Wiki generator
     * @param context The VSCode extension context
     * @param llmProvider The LLM provider to use for generating documentation
     */
    constructor(context: vscode.ExtensionContext, llmProvider: LLMInterface) {
        this.context = context;
        this.llmProvider = llmProvider;
        
        this.registerCommands();
    }

    /**
     * Register commands for README/Wiki generation
     */
    private registerCommands(): void {
        // Command to generate README
        this.context.subscriptions.push(
            vscode.commands.registerCommand('localLLMAgent.generateDocumentation.readme', 
                async () => await this.generateReadme())
        );

        // Command to generate CONTRIBUTING guide
        this.context.subscriptions.push(
            vscode.commands.registerCommand('localLLMAgent.generateDocumentation.contributing', 
                async () => await this.generateContributing())
        );

        // Command to generate Wiki page
        this.context.subscriptions.push(
            vscode.commands.registerCommand('localLLMAgent.generateDocumentation.wiki', 
                async () => await this.generateWikiPage())
        );

        // Command to generate multiple documentation files
        this.context.subscriptions.push(
            vscode.commands.registerCommand('localLLMAgent.generateDocumentation.projectDocs', 
                async () => await this.generateProjectDocumentation())
        );
    }

    /**
     * Generate a README.md file for the current project
     */
    private async generateReadme(): Promise<void> {
        try {
            const workspaceFolders = vscode.workspace.workspaceFolders;
            if (!workspaceFolders) {
                vscode.window.showErrorMessage('No workspace folder open');
                return;
            }
            
            const projectRoot = workspaceFolders[0].uri.fsPath;
            const projectInfo = await this.gatherProjectInfo(projectRoot);
            
            vscode.window.showInformationMessage('Generating README.md...');
            
            const prompt = this.createReadmePrompt(projectInfo);
            const readmeContent = await this.llmProvider.sendPrompt(prompt);
            
            if (readmeContent) {
                const readmePath = path.join(projectRoot, 'README.md');
                
                // Check if README.md already exists
                if (fs.existsSync(readmePath)) {
                    const overwrite = await vscode.window.showWarningMessage(
                        'README.md already exists. Do you want to overwrite it?',
                        { modal: true },
                        'Yes', 'No', 'Compare'
                    );
                    
                    if (overwrite === 'No') {
                        return;
                    } else if (overwrite === 'Compare') {
                        // Show diff between existing and new README
                        const existingContent = fs.readFileSync(readmePath, 'utf8');
                        await this.showDiff(existingContent, readmeContent, 'README.md');
                        return;
                    }
                }
                
                // Write README.md
                fs.writeFileSync(readmePath, readmeContent);
                
                vscode.window.showInformationMessage('README.md generated successfully');
                
                // Open the generated README
                const doc = await vscode.workspace.openTextDocument(vscode.Uri.file(readmePath));
                await vscode.window.showTextDocument(doc);
            } else {
                vscode.window.showErrorMessage('Failed to generate README.md');
            }
        } catch (error) {
            vscode.window.showErrorMessage(`Error generating README: ${error}`);
        }
    }

    /**
     * Generate a CONTRIBUTING.md file for the current project
     */
    private async generateContributing(): Promise<void> {
        try {
            const workspaceFolders = vscode.workspace.workspaceFolders;
            if (!workspaceFolders) {
                vscode.window.showErrorMessage('No workspace folder open');
                return;
            }
            
            const projectRoot = workspaceFolders[0].uri.fsPath;
            const projectInfo = await this.gatherProjectInfo(projectRoot);
            
            vscode.window.showInformationMessage('Generating CONTRIBUTING.md...');
            
            const prompt = this.createContributingPrompt(projectInfo);
            const contributingContent = await this.llmProvider.sendPrompt(prompt);
            
            if (contributingContent) {
                const contributingPath = path.join(projectRoot, 'CONTRIBUTING.md');
                
                // Check if CONTRIBUTING.md already exists
                if (fs.existsSync(contributingPath)) {
                    const overwrite = await vscode.window.showWarningMessage(
                        'CONTRIBUTING.md already exists. Do you want to overwrite it?',
                        { modal: true },
                        'Yes', 'No', 'Compare'
                    );
                    
                    if (overwrite === 'No') {
                        return;
                    } else if (overwrite === 'Compare') {
                        // Show diff between existing and new CONTRIBUTING
                        const existingContent = fs.readFileSync(contributingPath, 'utf8');
                        await this.showDiff(existingContent, contributingContent, 'CONTRIBUTING.md');
                        return;
                    }
                }
                
                // Write CONTRIBUTING.md
                fs.writeFileSync(contributingPath, contributingContent);
                
                vscode.window.showInformationMessage('CONTRIBUTING.md generated successfully');
                
                // Open the generated CONTRIBUTING
                const doc = await vscode.workspace.openTextDocument(vscode.Uri.file(contributingPath));
                await vscode.window.showTextDocument(doc);
            } else {
                vscode.window.showErrorMessage('Failed to generate CONTRIBUTING.md');
            }
        } catch (error) {
            vscode.window.showErrorMessage(`Error generating CONTRIBUTING guide: ${error}`);
        }
    }

    /**
     * Generate a Wiki page file
     */
    private async generateWikiPage(): Promise<void> {
        try {
            const workspaceFolders = vscode.workspace.workspaceFolders;
            if (!workspaceFolders) {
                vscode.window.showErrorMessage('No workspace folder open');
                return;
            }
            
            // Ask user which wiki page to generate
            const wikiPageType = await vscode.window.showQuickPick(
                Object.values(DocumentationType).filter(type => type.startsWith('Wiki')),
                { placeHolder: 'Select the type of Wiki page to generate' }
            );
            
            if (!wikiPageType) {
                return; // User cancelled
            }
            
            const projectRoot = workspaceFolders[0].uri.fsPath;
            
            // Check if .github/wiki exists, if not create it
            const wikiDir = path.join(projectRoot, '.github', 'wiki');
            if (!fs.existsSync(wikiDir)) {
                fs.mkdirSync(wikiDir, { recursive: true });
            }
            
            // Determine filename based on wiki page type
            let filename: string;
            switch (wikiPageType) {
                case DocumentationType.WIKI_HOME:
                    filename = 'Home.md';
                    break;
                case DocumentationType.WIKI_GETTING_STARTED:
                    filename = 'Getting-Started.md';
                    break;
                case DocumentationType.WIKI_API:
                    filename = 'API-Documentation.md';
                    break;
                case DocumentationType.WIKI_EXAMPLES:
                    filename = 'Examples.md';
                    break;
                case DocumentationType.WIKI_FAQ:
                    filename = 'FAQ.md';
                    break;
                case DocumentationType.WIKI_TROUBLESHOOTING:
                    filename = 'Troubleshooting.md';
                    break;
                default:
                    // Ask for custom filename
                    const customName = await vscode.window.showInputBox({
                        prompt: 'Enter a name for the Wiki page',
                        placeHolder: 'e.g. Advanced-Configuration'
                    });
                    if (!customName) {
                        return; // User cancelled
                    }
                    filename = `${customName.replace(/\s+/g, '-')}.md`;
            }
            
            const wikiPath = path.join(wikiDir, filename);
            
            // Gather project info
            const projectInfo = await this.gatherProjectInfo(projectRoot);
            
            vscode.window.showInformationMessage(`Generating ${filename}...`);
            
            // Create prompt based on wiki page type
            const prompt = this.createWikiPagePrompt(wikiPageType, projectInfo);
            const wikiContent = await this.llmProvider.sendPrompt(prompt);
            
            if (wikiContent) {
                // Check if wiki page already exists
                if (fs.existsSync(wikiPath)) {
                    const overwrite = await vscode.window.showWarningMessage(
                        `${filename} already exists. Do you want to overwrite it?`,
                        { modal: true },
                        'Yes', 'No', 'Compare'
                    );
                    
                    if (overwrite === 'No') {
                        return;
                    } else if (overwrite === 'Compare') {
                        // Show diff between existing and new wiki page
                        const existingContent = fs.readFileSync(wikiPath, 'utf8');
                        await this.showDiff(existingContent, wikiContent, filename);
                        return;
                    }
                }
                
                // Write wiki page
                fs.writeFileSync(wikiPath, wikiContent);
                
                vscode.window.showInformationMessage(`${filename} generated successfully`);
                
                // Open the generated wiki page
                const doc = await vscode.workspace.openTextDocument(vscode.Uri.file(wikiPath));
                await vscode.window.showTextDocument(doc);
            } else {
                vscode.window.showErrorMessage(`Failed to generate ${filename}`);
            }
        } catch (error) {
            vscode.window.showErrorMessage(`Error generating Wiki page: ${error}`);
        }
    }

    /**
     * Generate multiple documentation files for the project
     */
    private async generateProjectDocumentation(): Promise<void> {
        try {
            const workspaceFolders = vscode.workspace.workspaceFolders;
            if (!workspaceFolders) {
                vscode.window.showErrorMessage('No workspace folder open');
                return;
            }
            
            // Ask user which documentation files to generate
            const docTypes = await vscode.window.showQuickPick(
                [
                    { label: 'README.md', picked: true },
                    { label: 'CONTRIBUTING.md', picked: false },
                    { label: 'Wiki Home', picked: false },
                    { label: 'Wiki Getting Started', picked: false },
                    { label: 'Wiki API Documentation', picked: false },
                    { label: 'Wiki Examples', picked: false },
                    { label: 'Wiki FAQ', picked: false },
                    { label: 'Wiki Troubleshooting', picked: false }
                ],
                { canPickMany: true, placeHolder: 'Select documentation files to generate' }
            );
            
            if (!docTypes || docTypes.length === 0) {
                return; // User cancelled or didn't select any
            }
            
            // Process each selected documentation type
            vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: "Generating project documentation",
                cancellable: true
            }, async (progress, token) => {
                const totalDocs = docTypes.length;
                let processedDocs = 0;
                
                for (const docType of docTypes) {
                    if (token.isCancellationRequested) {
                        vscode.window.showInformationMessage('Documentation generation cancelled');
                        return;
                    }
                    
                    progress.report({ 
                        message: `Generating ${docType.label}`,
                        increment: (100 / totalDocs) 
                    });
                    
                    // Call appropriate generator based on doc type
                    if (docType.label === 'README.md') {
                        await this.generateReadme();
                    } else if (docType.label === 'CONTRIBUTING.md') {
                        await this.generateContributing();
                    } else if (docType.label.startsWith('Wiki')) {
                        // Convert label to DocumentationType
                        const wikiType = Object.values(DocumentationType).find(
                            type => type === docType.label
                        ) || DocumentationType.CUSTOM;
                        
                        // Create custom generateWikiPage function call for specific wiki type
                        await this.generateSpecificWikiPage(wikiType);
                    }
                    
                    processedDocs++;
                }
                
                vscode.window.showInformationMessage(`Generated ${processedDocs} documentation files`);
            });
        } catch (error) {
            vscode.window.showErrorMessage(`Error generating project documentation: ${error}`);
        }
    }

    /**
     * Generate a specific wiki page based on type
     * @param wikiType The type of wiki page to generate
     */
    private async generateSpecificWikiPage(wikiType: string): Promise<void> {
        try {
            const workspaceFolders = vscode.workspace.workspaceFolders;
            if (!workspaceFolders) {
                return;
            }
            
            const projectRoot = workspaceFolders[0].uri.fsPath;
            
            // Check if .github/wiki exists, if not create it
            const wikiDir = path.join(projectRoot, '.github', 'wiki');
            if (!fs.existsSync(wikiDir)) {
                fs.mkdirSync(wikiDir, { recursive: true });
            }
            
            // Determine filename based on wiki page type
            let filename: string;
            switch (wikiType) {
                case DocumentationType.WIKI_HOME:
                    filename = 'Home.md';
                    break;
                case DocumentationType.WIKI_GETTING_STARTED:
                    filename = 'Getting-Started.md';
                    break;
                case DocumentationType.WIKI_API:
                    filename = 'API-Documentation.md';
                    break;
                case DocumentationType.WIKI_EXAMPLES:
                    filename = 'Examples.md';
                    break;
                case DocumentationType.WIKI_FAQ:
                    filename = 'FAQ.md';
                    break;
                case DocumentationType.WIKI_TROUBLESHOOTING:
                    filename = 'Troubleshooting.md';
                    break;
                default:
                    filename = 'Custom-Page.md';
            }
            
            const wikiPath = path.join(wikiDir, filename);
            
            // Gather project info
            const projectInfo = await this.gatherProjectInfo(projectRoot);
            
            // Create prompt based on wiki page type
            const prompt = this.createWikiPagePrompt(wikiType, projectInfo);
            const wikiContent = await this.llmProvider.sendPrompt(prompt);
            
            if (wikiContent) {
                // Write wiki page (overwrite without asking in batch mode)
                fs.writeFileSync(wikiPath, wikiContent);
            }
        } catch (error) {
            console.error(`Error generating wiki page ${wikiType}:`, error);
        }
    }

    /**
     * Gather information about the project for documentation generation
     * @param projectRoot The root path of the project
     * @returns Project information object
     */
    private async gatherProjectInfo(projectRoot: string): Promise<any> {
        const projectInfo: any = {};
        
        try {
            // Read package.json if it exists
            const packageJsonPath = path.join(projectRoot, 'package.json');
            if (fs.existsSync(packageJsonPath)) {
                const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
                projectInfo.name = packageJson.name || '';
                projectInfo.description = packageJson.description || '';
                projectInfo.version = packageJson.version || '';
                projectInfo.author = packageJson.author || '';
                projectInfo.license = packageJson.license || '';
                projectInfo.dependencies = packageJson.dependencies || {};
                projectInfo.devDependencies = packageJson.devDependencies || {};
                projectInfo.scripts = packageJson.scripts || {};
                projectInfo.keywords = packageJson.keywords || [];
                
                // Extract commands from package.json for VS Code extensions
                if (packageJson.contributes && packageJson.contributes.commands) {
                    projectInfo.commands = packageJson.contributes.commands;
                }
            }
            
            // Get list of top-level directories
            const directories = fs.readdirSync(projectRoot, { withFileTypes: true })
                .filter(dirent => dirent.isDirectory() && !dirent.name.startsWith('.'))
                .map(dirent => dirent.name);
            
            projectInfo.directories = directories;
            
            // Check for common configuration files
            const configFiles = [
                '.gitignore', '.eslintrc', 'tsconfig.json', 'webpack.config.js', 
                'rollup.config.js', 'vite.config.js', 'jest.config.js', 'babel.config.js'
            ];
            
            projectInfo.configFiles = configFiles.filter(file => 
                fs.existsSync(path.join(projectRoot, file))
            );
            
            // Check for LICENSE file
            if (fs.existsSync(path.join(projectRoot, 'LICENSE'))) {
                projectInfo.hasLicense = true;
                // Try to determine license type
                const licenseContent = fs.readFileSync(path.join(projectRoot, 'LICENSE'), 'utf8');
                if (licenseContent.includes('MIT')) {
                    projectInfo.licenseType = 'MIT';
                } else if (licenseContent.includes('Apache')) {
                    projectInfo.licenseType = 'Apache';
                } else if (licenseContent.includes('GPL')) {
                    projectInfo.licenseType = 'GPL';
                }
            }
            
            // Count source files by type
            const fileStats: Record<string, number> = {};
            await this.countFiles(projectRoot, fileStats);
            projectInfo.fileStats = fileStats;
            
        } catch (error) {
            console.error('Error gathering project info:', error);
        }
        
        return projectInfo;
    }
    
    /**
     * Count files recursively by extension
     * @param dir Directory to scan
     * @param stats Object to store file counts
     */
    private async countFiles(dir: string, stats: Record<string, number>): Promise<void> {
        try {
            const entries = fs.readdirSync(dir, { withFileTypes: true });
            
            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);
                
                // Skip node_modules and hidden directories
                if (entry.isDirectory()) {
                    if (entry.name !== 'node_modules' && !entry.name.startsWith('.')) {
                        await this.countFiles(fullPath, stats);
                    }
                } else if (entry.isFile()) {
                    const ext = path.extname(entry.name).toLowerCase();
                    if (ext) {
                        stats[ext] = (stats[ext] || 0) + 1;
                    }
                }
            }
        } catch (error) {
            console.error(`Error counting files in ${dir}:`, error);
        }
    }

    /**
     * Create a prompt for generating a README
     * @param projectInfo Project information
     * @returns Prompt for the LLM
     */
    private createReadmePrompt(projectInfo: any): string {
        return `Generate a comprehensive README.md file for the following project:

Project Name: ${projectInfo.name || 'Unknown'}
Description: ${projectInfo.description || 'No description provided'}
Version: ${projectInfo.version || 'Unknown'}
Keywords: ${projectInfo.keywords?.join(', ') || 'None'}

The project has the following structure:
Directories: ${projectInfo.directories?.join(', ') || 'Unknown'}
Configuration files: ${projectInfo.configFiles?.join(', ') || 'None'}
File types: ${Object.entries(projectInfo.fileStats || {}).map(([ext, count]) => `${ext} (${count})`).join(', ') || 'Unknown'}

Dependencies: ${Object.keys(projectInfo.dependencies || {}).length} production, ${Object.keys(projectInfo.devDependencies || {}).length} development

Please create a well-structured README.md with the following sections:
1. Title and Description
2. Features
3. Installation
4. Usage
5. Configuration (if applicable)
6. API Documentation (if applicable)
7. Examples
8. Contributing
9. License
10. Acknowledgements (if applicable)

Use markdown formatting, include badges where appropriate, and create clear code examples. For VS Code extensions, include information about commands and settings.

The README should be comprehensive but clear and concise. Use proper Markdown formatting including headings, lists, code blocks, and tables where appropriate.`;
    }

    /**
     * Create a prompt for generating a CONTRIBUTING guide
     * @param projectInfo Project information
     * @returns Prompt for the LLM
     */
    private createContributingPrompt(projectInfo: any): string {
        return `Generate a comprehensive CONTRIBUTING.md file for the following project:

Project Name: ${projectInfo.name || 'Unknown'}
Description: ${projectInfo.description || 'No description provided'}
Version: ${projectInfo.version || 'Unknown'}

The project has the following structure:
Directories: ${projectInfo.directories?.join(', ') || 'Unknown'}
Configuration files: ${projectInfo.configFiles?.join(', ') || 'None'}
File types: ${Object.entries(projectInfo.fileStats || {}).map(([ext, count]) => `${ext} (${count})`).join(', ') || 'Unknown'}

Dependencies: ${Object.keys(projectInfo.dependencies || {}).length} production, ${Object.keys(projectInfo.devDependencies || {}).length} development

Please create a well-structured CONTRIBUTING.md with the following sections:
1. Introduction
2. Code of Conduct
3. Getting Started
   - Prerequisites
   - Development environment setup
4. Development Workflow
   - Branching strategy
   - Commit message guidelines
   - Pull request process
5. Testing Guidelines
6. Documentation Guidelines
7. Release Process
8. Community and Communication

Use markdown formatting and create clear instructions for potential contributors. The guide should be friendly and welcoming while also setting clear expectations.`;
    }

    /**
     * Create a prompt for generating a Wiki page
     * @param wikiPageType Type of wiki page to generate
     * @param projectInfo Project information
     * @returns Prompt for the LLM
     */
    private createWikiPagePrompt(wikiPageType: string, projectInfo: any): string {
        let specificInstructions = '';
        
        switch (wikiPageType) {
            case DocumentationType.WIKI_HOME:
                specificInstructions = `
This is the Home page for the project Wiki. It should:
- Provide a brief overview of the project
- List available wiki pages with links
- Give a quick start guide
- Include navigation to other important pages`;
                break;
                
            case DocumentationType.WIKI_GETTING_STARTED:
                specificInstructions = `
This is the Getting Started guide. It should:
- Provide step-by-step installation instructions
- Include basic usage examples
- Cover initial configuration
- List prerequisites and requirements
- Include troubleshooting for common initial issues`;
                break;
                
            case DocumentationType.WIKI_API:
                specificInstructions = `
This is the API Documentation page. It should:
- Document all public APIs, functions, classes, and methods
- Include parameter and return type information
- Provide usage examples for each API
- Group related APIs together in a logical manner
- Include information about error handling`;
                break;
                
            case DocumentationType.WIKI_EXAMPLES:
                specificInstructions = `
This is the Examples page. It should:
- Provide comprehensive, working code examples
- Cover common use cases and scenarios
- Include examples of increasing complexity
- Explain each example with comments
- Show input and expected output where applicable`;
                break;
                
            case DocumentationType.WIKI_FAQ:
                specificInstructions = `
This is the FAQ page. It should:
- Answer common questions about the project
- Address known issues and their solutions
- Provide troubleshooting information
- Cover misconceptions and clarify project scope
- Include both basic and advanced topics`;
                break;
                
            case DocumentationType.WIKI_TROUBLESHOOTING:
                specificInstructions = `
This is the Troubleshooting page. It should:
- Address common errors and their solutions
- Include diagnostic steps for identifying issues
- Provide debugging information
- Cover environment-specific problems
- Include a section on where to get additional help`;
                break;
                
            default:
                specificInstructions = `
This is a custom Wiki page. It should:
- Be well-structured with clear headings
- Include relevant information about the specific topic
- Provide examples where applicable
- Link to related wiki pages
- Be comprehensive but concise`;
        }
        
        return `Generate a Wiki page of type "${wikiPageType}" for the following project:

Project Name: ${projectInfo.name || 'Unknown'}
Description: ${projectInfo.description || 'No description provided'}
Version: ${projectInfo.version || 'Unknown'}

${specificInstructions}

Use proper Markdown formatting including headings, lists, code blocks, and tables where appropriate. Make the page readable, comprehensive, and user-friendly.`;
    }

    /**
     * Show a diff between existing and new content
     * @param existingContent Existing file content
     * @param newContent New content to compare
     * @param title Title for the diff editor
     */
    private async showDiff(existingContent: string, newContent: string, title: string): Promise<void> {
        // Create temporary files for diff
        const tempDir = path.join(os.tmpdir(), 'vscode-llm-agent-diff');
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }
        
        const existingPath = path.join(tempDir, `existing-${title}`);
        const newPath = path.join(tempDir, `new-${title}`);
        
        // Write contents to temp files
        fs.writeFileSync(existingPath, existingContent);
        fs.writeFileSync(newPath, newContent);
        
        // Open diff editor
        const existingUri = vscode.Uri.file(existingPath);
        const newUri = vscode.Uri.file(newPath);
        
        await vscode.commands.executeCommand('vscode.diff', existingUri, newUri, `${title}: Existing ↔ Generated`);
    }
}

// Import for os module to handle temporary files
import * as os from 'os';
