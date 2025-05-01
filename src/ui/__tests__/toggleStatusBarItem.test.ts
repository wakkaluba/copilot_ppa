import * as vscode from 'vscode';
import { ToggleStatusBarItem } from '../toggleStatusBarItem';

jest.mock('vscode');

describe('ToggleStatusBarItem', () => {
    let toggleItem: ToggleStatusBarItem;
    let mockStatusBarItem: any;
    let mockContext: vscode.ExtensionContext;
    let mockStateManager: any;

    beforeEach(() => {
        mockStatusBarItem = {
            text: '',
            tooltip: '',
            backgroundColor: undefined,
            command: '',
            show: jest.fn(),
            dispose: jest.fn()
        };

        mockStateManager = {
            getActiveToggles: jest.fn().mockReturnValue([]),
            onToggleChanged: jest.fn(),
            onToggleAdded: jest.fn()
        };

        (vscode.window.createStatusBarItem as jest.Mock).mockReturnValue(mockStatusBarItem);

        mockContext = {
            subscriptions: [],
            workspaceState: {
                get: jest.fn(),
                update: jest.fn()
            }
        } as unknown as vscode.ExtensionContext;

        toggleItem = new ToggleStatusBarItem(mockContext);
    });

    describe('initialization', () => {
        it('should create status bar item with correct properties', () => {
            expect(vscode.window.createStatusBarItem).toHaveBeenCalledWith(
                vscode.StatusBarAlignment.Right,
                1000
            );
            expect(mockStatusBarItem.command).toBe('copilot-ppa.showCommandToggles');
            expect(mockStatusBarItem.show).toHaveBeenCalled();
        });

        it('should initialize with default state', () => {
            expect(mockStatusBarItem.text).toBe('$(circle-large-outline) Commands');
            expect(mockStatusBarItem.tooltip).toBe('No command toggles active\nClick to configure command toggles');
            expect(mockStatusBarItem.backgroundColor).toBeUndefined();
        });
    });

    describe('toggle updates', () => {
        it('should update for single active toggle', () => {
            const toggle = {
                id: 'test-toggle',
                label: 'Test Toggle',
                description: 'Test Description',
                category: 'Test Category'
            };

            mockStateManager.getActiveToggles.mockReturnValueOnce([toggle]);
            toggleItem['updateStatusBar']();

            expect(mockStatusBarItem.text).toBe('$(circle-large-filled) Test Toggle');
            expect(mockStatusBarItem.tooltip).toContain('Active toggle: Test Toggle');
            expect(mockStatusBarItem.tooltip).toContain('Test Description');
            expect(mockStatusBarItem.backgroundColor).toEqual(
                new vscode.ThemeColor('statusBarItem.prominentBackground')
            );
        });

        it('should update for multiple active toggles', () => {
            const toggles = [
                {
                    id: 'toggle1',
                    label: 'Toggle 1',
                    category: 'Category 1'
                },
                {
                    id: 'toggle2',
                    label: 'Toggle 2',
                    category: 'Category 2'
                }
            ];

            mockStateManager.getActiveToggles.mockReturnValueOnce(toggles);
            toggleItem['updateStatusBar']();

            expect(mockStatusBarItem.text).toBe('$(circle-large-filled) 2 Toggles');
            expect(mockStatusBarItem.tooltip).toContain('Category 1');
            expect(mockStatusBarItem.tooltip).toContain('Category 2');
            expect(mockStatusBarItem.backgroundColor).toEqual(
                new vscode.ThemeColor('statusBarItem.prominentBackground')
            );
        });

        it('should update for no active toggles', () => {
            mockStateManager.getActiveToggles.mockReturnValueOnce([]);
            toggleItem['updateStatusBar']();

            expect(mockStatusBarItem.text).toBe('$(circle-large-outline) Commands');
            expect(mockStatusBarItem.tooltip).toBe('No command toggles active\nClick to configure command toggles');
            expect(mockStatusBarItem.backgroundColor).toBeUndefined();
        });
    });

    describe('category handling', () => {
        it('should group toggles by category', () => {
            const toggles = [
                { id: 'toggle1', label: 'Toggle 1', category: 'Category A' },
                { id: 'toggle2', label: 'Toggle 2', category: 'Category A' },
                { id: 'toggle3', label: 'Toggle 3', category: 'Category B' }
            ];

            const grouped = toggleItem['groupByCategory'](toggles);
            expect(grouped['Category A']).toHaveLength(2);
            expect(grouped['Category B']).toHaveLength(1);
        });

        it('should format tooltip with categories', () => {
            const byCategory = {
                'Category A': [
                    { label: 'Toggle 1' },
                    { label: 'Toggle 2' }
                ],
                'Category B': [
                    { label: 'Toggle 3' }
                ]
            };

            const tooltip = toggleItem['formatTooltip'](byCategory);
            expect(tooltip).toContain('Category A');
            expect(tooltip).toContain('Category B');
            expect(tooltip).toContain('Toggle 1');
            expect(tooltip).toContain('Toggle 2');
            expect(tooltip).toContain('Toggle 3');
        });
    });

    describe('event handling', () => {
        it('should update on toggle changes', () => {
            const changeHandler = mockStateManager.onToggleChanged.mock.calls[0][0];
            changeHandler();
            expect(mockStatusBarItem.text).toBeDefined();
        });

        it('should update on toggle additions', () => {
            const addHandler = mockStateManager.onToggleAdded.mock.calls[0][0];
            addHandler();
            expect(mockStatusBarItem.text).toBeDefined();
        });
    });

    describe('cleanup', () => {
        it('should dispose of status bar item', () => {
            toggleItem.dispose();
            expect(mockStatusBarItem.dispose).toHaveBeenCalled();
        });

        it('should dispose all registered disposables', () => {
            const mockDisposable = { dispose: jest.fn() };
            toggleItem['disposables'].push(mockDisposable);

            toggleItem.dispose();
            expect(mockDisposable.dispose).toHaveBeenCalled();
        });
    });
});
