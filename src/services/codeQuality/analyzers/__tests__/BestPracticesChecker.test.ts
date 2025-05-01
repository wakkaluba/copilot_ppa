import * as vscode from 'vscode';
import { SecurityCategory } from '../../../../security/types';
import { Logger } from '../../../../utils/logger';
import { BestPracticesChecker } from '../BestPracticesChecker';

// Mock the Logger's getInstance method since constructor is private
jest.mock('../../../../utils/logger', () => ({
    Logger: {
        getInstance: jest.fn().mockReturnValue({
            log: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
            info: jest.fn(),
            debug: jest.fn()
        })
    }
}));

jest.mock('vscode');

describe('BestPracticesChecker', () => {
    let checker: BestPracticesChecker;
    let mockLogger: jest.Mocked<Logger>;
    let mockDocument: jest.Mocked<vscode.TextDocument>;

    beforeEach(() => {
        mockLogger = Logger.getInstance() as jest.Mocked<Logger>;
        checker = new BestPracticesChecker(mockLogger);
        mockDocument = {
            getText: jest.fn(),
            fileName: 'test.ts',
            uri: { fsPath: 'test.ts' } as vscode.Uri
        } as unknown as jest.Mocked<vscode.TextDocument>;
    });

    it('should analyze document and return issues', async () => {
        // Arrange
        const mockCode = `
            function veryLongFunction() {
                // A function with too many lines
                // ... many lines of code ...
            }
        `;
        mockDocument.getText.mockReturnValue(mockCode);

        // Act
        const result = await checker.analyzeDocument(mockDocument);

        // Assert
        expect(result.issues.length).toBeGreaterThan(0);
        expect(result.diagnostics.length).toBe(result.issues.length);
    });

    it('should detect method length issues', async () => {
        // Arrange
        const mockCode = `
            function tooLongFunction() {
                const line1 = 1;
                const line2 = 2;
                // ... repeated 50 times ...
            }
        `;
        mockDocument.getText.mockReturnValue(mockCode);

        // Act
        const result = await checker.analyzeDocument(mockDocument);

        // Assert
        expect(result.issues).toContainEqual(
            expect.objectContaining({
                category: SecurityCategory.Other,
                description: expect.stringContaining('method length')
            })
        );
    });

    it('should detect naming convention issues', async () => {
        // Arrange
        const mockCode = `
            function bad_naming_convention() {
                const BAD_VARIABLE_name = 'test';
            }
        `;
        mockDocument.getText.mockReturnValue(mockCode);

        // Act
        const result = await checker.analyzeDocument(mockDocument);

        // Assert
        expect(result.issues).toContainEqual(
            expect.objectContaining({
                category: SecurityCategory.Other,
                description: expect.stringContaining('naming convention')
            })
        );
    });
});
