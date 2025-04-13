// Global type declarations for test frameworks
/// <reference types="mocha" />
/// <reference types="sinon" />
/// <reference types="node" />

declare global {
    // Mocha TDD interface
    function suite(name: string, fn: () => void): void;
    function test(name: string, fn: Function): void;
    function setup(fn: Function): void;
    function teardown(fn: Function): void;
    function suiteTeardown(fn: Function): void;
    function suiteSetup(fn: Function): void;
    
    // BDD aliases
    const describe: typeof suite;
    const it: typeof test;
    const before: typeof setup;
    const after: typeof teardown;
    const beforeEach: typeof setup;
    const afterEach: typeof teardown;
    
    // Context alias
    const context: typeof suite;
    
    // Sinon globals
    namespace NodeJS {
        interface Global {
            sinon: typeof import('sinon');
        }
    }
}

// This export makes TypeScript treat this as a module
export {};