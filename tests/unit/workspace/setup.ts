import { jest } from '@jest/globals';

// Mock VS Code module
jest.mock('vscode', () => ({
    window: {
        createOutputChannel: jest.fn().mockReturnValue({
            appendLine: jest.fn(),
            show: jest.fn(),
            dispose: jest.fn()
        })
    },
    workspace: {
        getConfiguration: jest.fn().mockReturnValue({
            get: jest.fn(),
            update: jest.fn()
        }),
        workspaceFolders: [],
        onDidChangeConfiguration: jest.fn().mockReturnValue({ dispose: jest.fn() })
    },
    EventEmitter: jest.fn().mockImplementation(() => ({
        event: jest.fn(),
        fire: jest.fn(),
        dispose: jest.fn()
    }))
}));

beforeEach(() => {
    jest.clearAllMocks();
});
