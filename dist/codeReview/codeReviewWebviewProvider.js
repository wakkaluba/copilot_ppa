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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodeReviewWebviewProvider = void 0;
const vscode = __importStar(require("vscode"));
const inversify_1 = require("inversify");
const CodeReviewService_1 = require("./services/CodeReviewService");
let CodeReviewWebviewProvider = class CodeReviewWebviewProvider {
    logger;
    _extensionUri;
    _context;
    service;
    static viewType = 'codeReviewPanel';
    _view;
    constructor(logger, _extensionUri, _context, service) {
        this.logger = logger;
        this._extensionUri = _extensionUri;
        this._context = _context;
        this.service = service;
    }
    resolveWebviewView(webviewView, context, _token) {
        try {
            this._view = webviewView;
            webviewView.webview.options = {
                enableScripts: true,
                localResourceRoots: [this._extensionUri]
            };
            webviewView.webview.html = this.service.getWebviewHtml(webviewView.webview, this._extensionUri);
            this._setWebviewMessageListener(webviewView.webview);
        }
        catch (error) {
            this.logger.error('Error resolving webview:', error);
            throw error;
        }
    }
    _setWebviewMessageListener(webview) {
        webview.onDidReceiveMessage(async (message) => {
            try {
                const response = await this.service.handleWebviewMessage(message);
                if (response) {
                    this._view?.webview.postMessage(response);
                }
            }
            catch (error) {
                this.logger.error('Error handling webview message:', error);
                vscode.window.showErrorMessage(`Failed to handle message: ${error instanceof Error ? error.message : String(error)}`);
            }
        });
    }
};
exports.CodeReviewWebviewProvider = CodeReviewWebviewProvider;
exports.CodeReviewWebviewProvider = CodeReviewWebviewProvider = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(ILogger_1.ILogger)),
    __param(3, (0, inversify_1.inject)(CodeReviewService_1.CodeReviewService)),
    __metadata("design:paramtypes", [Object, vscode.Uri, Object, CodeReviewService_1.CodeReviewService])
], CodeReviewWebviewProvider);
//# sourceMappingURL=codeReviewWebviewProvider.js.map