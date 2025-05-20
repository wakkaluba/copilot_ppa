import { CopilotCommandRegistrationService } from '../../src/services/CopilotCommandRegistrationService';

// Mock VS Code API
jest.mock('vscode', () => ({
  commands: {
    registerCommand: jest.fn(),
    executeCommand: jest.fn(),
  },
  Disposable: class { dispose() {} },
}));

describe('CopilotCommandRegistrationService', () => {
  let service: CopilotCommandRegistrationService;

  beforeEach(() => {
    service = new CopilotCommandRegistrationService();
  });

  it('should register commands without error', () => {
    expect(() => service.registerCommands()).not.toThrow();
  });

  it('should dispose without error', () => {
    expect(() => service.dispose()).not.toThrow();
  });

  // Add more tests as needed for command registration logic
});
