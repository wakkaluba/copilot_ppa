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
const vscode = __importStar(require("vscode"));
const agentSidebarProvider_1 = require("../../../sidebar/agentSidebarProvider");
const jest_mock_extended_1 = require("jest-mock-extended");
describe('AgentSidebarProvider', () => {
    let provider;
    let mockWebview;
    let mockWebviewView;
    let mockConnectionManager;
    let mockExtensionUri;
    beforeEach(() => {
        mockWebview = (0, jest_mock_extended_1.mock)();
        mockWebviewView = (0, jest_mock_extended_1.mock)({
            webview: mockWebview
        });
        mockConnectionManager = (0, jest_mock_extended_1.mock)();
        mockExtensionUri = vscode.Uri.file('test-extension-path');
        provider = new agentSidebarProvider_1.AgentSidebarProvider(mockExtensionUri, mockConnectionManager);
    });
    describe('resolveWebviewView', () => {
        it('should initialize webview with correct options', () => {
            provider.resolveWebviewView(mockWebviewView, {}, {});
            expect(mockWebview.options).toEqual({
                enableScripts: true,
                localResourceRoots: [mockExtensionUri]
            });
        });
        it('should set up HTML content', () => {
            provider.resolveWebviewView(mockWebviewView, {}, {});
            expect(mockWebview.html).toBeDefined();
            expect(mockWebview.html).toContain('<!DOCTYPE html>');
        });
    });
    describe('message handling', () => {
        beforeEach(() => {
            provider.resolveWebviewView(mockWebviewView, {}, {});
        });
        it('should handle connect message', async () => {
            await mockWebview.onDidReceiveMessage.mock.calls[0][0]({
                type: 'connect'
            });
            expect(mockConnectionManager.connect).toHaveBeenCalled();
        });
        it('should handle disconnect message', async () => {
            await mockWebview.onDidReceiveMessage.mock.calls[0][0]({
                type: 'disconnect'
            });
            expect(mockConnectionManager.disconnect).toHaveBeenCalled();
        });
        it('should handle refreshModels message', async () => {
            const mockModels = [{ id: 'model1' }, { id: 'model2' }];
            mockConnectionManager.getAvailableModels.mockResolvedValue(mockModels);
            await mockWebview.onDidReceiveMessage.mock.calls[0][0]({
                type: 'refreshModels'
            });
            expect(mockConnectionManager.getAvailableModels).toHaveBeenCalled();
            expect(mockWebview.postMessage).toHaveBeenCalledWith({
                type: 'updateModels',
                data: mockModels
            });
        });
        it('should handle setModel message', async () => {
            await mockWebview.onDidReceiveMessage.mock.calls[0][0]({
                type: 'setModel',
                data: 'test-model'
            });
            expect(mockConnectionManager.setModel).toHaveBeenCalledWith('test-model');
        });
    });
    describe('error handling', () => {
        beforeEach(() => {
            provider.resolveWebviewView(mockWebviewView, {}, {});
        });
        it('should handle connection errors', async () => {
            const error = new Error('Connection failed');
            mockConnectionManager.connect.mockRejectedValue(error);
            await mockWebview.onDidReceiveMessage.mock.calls[0][0]({
                type: 'connect'
            });
            expect(mockWebview.postMessage).toHaveBeenCalledWith({
                type: 'showError',
                data: 'Failed to connect: Connection failed'
            });
        });
    });
    describe('cleanup', () => {
        it('should dispose of all resources', () => {
            const disposableMock = { dispose: jest.fn() };
            provider['_disposables'].push(disposableMock);
            provider.dispose();
            expect(disposableMock.dispose).toHaveBeenCalled();
            expect(provider['_messageHandlers'].size).toBe(0);
            expect(provider['_view']).toBeUndefined();
        });
    });
});
//# sourceMappingURL=agentSidebarProvider.test.js.map