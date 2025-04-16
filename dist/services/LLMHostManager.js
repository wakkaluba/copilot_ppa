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
exports.LLMHostManager = void 0;
const vscode = __importStar(require("vscode"));
const child_process = __importStar(require("child_process"));
class LLMHostManager {
    constructor() {
        this.process = null;
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
        this.updateStatus('stopped');
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new LLMHostManager();
        }
        return this.instance;
    }
    async startHost() {
        const config = vscode.workspace.getConfiguration('copilot-ppa');
        const hostPath = config.get('llmHostPath');
        const modelPath = config.get('modelPath');
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
    async stopHost() {
        if (this.process) {
            this.process.kill();
            this.process = null;
            this.updateStatus('stopped');
        }
    }
    updateStatus(status) {
        const icons = {
            stopped: '$(debug-stop)',
            starting: '$(sync~spin)',
            running: '$(check)',
            error: '$(error)'
        };
        this.statusBarItem.text = `${icons[status]} LLM Host: ${status}`;
        this.statusBarItem.show();
    }
    dispose() {
        this.stopHost();
        this.statusBarItem.dispose();
    }
}
exports.LLMHostManager = LLMHostManager;
//# sourceMappingURL=LLMHostManager.js.map