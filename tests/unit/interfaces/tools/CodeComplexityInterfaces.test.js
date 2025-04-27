"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMockFunctionComplexity = createMockFunctionComplexity;
exports.createMockComplexityResult = createMockComplexityResult;
describe('FunctionComplexity interface', function () {
    it('should create a valid function complexity object', function () {
        var functionComplexity = {
            name: 'calculateTotal',
            complexity: 5,
            startLine: 10,
            endLine: 25,
            startColumn: 2,
            endColumn: 3
        };
        expect(functionComplexity).toBeDefined();
        expect(functionComplexity.name).toBe('calculateTotal');
        expect(functionComplexity.complexity).toBe(5);
        expect(functionComplexity.startLine).toBe(10);
        expect(functionComplexity.endLine).toBe(25);
        expect(functionComplexity.startColumn).toBe(2);
        expect(functionComplexity.endColumn).toBe(3);
    });
    it('should create a function complexity for an anonymous function', function () {
        var functionComplexity = {
            name: '<anonymous>',
            complexity: 3,
            startLine: 30,
            endLine: 35,
            startColumn: 12,
            endColumn: 2
        };
        expect(functionComplexity).toBeDefined();
        expect(functionComplexity.name).toBe('<anonymous>');
        expect(functionComplexity.complexity).toBe(3);
    });
    it('should create a function complexity for a complex function', function () {
        var functionComplexity = {
            name: 'processUserInput',
            complexity: 15, // High complexity
            startLine: 42,
            endLine: 142,
            startColumn: 0,
            endColumn: 1
        };
        expect(functionComplexity).toBeDefined();
        expect(functionComplexity.name).toBe('processUserInput');
        expect(functionComplexity.complexity).toBe(15);
        expect(functionComplexity.startLine).toBe(42);
        expect(functionComplexity.endLine).toBe(142);
    });
});
describe('ComplexityResult interface', function () {
    it('should create a valid complexity result for a file', function () {
        var functions = [
            {
                name: 'function1',
                complexity: 3,
                startLine: 10,
                endLine: 20,
                startColumn: 2,
                endColumn: 3
            },
            {
                name: 'function2',
                complexity: 5,
                startLine: 25,
                endLine: 40,
                startColumn: 2,
                endColumn: 3
            }
        ];
        var result = {
            filePath: '/project/src/file.ts',
            fileName: 'file.ts',
            totalComplexity: 8,
            functions: functions,
            averageComplexity: 4
        };
        expect(result).toBeDefined();
        expect(result.filePath).toBe('/project/src/file.ts');
        expect(result.fileName).toBe('file.ts');
        expect(result.totalComplexity).toBe(8);
        expect(result.functions).toHaveLength(2);
        expect(result.functions[0].name).toBe('function1');
        expect(result.functions[1].name).toBe('function2');
        expect(result.averageComplexity).toBe(4);
    });
    it('should create a complexity result for an empty file', function () {
        var result = {
            filePath: '/project/src/empty.ts',
            fileName: 'empty.ts',
            totalComplexity: 0,
            functions: [],
            averageComplexity: 0
        };
        expect(result).toBeDefined();
        expect(result.filePath).toBe('/project/src/empty.ts');
        expect(result.fileName).toBe('empty.ts');
        expect(result.totalComplexity).toBe(0);
        expect(result.functions).toHaveLength(0);
        expect(result.averageComplexity).toBe(0);
    });
    it('should create a complexity result for a highly complex file', function () {
        var functions = [
            {
                name: 'complexFunction1',
                complexity: 20,
                startLine: 10,
                endLine: 100,
                startColumn: 0,
                endColumn: 1
            },
            {
                name: 'complexFunction2',
                complexity: 25,
                startLine: 110,
                endLine: 200,
                startColumn: 0,
                endColumn: 1
            },
            {
                name: 'simpleFunction',
                complexity: 1,
                startLine: 210,
                endLine: 220,
                startColumn: 0,
                endColumn: 1
            }
        ];
        var result = {
            filePath: '/project/src/complex.ts',
            fileName: 'complex.ts',
            totalComplexity: 46,
            functions: functions,
            averageComplexity: 15.33
        };
        expect(result).toBeDefined();
        expect(result.filePath).toBe('/project/src/complex.ts');
        expect(result.fileName).toBe('complex.ts');
        expect(result.totalComplexity).toBe(46);
        expect(result.functions).toHaveLength(3);
        expect(result.averageComplexity).toBeCloseTo(15.33, 2);
    });
});
/**
 * Mock factory functions for code complexity interfaces
 */
function createMockFunctionComplexity(overrides) {
    var defaultComplexity = {
        name: 'mockFunction',
        complexity: 4,
        startLine: 10,
        endLine: 20,
        startColumn: 0,
        endColumn: 2
    };
    return __assign(__assign({}, defaultComplexity), overrides);
}
function createMockComplexityResult(overrides) {
    var functions = [
        createMockFunctionComplexity(),
        createMockFunctionComplexity({
            name: 'anotherFunction',
            complexity: 8,
            startLine: 25,
            endLine: 40
        })
    ];
    var defaultResult = {
        filePath: '/mock/src/mockFile.ts',
        fileName: 'mockFile.ts',
        totalComplexity: 12,
        functions: functions,
        averageComplexity: 6
    };
    return __assign(__assign({}, defaultResult), overrides);
}
