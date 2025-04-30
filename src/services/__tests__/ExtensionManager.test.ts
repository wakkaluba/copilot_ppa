import * as vscode from 'vscode';
import { ILogger } from '../../logging/ILogger';
import { ExtensionManager } from '../ExtensionManager';

jest.mock('vscode');

describe('ExtensionManager', () => {
    let extensionManager: ExtensionManager;
    let mockContext: vscode.ExtensionContext;
    let mockLogger: ILogger;

    beforeEach(() => {
        // Mock context
        mockContext = {
            subscriptions: [],
            extensionPath: '/test/path',
            globalState: {
                get: jest.fn(),
                update: jest.fn(),
                keys: jest.fn()
            },
            workspaceState: {
                get: jest.fn(),
                update: jest.fn(),
                keys: jest.fn()
            }
        } as unknown as vscode.ExtensionContext;

        // Mock logger
        mockLogger = {
            info: jest.fn(),
            warn: jest.fn(),
            error: jest.fn(),
            debug: jest.fn()
        };

        extensionManager = new ExtensionManager(mockContext, mockLogger);
    });

    describe('initialization', () => {
        test('registers extension activation event handlers', () => {
            expect(mockContext.subscriptions.length).toBeGreaterThan(0);
        });

        test('initializes with valid extension context', () => {
            expect(extensionManager.getExtensionPath()).toBe('/test/path');
        });
    });

    describe('configuration management', () => {
        test('loads default configuration', async () => {
            const config = await extensionManager.getConfiguration();
            expect(config).toBeDefined();
        });

        test('updates configuration settings', async () => {
            const newSettings = {
                enabled: true,
                autoConnect: true,
                logLevel: 'debug'
            };

            await extensionManager.updateConfiguration(newSettings);
            const config = await extensionManager.getConfiguration();
            expect(config).toMatchObject(newSettings);
        });

        test('validates configuration changes', async () => {
            const invalidSettings = {
                logLevel: 'invalid'
            };

            await expect(extensionManager.updateConfiguration(invalidSettings))
                .rejects.toThrow('Invalid log level');
        });
    });

    describe('service management', () => {
        test('initializes required services', () => {
            expect(extensionManager.isServicesInitialized()).toBe(true);
        });

        test('handles service initialization failures gracefully', async () => {
            // Simulate a service initialization failure
            jest.spyOn(extensionManager as any, 'initializeServices')
                .mockRejectedValueOnce(new Error('Service init failed'));

            await expect(extensionManager.restart())
                .rejects.toThrow('Service init failed');
        });
    });

    describe('telemetry', () => {
        test('tracks extension activation', () => {
            extensionManager.trackActivation();
            expect(mockLogger.info).toHaveBeenCalledWith(
                expect.stringContaining('Extension activated')
            );
        });

        test('tracks extension deactivation', () => {
            extensionManager.dispose();
            expect(mockLogger.info).toHaveBeenCalledWith(
                expect.stringContaining('Extension deactivated')
            );
        });
    });

    describe('resource cleanup', () => {
        test('cleans up resources on disposal', () => {
            const disposeSpy = jest.spyOn(extensionManager, 'dispose');
            extensionManager.dispose();

            expect(disposeSpy).toHaveBeenCalled();
            expect(mockLogger.info).toHaveBeenCalledWith(
                expect.stringContaining('Extension deactivated')
            );
        });

        test('releases all services on disposal', () => {
            const services = (extensionManager as any).services;
            const disposeSpies = new Map();

            // Add dispose spies to all services
            if (services) {
                for (const [name, service] of Object.entries(services)) {
                    if (service && typeof service.dispose === 'function') {
                        disposeSpies.set(name, jest.spyOn(service, 'dispose'));
                    }
                }
            }

            extensionManager.dispose();

            // Verify all services were disposed
            for (const spy of disposeSpies.values()) {
                expect(spy).toHaveBeenCalled();
            }
        });
    });
});
