import * as vscode from 'vscode';
import { LLMStatusBar } from '../llmStatusBar';

jest.mock('vscode');

describe('LLMStatusBar', () => {
    let statusBar: LLMStatusBar;
    let mockStatusBarItem: any;

    beforeEach(() => {
        mockStatusBarItem = {
            text: '',
            tooltip: '',
            backgroundColor: undefined,
            show: jest.fn(),
            dispose: jest.fn()
        };

        (vscode.window.createStatusBarItem as jest.Mock).mockReturnValue(mockStatusBarItem);
        statusBar = new LLMStatusBar();
    });

    describe('initialization', () => {
        it('should create status bar item with correct properties', () => {
            expect(vscode.window.createStatusBarItem).toHaveBeenCalledWith(
                vscode.StatusBarAlignment.Right,
                100
            );
            expect(mockStatusBarItem.show).toHaveBeenCalled();
        });
    });

    describe('status updates', () => {
        it('should update status for connected state with model name', () => {
            statusBar.updateStatus(true, 'GPT-4');

            expect(mockStatusBarItem.text).toBe('$(check) LLM: GPT-4');
            expect(mockStatusBarItem.tooltip).toBe('LLM Connection Status: GPT-4');
            expect(mockStatusBarItem.backgroundColor).toEqual(
                new vscode.ThemeColor('statusBarItem.successBackground')
            );
        });

        it('should update status for connected state without model name', () => {
            statusBar.updateStatus(true);

            expect(mockStatusBarItem.text).toBe('$(check) LLM: Connected');
            expect(mockStatusBarItem.tooltip).toBe('LLM Connection Status');
            expect(mockStatusBarItem.backgroundColor).toEqual(
                new vscode.ThemeColor('statusBarItem.successBackground')
            );
        });

        it('should update status for disconnected state', () => {
            statusBar.updateStatus(false);

            expect(mockStatusBarItem.text).toBe('$(error) LLM: Disconnected');
            expect(mockStatusBarItem.tooltip).toBe('LLM Connection Status');
            expect(mockStatusBarItem.backgroundColor).toEqual(
                new vscode.ThemeColor('statusBarItem.errorBackground')
            );
        });

        it('should handle multiple status updates', () => {
            statusBar.updateStatus(true, 'Model1');
            statusBar.updateStatus(false);
            statusBar.updateStatus(true, 'Model2');

            expect(mockStatusBarItem.text).toBe('$(check) LLM: Model2');
            expect(mockStatusBarItem.tooltip).toBe('LLM Connection Status: Model2');
            expect(mockStatusBarItem.backgroundColor).toEqual(
                new vscode.ThemeColor('statusBarItem.successBackground')
            );
        });

        it('should update with empty model name', () => {
            statusBar.updateStatus(true, '');

            expect(mockStatusBarItem.text).toBe('$(check) LLM: Connected');
            expect(mockStatusBarItem.tooltip).toBe('LLM Connection Status');
        });
    });

    describe('cleanup', () => {
        it('should dispose status bar item', () => {
            statusBar.dispose();
            expect(mockStatusBarItem.dispose).toHaveBeenCalled();
        });

        it('should handle multiple dispose calls', () => {
            statusBar.dispose();
            statusBar.dispose();
            expect(mockStatusBarItem.dispose).toHaveBeenCalledTimes(1);
        });
    });

    describe('edge cases', () => {
        it('should handle undefined model name', () => {
            statusBar.updateStatus(true, undefined);

            expect(mockStatusBarItem.text).toBe('$(check) LLM: Connected');
            expect(mockStatusBarItem.tooltip).toBe('LLM Connection Status');
        });

        it('should handle model names with special characters', () => {
            statusBar.updateStatus(true, 'Model/v1.0');

            expect(mockStatusBarItem.text).toBe('$(check) LLM: Model/v1.0');
            expect(mockStatusBarItem.tooltip).toBe('LLM Connection Status: Model/v1.0');
        });
    });
});
