import * as vscode from 'vscode';
import { LanguageStatusBarService } from '../LanguageStatusBarService';

jest.mock('vscode');

describe('LanguageStatusBarService', () => {
    let service: LanguageStatusBarService;
    let mockStatusBarItem: any;

    beforeEach(() => {
        mockStatusBarItem = {
            text: '',
            tooltip: '',
            command: '',
            show: jest.fn(),
            dispose: jest.fn()
        };

        (vscode.window.createStatusBarItem as jest.Mock).mockReturnValue(mockStatusBarItem);
        service = new LanguageStatusBarService();
    });

    describe('initialization', () => {
        it('should create status bar item with correct properties', () => {
            service.initialize();

            expect(vscode.window.createStatusBarItem).toHaveBeenCalledWith(
                vscode.StatusBarAlignment.Right,
                100
            );
            expect(mockStatusBarItem.command).toBe('copilot-ppa.selectLanguage');
            expect(mockStatusBarItem.show).toHaveBeenCalled();
        });

        it('should set initial display', () => {
            service.initialize();
            service.updateDisplay('en');

            expect(mockStatusBarItem.text).toBe('$(globe) English');
            expect(mockStatusBarItem.tooltip).toBe('Current Language: English');
        });
    });

    describe('language updates', () => {
        beforeEach(() => {
            service.initialize();
        });

        it('should update display for known language', () => {
            service.updateDisplay('fr');

            expect(mockStatusBarItem.text).toBe('$(globe) French');
            expect(mockStatusBarItem.tooltip).toBe('Current Language: French');
        });

        it('should update display for unknown language code', () => {
            service.updateDisplay('xx');

            expect(mockStatusBarItem.text).toBe('$(globe) Unknown');
            expect(mockStatusBarItem.tooltip).toBe('Current Language: Unknown');
        });

        it('should handle multiple language updates', () => {
            service.updateDisplay('es');
            service.updateDisplay('de');
            service.updateDisplay('it');

            expect(mockStatusBarItem.text).toBe('$(globe) Italian');
            expect(mockStatusBarItem.tooltip).toBe('Current Language: Italian');
        });
    });

    describe('localization support', () => {
        beforeEach(() => {
            service.initialize();
        });

        it('should handle RTL languages', () => {
            service.updateDisplay('ar');
            expect(mockStatusBarItem.text).toBe('$(globe) Arabic');
        });

        it('should handle CJK languages', () => {
            service.updateDisplay('zh');
            expect(mockStatusBarItem.text).toBe('$(globe) Chinese');
        });

        it('should handle special character languages', () => {
            service.updateDisplay('el');
            expect(mockStatusBarItem.text).toBe('$(globe) Greek');
        });
    });

    describe('cleanup', () => {
        it('should dispose status bar item', () => {
            service.initialize();
            service.dispose();
            expect(mockStatusBarItem.dispose).toHaveBeenCalled();
        });

        it('should handle multiple dispose calls', () => {
            service.initialize();
            service.dispose();
            service.dispose();
            expect(mockStatusBarItem.dispose).toHaveBeenCalledTimes(1);
        });
    });
});
