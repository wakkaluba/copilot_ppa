import * as vscode from 'vscode';
import { ExtensionAccessService } from '../../../src/services/ExtensionAccessService';

describe('ExtensionAccessService', () => {
    let accessService: ExtensionAccessService;
    let mockContext: vscode.ExtensionContext;
    let mockExtension: vscode.Extension<any>;

    beforeEach(() => {
        mockContext = {
            globalState: {
                get: jest.fn(),
                update: jest.fn()
            }
        } as any;

        mockExtension = {
            packageJSON: {
                displayName: 'Test Extension'
            }
        } as any;

        (vscode.extensions.getExtension as jest.Mock) = jest.fn().mockReturnValue(mockExtension);
        (vscode.window.showInformationMessage as jest.Mock) = jest.fn();

        accessService = new ExtensionAccessService(mockContext);
    });

    describe('requestAccess', () => {
        it('should request user permission for first-time access', async () => {
            (vscode.window.showInformationMessage as jest.Mock).mockResolvedValue('Allow');

            const result = await accessService.requestAccess('test.extension', ['read']);
            
            expect(result).toBe(true);
            expect(vscode.window.showInformationMessage).toHaveBeenCalled();
            expect(mockContext.globalState.update).toHaveBeenCalled();
        });

        it('should deny access when user rejects', async () => {
            (vscode.window.showInformationMessage as jest.Mock).mockResolvedValue('Deny');

            const result = await accessService.requestAccess('test.extension', ['read']);
            
            expect(result).toBe(false);
        });

        it('should throw error for non-existent extension', async () => {
            (vscode.extensions.getExtension as jest.Mock).mockReturnValue(undefined);

            await expect(accessService.requestAccess('invalid.extension', ['read']))
                .rejects.toThrow('Extension invalid.extension not found');
        });
    });

    describe('hasPermission', () => {
        it('should return true for granted permission', async () => {
            (vscode.window.showInformationMessage as jest.Mock).mockResolvedValue('Allow');
            await accessService.requestAccess('test.extension', ['read']);

            const hasPermission = accessService.hasPermission('test.extension', 'read');
            expect(hasPermission).toBe(true);
        });

        it('should return false for denied permission', async () => {
            (vscode.window.showInformationMessage as jest.Mock).mockResolvedValue('Deny');
            await accessService.requestAccess('test.extension', ['read']);

            const hasPermission = accessService.hasPermission('test.extension', 'read');
            expect(hasPermission).toBe(false);
        });
    });

    describe('revokeAccess', () => {
        it('should revoke all permissions for an extension', async () => {
            (vscode.window.showInformationMessage as jest.Mock).mockResolvedValue('Allow');
            await accessService.requestAccess('test.extension', ['read', 'write']);

            accessService.revokeAccess('test.extension');

            expect(accessService.hasPermission('test.extension', 'read')).toBe(false);
            expect(accessService.hasPermission('test.extension', 'write')).toBe(false);
        });
    });

    describe('listExtensionAccess', () => {
        it('should list all extension access records', async () => {
            (vscode.window.showInformationMessage as jest.Mock).mockResolvedValue('Allow');
            await accessService.requestAccess('test.extension', ['read']);

            const list = accessService.listExtensionAccess();
            expect(list).toHaveLength(1);
            expect(list[0].extensionId).toBe('test.extension');
        });
    });
});