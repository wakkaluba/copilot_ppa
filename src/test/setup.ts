// Add Mocha-like functions for use in VS Code extension tests
global.suite = (name: string, fn: () => void) => describe(name, fn);
global.test = (name: string, fn: () => void) => it(name, fn);
global.suiteSetup = (fn: () => void) => beforeAll(fn);
global.suiteTeardown = (fn: () => void) => afterAll(fn);
global.setup = (fn: () => void) => beforeEach(fn);
global.teardown = (fn: () => void) => afterEach(fn);

// Include this in your tests with:
// import '../test/setup';
