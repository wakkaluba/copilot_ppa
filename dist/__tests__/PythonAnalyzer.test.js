"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var pythonAnalyzer_1 = require("../performance/analyzers/pythonAnalyzer");
describe('PythonAnalyzer', function () {
    var analyzer;
    beforeEach(function () {
        var options = {
            maxFileSize: 1024 * 1024,
            excludePatterns: [],
            includeTests: true,
            thresholds: {
                cyclomaticComplexity: [10, 20],
                nestedBlockDepth: [3, 5],
                functionLength: [50, 100],
                parameterCount: [4, 7],
                maintainabilityIndex: [65, 85],
                commentRatio: [10, 20]
            }
        };
        analyzer = new pythonAnalyzer_1.PythonAnalyzer(options);
    });
    describe('analyze', function () {
        it('should detect inefficient list concatenation', function () {
            var _a;
            var code = "\ndef process_items(items):\n    result = []\n    for item in items:\n        result += [item]  # Inefficient\n    return result\n";
            var result = analyzer.analyze(code, 'test.py');
            expect(result.issues.length).toBeGreaterThan(0);
            expect((_a = result.issues[0]) === null || _a === void 0 ? void 0 : _a.title).toBe('Inefficient List Concatenation');
        });
        it('should detect string concatenation anti-pattern', function () {
            var _a;
            var code = "\ndef greet(first_name, last_name):\n    message = \"Hello, \" + first_name + \" \" + last_name\n    return message\n";
            var result = analyzer.analyze(code, 'test.py');
            expect(result.issues.length).toBeGreaterThan(0);
            expect((_a = result.issues[0]) === null || _a === void 0 ? void 0 : _a.title).toBe('String Concatenation');
        });
        it('should suggest list comprehension for nested loops', function () {
            var _a;
            var code = "\ndef cartesian_product(xs, ys):\n    result = []\n    for x in xs:\n        for y in ys:\n            result.append((x, y))\n    return result\n";
            var result = analyzer.analyze(code, 'test.py');
            expect(result.issues.length).toBeGreaterThan(0);
            expect((_a = result.issues[0]) === null || _a === void 0 ? void 0 : _a.title).toBe('Nested Loops');
        });
        it('should detect large range list creation', function () {
            var _a;
            var code = "\ndef process_range():\n    numbers = list(range(1000000))\n    for num in numbers:\n        process(num)\n";
            var result = analyzer.analyze(code, 'test.py');
            expect(result.issues.length).toBeGreaterThan(0);
            expect((_a = result.issues[0]) === null || _a === void 0 ? void 0 : _a.title).toBe('Large Range List Creation');
        });
        it('should calculate correct Python metrics', function () {
            var code = "\nimport os\nfrom typing import List, Optional\n\n@dataclass\nclass User:\n    name: str\n    age: int\n\ndef process_users(users: List[User]) -> List[dict]:\n    return [{'name': user.name, 'age': user.age} for user in users]\n\ndef get_user(id: int) -> Optional[User]:\n    for i in range(10):\n        yield User('test', i)\n";
            var result = analyzer.analyze(code, 'test.py');
            var metrics = result.metrics;
            expect(metrics['functionCount']).toBe(2);
            expect(metrics['classCount']).toBe(1);
            expect(metrics['decoratorCount']).toBe(1);
            expect(metrics['generatorCount']).toBe(1);
            expect(metrics['comprehensionCount']).toBe(1);
            expect(metrics['importCount']).toBe(2);
        });
    });
});
//# sourceMappingURL=PythonAnalyzer.test.js.map