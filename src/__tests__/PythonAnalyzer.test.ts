import { PythonAnalyzer } from '../performance/analyzers/pythonAnalyzer';
import { AnalyzerOptions, PerformanceAnalysisResult } from '../performance/types';

describe('PythonAnalyzer', () => {
    let analyzer: PythonAnalyzer;
    
    beforeEach(() => {
        const options: AnalyzerOptions = {
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
        analyzer = new PythonAnalyzer(options);
    });

    describe('analyze', () => {
        it('should detect inefficient list concatenation', () => {
            const code = `
def process_items(items):
    result = []
    for item in items:
        result += [item]  # Inefficient
    return result
`;
            const result = analyzer.analyze(code, 'test.py');
            expect(result.issues.length).toBeGreaterThan(0);
            expect(result.issues[0]?.title).toBe('Inefficient List Concatenation');
        });

        it('should detect string concatenation anti-pattern', () => {
            const code = `
def greet(first_name, last_name):
    message = "Hello, " + first_name + " " + last_name
    return message
`;
            const result = analyzer.analyze(code, 'test.py');
            expect(result.issues.length).toBeGreaterThan(0);
            expect(result.issues[0]?.title).toBe('String Concatenation');
        });

        it('should suggest list comprehension for nested loops', () => {
            const code = `
def cartesian_product(xs, ys):
    result = []
    for x in xs:
        for y in ys:
            result.append((x, y))
    return result
`;
            const result = analyzer.analyze(code, 'test.py');
            expect(result.issues.length).toBeGreaterThan(0);
            expect(result.issues[0]?.title).toBe('Nested Loops');
        });

        it('should detect large range list creation', () => {
            const code = `
def process_range():
    numbers = list(range(1000000))
    for num in numbers:
        process(num)
`;
            const result = analyzer.analyze(code, 'test.py');
            expect(result.issues.length).toBeGreaterThan(0);
            expect(result.issues[0]?.title).toBe('Large Range List Creation');
        });

        it('should calculate correct Python metrics', () => {
            const code = `
import os
from typing import List, Optional

@dataclass
class User:
    name: str
    age: int

def process_users(users: List[User]) -> List[dict]:
    return [{'name': user.name, 'age': user.age} for user in users]

def get_user(id: int) -> Optional[User]:
    for i in range(10):
        yield User('test', i)
`;
            const result = analyzer.analyze(code, 'test.py');
            const metrics = result.metrics;
            
            expect(metrics['functionCount']).toBe(2);
            expect(metrics['classCount']).toBe(1);
            expect(metrics['decoratorCount']).toBe(1);
            expect(metrics['generatorCount']).toBe(1);
            expect(metrics['comprehensionCount']).toBe(1);
            expect(metrics['importCount']).toBe(2);
        });
    });
});