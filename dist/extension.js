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
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const commands_1 = require("./commands");
const statusBar_1 = require("./statusBar");
const config_1 = require("./config");
const logging_1 = require("./utils/logging");
const telemetry_1 = require("./utils/telemetry");
/**
 * Main activation function for the Copilot PPA extension
 *
 * This function initializes all core services and components of the extension:
 * - Logging service for diagnostic information
 * - Configuration management for user settings
 * - Status bar integration for visual feedback
 * - Command registration for extension functionality
 * - Telemetry for usage analytics (respecting user privacy settings)
 *
 * @param context The extension context provided by VS Code
 * @returns A Promise that resolves when activation is complete
 */
async function activate(context) {
    const state = {
        isActivated: false,
        services: {}
    };
    try {
        // Initialize logging service first for proper error tracking
        state.services.logging = new logging_1.LoggingService('Copilot PPA');
        context.subscriptions.push(state.services.logging);
        state.services.logging.log('Activating Copilot PPA extension');
        // Initialize telemetry service
        state.services.telemetry = new telemetry_1.TelemetryService(context);
        context.subscriptions.push(state.services.telemetry);
        // Initialize configuration manager
        state.services.config = await initializeConfigManager(context, state.services.logging);
        // Initialize status bar with proper error handling
        state.services.statusBar = await initializeStatusBar(context, state.services.logging);
        // Register all commands with proper error handling
        state.services.commands = await initializeCommands(context, state.services.config, state.services.logging);
        // Handle first-time activation experience
        await handleFirstTimeActivation(context, state.services.logging);
        state.isActivated = true;
        state.services.logging.log('Copilot PPA extension activated successfully');
        state.services.telemetry.trackEvent('extension_activated');
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        if (state.services.logging) {
            state.services.logging.error('Failed to activate Copilot PPA extension', error);
        }
        else {
            console.error('Failed to initialize logging service', error);
        }
        vscode.window.showErrorMessage(`Failed to activate Copilot PPA extension: ${errorMessage}`);
        // Attempt recovery if possible
        await attemptRecovery(state, context);
    }
}
/**
 * Initializes the configuration manager
 * @param context The extension context
 * @param logging The logging service
 * @returns The initialized ConfigManager
 */
async function initializeConfigManager(context, logging) {
    logging.log('Initializing configuration manager');
    const configManager = new config_1.ConfigManager(context);
    await configManager.initialize();
    return configManager;
}
/**
 * Initializes the status bar manager
 * @param context The extension context
 * @param logging The logging service
 * @returns The initialized StatusBarManager
 */
async function initializeStatusBar(context, logging) {
    logging.log('Initializing status bar');
    const statusBarManager = new statusBar_1.StatusBarManager(context);
    await statusBarManager.initialize();
    return statusBarManager;
}
/**
 * Initializes the command manager and registers all commands
 * @param context The extension context
 * @param configManager The configuration manager
 * @param logging The logging service
 * @returns The initialized CommandManager
 */
async function initializeCommands(context, configManager, logging) {
    logging.log('Registering extension commands');
    const commandManager = new commands_1.CommandManager(context, configManager);
    await commandManager.registerCommands();
    // Register the welcome message command separately for clarity
    const welcomeMessageDisposable = vscode.commands.registerCommand('copilot-ppa.showWelcomeMessage', () => {
        vscode.window.showInformationMessage('Copilot Productivity and Performance Analyzer is active!');
    });
    context.subscriptions.push(welcomeMessageDisposable);
    return commandManager;
}
/**
 * Handles first-time activation experience for the user
 * @param context The extension context
 * @param logging The logging service
 */
async function handleFirstTimeActivation(context, logging) {
    const isFirstActivation = context.globalState.get('firstActivation', true);
    if (isFirstActivation) {
        logging.log('First time activation detected, showing welcome message');
        await vscode.commands.executeCommand('copilot-ppa.showWelcomeMessage');
        await context.globalState.update('firstActivation', false);
    }
}
/**
 * Attempts to recover from activation errors
 * @param state The current extension state
 * @param context The extension context
 */
async function attemptRecovery(state, context) {
    if (state.services.logging) {
        state.services.logging.log('Attempting recovery from activation failure');
    }
    // At minimum, try to ensure the status bar shows the error state
    try {
        if (!state.services.statusBar) {
            const statusBarManager = new statusBar_1.StatusBarManager(context);
            await statusBarManager.initialize();
            await statusBarManager.setErrorState();
        }
        else {
            await state.services.statusBar.setErrorState();
        }
    }
    catch (recoveryError) {
        // If recovery fails, we've done our best - just log the error
        if (state.services.logging) {
            state.services.logging.error('Recovery attempt failed', recoveryError);
        }
    }
}
/**
 * Deactivation handler for the Copilot PPA extension
 *
 * Performs cleanup of resources and ensures all services are properly disposed
 */
async function deactivate() {
    try {
        // Any additional cleanup can be performed here
        console.log('Copilot PPA extension deactivated');
    }
    catch (error) {
        console.error('Error during Copilot PPA extension deactivation:', error);
    }
}
//# sourceMappingURL=extension.js.map