import * as vscode from 'vscode';
import { TerminalManager } from '../../src/terminal/terminalManager';
import { TerminalShellType } from '../../src/terminal/types';
import { LLMProviderManager } from '../../src/llm/llmProviderManager';
import { ConnectionStatusService } from '../../src/status/connectionStatusService';

describe('Terminal Commands Integration', () => {
    let terminalManager: TerminalManager;
    let llmProviderManager: LLMProviderManager;
    let connectionStatusService: ConnectionStatusService;
    let terminal: vscode.Terminal;

    beforeEach(function() {
        // Initialize managers
        this.connectionStatusService = new ConnectionStatusService();
        this.terminalManager = new TerminalManager();
        this.llmProviderManager = new LLMProviderManager(this.connectionStatusService);

        // Create a test terminal
        this.terminal = this.terminalManager.createTerminal('Test Terminal', TerminalShellType.VSCodeDefault);
    });

    afterEach(function() {
        // Clean up terminals
        this.terminalManager.closeAllTerminals();
    });

    describe('Command Generation', () => {
        it('generates git commands based on context', async function() {
            const prompt = 'Generate a git command to commit with message "Initial commit"';
            const response = await this.llmProviderManager.sendPromptWithLanguage(prompt);

            expect(response).toContain('git commit');
            expect(response).toContain('-m');
            expect(response).toContain('Initial commit');
        });

        it('generates npm commands based on context', async function() {
            const prompt = 'Generate an npm command to install jest';
            const response = await this.llmProviderManager.sendPromptWithLanguage(prompt);

            expect(response).toContain('npm');
            expect(response).toContain('install');
            expect(response).toContain('jest');
        });

        it('handles complex multi-step commands', async function() {
            const prompt = 'Generate git commands to add all files, commit with message "Update files", and push';
            const response = await this.llmProviderManager.sendPromptWithLanguage(prompt);

            expect(response).toContain('git add .');
            expect(response).toContain('git commit');
            expect(response).toContain('git push');
        });
    });

    describe('Command Execution', () => {
        it('executes simple command and captures output', async function() {
            const output = await this.terminalManager.executeCommandWithOutput('echo "test"', TerminalShellType.VSCodeDefault);
            expect(output.trim()).toBe('test');
        });

        it('handles environment variables', async function() {
            const output = await this.terminalManager.executeCommandWithOutput('echo $TEST_VAR', TerminalShellType.VSCodeDefault);
            expect(output).toBeDefined();
        });

        it('respects working directory', async function() {
            const testDir = vscode.workspace.workspaceFolders?.[0].uri.fsPath || process.cwd();
            const output = await this.terminalManager.executeCommandWithOutput('pwd', TerminalShellType.VSCodeDefault);
            expect(output.trim()).toBe(testDir);
        });

        it('handles command failure gracefully', async function() {
            await expect(this.terminalManager.executeCommandWithOutput('nonexistent-command', TerminalShellType.VSCodeDefault))
                .rejects.toThrow();
        });
    });

    describe('Terminal Management', () => {
        it('creates and closes terminals', async function() {
            const terminal1 = this.terminalManager.createTerminal('Test 1', TerminalShellType.VSCodeDefault);
            const terminal2 = this.terminalManager.createTerminal('Test 2', TerminalShellType.VSCodeDefault);

            expect(this.terminalManager.getActiveTerminals().size).toBe(3); // Including the one from beforeEach

            this.terminalManager.closeTerminal('Test 1');
            expect(this.terminalManager.getActiveTerminals().size).toBe(2);

            this.terminalManager.closeTerminal('Test 2');
            expect(this.terminalManager.getActiveTerminals().size).toBe(1);
        });

        it('handles multiple terminals', async function() {
            const terminal1 = this.terminalManager.createTerminal('Test 1', TerminalShellType.VSCodeDefault);
            const terminal2 = this.terminalManager.createTerminal('Test 2', TerminalShellType.VSCodeDefault);

            // Execute commands in different terminals
            await this.terminalManager.executeCommand('echo "test1"', 'Test 1');
            await this.terminalManager.executeCommand('echo "test2"', 'Test 2');

            // Each terminal output can be captured independently
            const output1 = await this.terminalManager.executeCommandWithOutput('echo "test1"', TerminalShellType.VSCodeDefault);
            const output2 = await this.terminalManager.executeCommandWithOutput('echo "test2"', TerminalShellType.VSCodeDefault);

            expect(output1.trim()).toBe('test1');
            expect(output2.trim()).toBe('test2');
        });
    });

    describe('Shell Type Support', () => {
        it('supports PowerShell commands', async function() {
            const terminal = this.terminalManager.createTerminal('PowerShell Test', TerminalShellType.PowerShell);
            const output = await this.terminalManager.executeCommandWithOutput('Write-Host "test"', TerminalShellType.PowerShell);
            expect(output.trim()).toBe('test');
        });

        it('supports Git Bash commands', async function() {
            const terminal = this.terminalManager.createTerminal('Git Bash Test', TerminalShellType.GitBash);
            const output = await this.terminalManager.executeCommandWithOutput('echo "test"', TerminalShellType.GitBash);
            expect(output.trim()).toBe('test');
        });

        it('supports WSL Bash commands on Windows', async function() {
            if (process.platform === 'win32') {
                const terminal = this.terminalManager.createTerminal('WSL Test', TerminalShellType.WSLBash);
                const output = await this.terminalManager.executeCommandWithOutput('echo "test"', TerminalShellType.WSLBash);
                expect(output.trim()).toBe('test');
            }
        });
    });
});