import * as vscode from 'vscode';
import * as child_process from 'child_process';
import * as os from 'os';

export class LLMHostManager {
    private static instance: LLMHostManager;
    private process: child_process.ChildProcess | null = null;
    private statusBarItem: vscode.StatusBarItem;

    private constructor() {
        this.statusBarItem = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Right,
            100
        );
        this.updateStatus('stopped');
    }

    static getInstance(): LLMHostManager {
        if (!this.instance) {
            this.instance = new LLMHostManager();
        }
        return this.instance;
    }

    async startHost(): Promise<void> {
        const config = vscode.workspace.getConfiguration('copilot-ppa');
        const hostPath = config.get<string>('llmHostPath');
        const modelPath = config.get<string>('modelPath');

        if (!hostPath || !modelPath) {
            throw new Error('LLM host path or model path not configured');
        }

        this.process = child_process.spawn(hostPath, ['--model', modelPath]);
        this.updateStatus('starting');

        return new Promise((resolve, reject) => {
            this.process?.stdout?.on('data', (data) => {
                if (data.toString().includes('Model loaded')) {
                    this.updateStatus('running');
                    resolve();
                }
            });

            this.process?.stderr?.on('data', (data) => {
                console.error(`LLM Host Error: ${data}`);
            });

            this.process?.on('error', (error) => {
                this.updateStatus('error');
                reject(error);
            });

            this.process?.on('exit', (code) => {
                this.updateStatus('stopped');
                if (code !== 0) {
                    reject(new Error(`Host process exited with code ${code}`));
                }
            });
        });
    }

    async stopHost(): Promise<void> {
        if (this.process) {
            this.process.kill();
            this.process = null;
            this.updateStatus('stopped');
        }
    }

    private updateStatus(status: 'stopped' | 'starting' | 'running' | 'error'): void {
        const icons = {
            stopped: '$(debug-stop)',
            starting: '$(sync~spin)',
            running: '$(check)',
            error: '$(error)'
        };

        this.statusBarItem.text = `${icons[status]} LLM Host: ${status}`;
        this.statusBarItem.show();
    }

    dispose(): void {
        this.stopHost();
        this.statusBarItem.dispose();
    }
}
