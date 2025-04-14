// Add globals used in VS Code's test framework
global.suite = (name: string, fn: () => void) => describe(name, fn);
global.test = (name: string, fn: () => void) => it(name, fn);

// Include this in your tests with:
// import '../test/setup';
