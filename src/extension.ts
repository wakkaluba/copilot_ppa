import * as vscode from 'vscode';
import { ServiceContainer } from './services/ServiceContainer';
import { LoggingService } from './utils/logging';

let serviceContainer: ServiceContainer | undefined;

export async function activate(context: vscode.ExtensionContext): Promise<void> {
    const logging = new LoggingService('Copilot PPA');
    context.subscriptions.push(logging);

    try {
        logging.log('Initializing Copilot PPA extension');
        
        // Initialize service container
        serviceContainer = await ServiceContainer.initialize(context, logging);
        context.subscriptions.push(serviceContainer);
        
        await serviceContainer.startServices();
        
        logging.log('Copilot PPA extension activated successfully');
        await serviceContainer.telemetry.trackEvent('extension_activated');
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logging.error('Failed to activate Copilot PPA extension', error);
        vscode.window.showErrorMessage(`Failed to activate Copilot PPA extension: ${errorMessage}`);
        
        // Attempt recovery
        await attemptRecovery(context, logging);
    }
}

async function attemptRecovery(
    context: vscode.ExtensionContext,
    logging: LoggingService
): Promise<void> {
    logging.log('Attempting recovery from activation failure');
    
    try {
        if (serviceContainer) {
            await serviceContainer.dispose();
        }
        
        // Minimal recovery: ensure status bar shows error state
        const statusBar = await ServiceContainer.createMinimalStatusBar(context);
        await statusBar.setErrorState();
        context.subscriptions.push(statusBar);
    } catch (recoveryError) {
        logging.error('Recovery attempt failed', recoveryError);
    }
}

export async function deactivate(): Promise<void> {
    try {
        if (serviceContainer) {
            await serviceContainer.dispose();
            serviceContainer = undefined;
        }
    } catch (error) {
        console.error('Error during Copilot PPA extension deactivation:', error);
    }
}
