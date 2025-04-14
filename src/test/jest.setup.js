// Define Mocha-like globals for Jest
global.suite = describe;
global.test = it;
global.suiteSetup = beforeAll;
global.suiteTeardown = afterAll;
global.setup = beforeEach;
global.teardown = afterEach;

// Set up Jest mock for VS Code objects that don't exist in Jest tests
global.acquireVsCodeApi = jest.fn(() => ({
  postMessage: jest.fn(),
  setState: jest.fn(),
  getState: jest.fn()
}));
