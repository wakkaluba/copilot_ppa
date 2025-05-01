import * as assert from 'assert';
import * as typeExports from '../../../../../src/buildTools/optimization/types';
import * as indexExports from '../../../../../src/buildTools/optimization/types/index';

suite('Build Tools Optimization Types Index Tests', () => {
    test('should re-export all types from the main types module', () => {
        // Get all the keys from the main types module
        const mainTypeKeys = Object.keys(typeExports);
        const indexTypeKeys = Object.keys(indexExports);

        // Ensure every key from the main types is also in the index exports
        mainTypeKeys.forEach(key => {
            assert.ok(indexTypeKeys.includes(key), `Type '${key}' should be re-exported from index`);
            assert.strictEqual(indexExports[key], typeExports[key], `Type '${key}' should reference the same object`);
        });
    });

    test('should export script analysis interfaces', () => {
        assert.ok(indexExports.hasOwnProperty('ScriptAnalysis'), 'ScriptAnalysis interface should be exported');
        assert.ok(indexExports.hasOwnProperty('ScriptOptimizationSuggestion'), 'ScriptOptimizationSuggestion interface should be exported');
    });

    test('should export optimization types', () => {
        assert.ok(indexExports.hasOwnProperty('OptimizationType'), 'OptimizationType enum should be exported');

        // Verify OptimizationType enum values
        const OptimizationType = indexExports.OptimizationType;
        assert.ok(OptimizationType.hasOwnProperty('CROSS_PLATFORM'), 'Should have CROSS_PLATFORM optimization type');
        assert.ok(OptimizationType.hasOwnProperty('PARALLEL_EXECUTION'), 'Should have PARALLEL_EXECUTION optimization type');
        assert.ok(OptimizationType.hasOwnProperty('BUILD_CLEANING'), 'Should have BUILD_CLEANING optimization type');
        assert.ok(OptimizationType.hasOwnProperty('WEBPACK_OPTIMIZATION'), 'Should have WEBPACK_OPTIMIZATION optimization type');
        assert.ok(OptimizationType.hasOwnProperty('TYPESCRIPT_OPTIMIZATION'), 'Should have TYPESCRIPT_OPTIMIZATION optimization type');
    });

    test('should export build tool type definitions', () => {
        assert.ok(indexExports.hasOwnProperty('BuildTool'), 'BuildTool enum should be exported');

        // Verify BuildTool enum values
        const BuildTool = indexExports.BuildTool;
        assert.ok(BuildTool.hasOwnProperty('WEBPACK'), 'Should have WEBPACK build tool');
        assert.ok(BuildTool.hasOwnProperty('ROLLUP'), 'Should have ROLLUP build tool');
        assert.ok(BuildTool.hasOwnProperty('PARCEL'), 'Should have PARCEL build tool');
        assert.ok(BuildTool.hasOwnProperty('TYPESCRIPT'), 'Should have TYPESCRIPT build tool');
        assert.ok(BuildTool.hasOwnProperty('VITE'), 'Should have VITE build tool');
    });

    test('should export package.json interfaces', () => {
        assert.ok(indexExports.hasOwnProperty('PackageJson'), 'PackageJson interface should be exported');
        assert.ok(indexExports.hasOwnProperty('PackageJsonScripts'), 'PackageJsonScripts interface should be exported');
    });

    test('should export build script optimizer interfaces', () => {
        assert.ok(indexExports.hasOwnProperty('BuildScriptOptimizerOptions'), 'BuildScriptOptimizerOptions interface should be exported');
        assert.ok(indexExports.hasOwnProperty('BuildScriptOptimizationResult'), 'BuildScriptOptimizationResult interface should be exported');
    });

    test('should not export any additional types', () => {
        // Verify that index doesn't have any extra exports that don't exist in the main types
        const indexTypeKeys = Object.keys(indexExports);
        const mainTypeKeys = Object.keys(typeExports);

        indexTypeKeys.forEach(key => {
            assert.ok(mainTypeKeys.includes(key), `Index exports additional type '${key}' that isn't in main types`);
        });
    });
});
