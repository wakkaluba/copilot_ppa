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
const workspaceAccess_1 = require("../../commands/workspaceAccess");
describe('WorkspaceAccess Tests', () => {
    let workspaceAccess;
    let mockEventEmitter;
    beforeEach(() => {
        // Create a new event emitter for each test
        mockEventEmitter = new vscode.EventEmitter();
        jest.spyOn(workspaceAccess_1.WorkspaceAccessManager, 'onDidChangeAccessEmitter', 'get')
            .mockReturnValue(mockEventEmitter);
        workspaceAccess = workspaceAccess_1.WorkspaceAccessManager.getInstance();
    });
    afterEach(() => {
        // Reset the singleton instance
        workspaceAccess_1.WorkspaceAccessManager.instance = undefined;
        jest.clearAllMocks();
    });
    describe('Initialization', () => {
        test('initializes with correct default state', () => {
            expect(workspaceAccess.isEnabled()).toBe(false);
        });
        test('maintains singleton instance', () => {
            const instance1 = workspaceAccess_1.WorkspaceAccessManager.getInstance();
            const instance2 = workspaceAccess_1.WorkspaceAccessManager.getInstance();
            expect(instance1).toBe(instance2);
        });
    });
    describe('Access Control', () => {
        test('toggles workspace access', async () => {
            const initialState = workspaceAccess.isEnabled();
            await workspaceAccess.toggleAccess();
            expect(workspaceAccess.isEnabled()).toBe(!initialState);
        });
        test('emits change event when toggling', async () => {
            const changeHandler = jest.fn();
            workspaceAccess.onDidChangeAccess(changeHandler);
            await workspaceAccess.toggleAccess();
            expect(changeHandler).toHaveBeenCalledWith(true);
        });
        test('handles multiple event listeners', async () => {
            const handler1 = jest.fn();
            const handler2 = jest.fn();
            workspaceAccess.onDidChangeAccess(handler1);
            workspaceAccess.onDidChangeAccess(handler2);
            await workspaceAccess.toggleAccess();
            expect(handler1).toHaveBeenCalledWith(true);
            expect(handler2).toHaveBeenCalledWith(true);
        });
    });
    describe('Event Handling', () => {
        test('properly disposes event listeners', () => {
            const handler = jest.fn();
            const disposable = workspaceAccess.onDidChangeAccess(handler);
            disposable.dispose();
            // Trigger a change
            mockEventEmitter.fire(true);
            expect(handler).not.toHaveBeenCalled();
        });
        test('handles event subscription after initialization', async () => {
            const handler = jest.fn();
            // Toggle access before subscribing
            await workspaceAccess.toggleAccess();
            // Subscribe to events
            workspaceAccess.onDidChangeAccess(handler);
            // Toggle again
            await workspaceAccess.toggleAccess();
            expect(handler).toHaveBeenCalledWith(false);
        });
    });
    describe('Error Handling', () => {
        test('handles toggle failure gracefully', async () => {
            // Mock a failure in the toggle operation
            jest.spyOn(workspaceAccess, 'updateState')
                .mockRejectedValueOnce(new Error('Toggle failed'));
            await expect(workspaceAccess.toggleAccess())
                .rejects.toThrow('Toggle failed');
            // State should remain unchanged
            expect(workspaceAccess.isEnabled()).toBe(false);
        });
    });
});
//# sourceMappingURL=workspaceAccess.test.js.map