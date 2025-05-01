import * as assert from 'assert';
import * as types from '../../../../src/buildTools/optimization/types';

suite('Build Tools Optimization Types Tests', () => {
    test('should export script analysis interfaces', () => {
        assert.ok(types.hasOwnProperty('ScriptAnalysis'), 'ScriptAnalysis interface should be exported');
        assert.ok(types.hasOwnProperty('ScriptOptimizationSuggestion'), 'ScriptOptimizationSuggestion interface should be exported');
    });

    test('should export optimization types', () => {
        assert.ok(types.hasOwnProperty('OptimizationType'), 'OptimizationType enum should be exported');

        // Verify OptimizationType enum values
        const OptimizationType = types.OptimizationType;
        assert.ok(OptimizationType.hasOwnProperty('CROSS_PLATFORM'), 'Should have CROSS_PLATFORM optimization type');
        assert.ok(OptimizationType.hasOwnProperty('PARALLEL_EXECUTION'), 'Should have PARALLEL_EXECUTION optimization type');
        assert.ok(OptimizationType.hasOwnProperty('BUILD_CLEANING'), 'Should have BUILD_CLEANING optimization type');
        assert.ok(OptimizationType.hasOwnProperty('WEBPACK_OPTIMIZATION'), 'Should have WEBPACK_OPTIMIZATION optimization type');
        assert.ok(OptimizationType.hasOwnProperty('TYPESCRIPT_OPTIMIZATION'), 'Should have TYPESCRIPT_OPTIMIZATION optimization type');
    });

    test('should export script analyzer options interface', () => {
        assert.ok(types.hasOwnProperty('ScriptAnalyzerOptions'), 'ScriptAnalyzerOptions interface should be exported');
    });

    test('should export build tool type definitions', () => {
        assert.ok(types.hasOwnProperty('BuildTool'), 'BuildTool enum should be exported');

        // Verify BuildTool enum values
        const BuildTool = types.BuildTool;
        assert.ok(BuildTool.hasOwnProperty('WEBPACK'), 'Should have WEBPACK build tool');
        assert.ok(BuildTool.hasOwnProperty('ROLLUP'), 'Should have ROLLUP build tool');
        assert.ok(BuildTool.hasOwnProperty('PARCEL'), 'Should have PARCEL build tool');
        assert.ok(BuildTool.hasOwnProperty('TYPESCRIPT'), 'Should have TYPESCRIPT build tool');
        assert.ok(BuildTool.hasOwnProperty('VITE'), 'Should have VITE build tool');
    });

    test('should export script complexity analysis interface', () => {
        assert.ok(types.hasOwnProperty('ScriptComplexityAnalysis'), 'ScriptComplexityAnalysis interface should be exported');
    });

    test('should export environment variable analysis interface', () => {
        assert.ok(types.hasOwnProperty('EnvironmentVariableAnalysis'), 'EnvironmentVariableAnalysis interface should be exported');
    });

    test('should export command types and interfaces', () => {
        assert.ok(types.hasOwnProperty('CommandType'), 'CommandType enum should be exported');
        assert.ok(types.hasOwnProperty('CommandAnalysis'), 'CommandAnalysis interface should be exported');

        // Verify CommandType enum values
        const CommandType = types.CommandType;
        assert.ok(CommandType.hasOwnProperty('SEQUENTIAL'), 'Should have SEQUENTIAL command type');
        assert.ok(CommandType.hasOwnProperty('PARALLEL'), 'Should have PARALLEL command type');
        assert.ok(CommandType.hasOwnProperty('SINGLE'), 'Should have SINGLE command type');
    });

    test('should export package.json interfaces', () => {
        assert.ok(types.hasOwnProperty('PackageJson'), 'PackageJson interface should be exported');
        assert.ok(types.hasOwnProperty('PackageJsonScripts'), 'PackageJsonScripts interface should be exported');
    });

    test('should export optimization suggestion interfaces', () => {
        assert.ok(types.hasOwnProperty('OptimizationSuggestion'), 'OptimizationSuggestion interface should be exported');
        assert.ok(types.hasOwnProperty('OptimizationConfig'), 'OptimizationConfig interface should be exported');
    });

    test('should export build script optimizer interfaces', () => {
        assert.ok(types.hasOwnProperty('BuildScriptOptimizerOptions'), 'BuildScriptOptimizerOptions interface should be exported');
        assert.ok(types.hasOwnProperty('BuildScriptOptimizationResult'), 'BuildScriptOptimizationResult interface should be exported');
    });
});
