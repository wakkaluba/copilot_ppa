import * as vscode from 'vscode';
import { ConnectionStatus, ConnectionStatusBar } from '../ConnectionStatusBar';

jest.mock('vscode');

describe('ConnectionStatusBar', () => {
    let statusBar: ConnectionStatusBar;
    let mockStatusBarItem: any;

    beforeEach(() => {
        jest.clearAllMocks();
        mockStatusBarItem = {
            text: '',
            tooltip: '',
            backgroundColor: undefined,
            command: undefined,
            show: jest.fn(),
            dispose: jest.fn()
        };

        (vscode.window.createStatusBarItem as jest.Mock).mockReturnValue(mockStatusBarItem);
        statusBar = new ConnectionStatusBar();
    });

    afterEach(() => {
        statusBar.dispose();
    });

    describe('initialization', () => {
        it('should create status bar item with correct properties', () => {
            expect(vscode.window.createStatusBarItem).toHaveBeenCalledWith(
                vscode.StatusBarAlignment.Right,
                100
            );
            expect(mockStatusBarItem.show).toHaveBeenCalled();
            expect(mockStatusBarItem.command).toBe('vscode-local-llm-agent.openConnectionSettings');
        });

        it('should initialize with disconnected state', () => {
            expect(statusBar.getStatus()).toBe(ConnectionStatus.Disconnected);
            expect(mockStatusBarItem.text).toBe('$(plug) LLM: Disconnected');
            expect(mockStatusBarItem.tooltip).toBe('Not connected to any LLM service');
        });
    });

    describe('status updates', () => {
        it('should update status for connected state', () => {
            statusBar.updateStatus(ConnectionStatus.Connected, 'Connected to Server');

            expect(mockStatusBarItem.text).toBe('$(check) LLM: Connected');
            expect(mockStatusBarItem.tooltip).toBe('Connected to Server');
            expect(mockStatusBarItem.backgroundColor).toBeUndefined();
        });

        it('should update status for connecting state', () => {
            statusBar.updateStatus(ConnectionStatus.Connecting, 'Connecting to Server');

            expect(mockStatusBarItem.text).toBe('$(sync~spin) LLM: Connecting');
            expect(mockStatusBarItem.tooltip).toBe('Connecting to Server');
            expect(mockStatusBarItem.backgroundColor).toBeUndefined();
        });

        it('should update status for error state', () => {
            statusBar.updateStatus(ConnectionStatus.Error, 'Connection Error');

            expect(mockStatusBarItem.text).toBe('$(error) LLM: Error');
            expect(mockStatusBarItem.tooltip).toBe('Connection Error');
            expect(mockStatusBarItem.backgroundColor).toEqual(
                new vscode.ThemeColor('statusBarItem.errorBackground')
            );
        });

        it('should update status for disconnected state', () => {
            statusBar.updateStatus(ConnectionStatus.Disconnected, 'Disconnected');

            expect(mockStatusBarItem.text).toBe('$(plug) LLM: Disconnected');
            expect(mockStatusBarItem.tooltip).toBe('Disconnected');
            expect(mockStatusBarItem.backgroundColor).toBeUndefined();
        });

        it('should handle multiple status updates', () => {
            statusBar.updateStatus(ConnectionStatus.Connected, 'Connected');
            statusBar.updateStatus(ConnectionStatus.Error, 'Error');
            statusBar.updateStatus(ConnectionStatus.Connected, 'Connected Again');

            expect(mockStatusBarItem.text).toBe('$(check) LLM: Connected');
            expect(mockStatusBarItem.tooltip).toBe('Connected Again');
            expect(mockStatusBarItem.backgroundColor).toBeUndefined();
        });

        it('should use default messages when none provided', () => {
            statusBar.updateStatus(ConnectionStatus.Connected);
            expect(mockStatusBarItem.tooltip).toBe('Connected to LLM service');

            statusBar.updateStatus(ConnectionStatus.Connecting);
            expect(mockStatusBarItem.tooltip).toBe('Connecting to LLM service...');

            statusBar.updateStatus(ConnectionStatus.Error);
            expect(mockStatusBarItem.tooltip).toBe('Error connecting to LLM service');

            statusBar.updateStatus(ConnectionStatus.Disconnected);
            expect(mockStatusBarItem.tooltip).toBe('Not connected to any LLM service');
        });
    });

    describe('status retrieval', () => {
        it('should return current status', () => {
            statusBar.updateStatus(ConnectionStatus.Connected);
            expect(statusBar.getStatus()).toBe(ConnectionStatus.Connected);

            statusBar.updateStatus(ConnectionStatus.Error);
            expect(statusBar.getStatus()).toBe(ConnectionStatus.Error);
        });
    });

    describe('status transitions', () => {
        it('should handle transition from connecting to connected', () => {
            statusBar.updateStatus(ConnectionStatus.Connecting);
            statusBar.updateStatus(ConnectionStatus.Connected);

            expect(mockStatusBarItem.text).toBe('$(check) LLM: Connected');
            expect(statusBar.getStatus()).toBe(ConnectionStatus.Connected);
        });

        it('should handle transition from connecting to error', () => {
            statusBar.updateStatus(ConnectionStatus.Connecting);
            statusBar.updateStatus(ConnectionStatus.Error, 'Connection timeout');

            expect(mockStatusBarItem.text).toBe('$(error) LLM: Error');
            expect(statusBar.getStatus()).toBe(ConnectionStatus.Error);
        });

        it('should handle transition from error to connecting', () => {
            statusBar.updateStatus(ConnectionStatus.Error);
            statusBar.updateStatus(ConnectionStatus.Connecting, 'Retrying connection...');

            expect(mockStatusBarItem.text).toBe('$(sync~spin) LLM: Connecting');
            expect(statusBar.getStatus()).toBe(ConnectionStatus.Connecting);
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
        it('should handle empty message', () => {
            statusBar.updateStatus(ConnectionStatus.Connected, '');
            expect(mockStatusBarItem.tooltip).toBe('Connected to LLM service');
        });

        it('should handle undefined message', () => {
            statusBar.updateStatus(ConnectionStatus.Connected, undefined);
            expect(mockStatusBarItem.tooltip).toBe('Connected to LLM service');
        });

        it('should handle messages with special characters', () => {
            statusBar.updateStatus(ConnectionStatus.Connected, 'Connected to Server/v1.0');
            expect(mockStatusBarItem.tooltip).toBe('Connected to Server/v1.0');
        });
    });

    test('should create status bar item with correct configuration', () => {
        expect(vscode.window.createStatusBarItem).toHaveBeenCalledWith(
            vscode.StatusBarAlignment.Right,
            100
        );
        expect(vscode.window.createStatusBarItem).toHaveBeenCalledTimes(1);
    });

    test('should update status when connected', () => {
        statusBar.updateStatus(ConnectionStatus.Connected, 'Test Message');
        const mockStatusBarItem = (vscode.window.createStatusBarItem as jest.Mock).mock.results[0].value;

        expect(mockStatusBarItem.text).toBe('$(check) LLM: Connected');
        expect(mockStatusBarItem.tooltip).toBe('Test Message');
        expect(mockStatusBarItem.backgroundColor).toBeUndefined();
    });

    test('should update status when connecting', () => {
        statusBar.updateStatus(ConnectionStatus.Connecting, 'Connecting...');
        const mockStatusBarItem = (vscode.window.createStatusBarItem as jest.Mock).mock.results[0].value;

        expect(mockStatusBarItem.text).toBe('$(sync~spin) LLM: Connecting');
        expect(mockStatusBarItem.tooltip).toBe('Connecting...');
        expect(mockStatusBarItem.backgroundColor).toBeUndefined();
    });

    test('should update status when error occurs', () => {
        statusBar.updateStatus(ConnectionStatus.Error, 'Error Message');
        const mockStatusBarItem = (vscode.window.createStatusBarItem as jest.Mock).mock.results[0].value;

        expect(mockStatusBarItem.text).toBe('$(error) LLM: Error');
        expect(mockStatusBarItem.tooltip).toBe('Error Message');
        expect(mockStatusBarItem.backgroundColor).toEqual(new vscode.ThemeColor('statusBarItem.errorBackground'));
    });

    test('should update status when disconnected', () => {
        statusBar.updateStatus(ConnectionStatus.Disconnected, 'Disconnected Message');
        const mockStatusBarItem = (vscode.window.createStatusBarItem as jest.Mock).mock.results[0].value;

        expect(mockStatusBarItem.text).toBe('$(plug) LLM: Disconnected');
        expect(mockStatusBarItem.tooltip).toBe('Disconnected Message');
        expect(mockStatusBarItem.backgroundColor).toBeUndefined();
    });

    test('should use default messages when no message provided', () => {
        statusBar.updateStatus(ConnectionStatus.Connected);
        const mockStatusBarItem = (vscode.window.createStatusBarItem as jest.Mock).mock.results[0].value;

        expect(mockStatusBarItem.tooltip).toBe('Connected to LLM service');
    });

    test('should dispose status bar item', () => {
        const mockStatusBarItem = (vscode.window.createStatusBarItem as jest.Mock).mock.results[0].value;
        statusBar.dispose();
        expect(mockStatusBarItem.dispose).toHaveBeenCalled();
    });
});
