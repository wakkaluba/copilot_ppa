"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var perf_hooks_1 = require("perf_hooks");
var codeProcessor_1 = require("../../src/code/codeProcessor");
describe('Code Processing Performance', function () {
    // Generate large code sample for testing
    var generateLargeCodeSample = function (size) {
        var lines = [];
        for (var i = 0; i < size; i++) {
            lines.push("// Line ".concat(i));
            lines.push("function test".concat(i, "() {"));
            lines.push("  const value = ".concat(i, ";"));
            lines.push("  return value * 2;");
            lines.push("}");
            lines.push('');
        }
        return lines.join('\n');
    };
    test('processes code with acceptable performance', function () {
        var processor = new codeProcessor_1.CodeProcessor();
        var sampleCode = generateLargeCodeSample(1000); // 5000 lines of code
        var startTime = perf_hooks_1.performance.now();
        processor.process(sampleCode);
        var endTime = perf_hooks_1.performance.now();
        var executionTime = endTime - startTime;
        console.log("Code processing took ".concat(executionTime, "ms for 5000 lines"));
        // Verify performance is within acceptable range
        // Threshold depends on your requirements
        expect(executionTime).toBeLessThan(1000); // Processing should take less than 1 second
    });
    test('handles large files efficiently', function () {
        var processor = new codeProcessor_1.CodeProcessor();
        var largeSampleCode = generateLargeCodeSample(5000); // 25000 lines of code
        var startTime = perf_hooks_1.performance.now();
        processor.process(largeSampleCode);
        var endTime = perf_hooks_1.performance.now();
        var executionTime = endTime - startTime;
        console.log("Large code processing took ".concat(executionTime, "ms for 25000 lines"));
        // Larger files have proportional performance
        expect(executionTime).toBeLessThan(5000); // Should process in under 5 seconds
    });
    test('memory usage stays within bounds', function () {
        // This is a simple way to check for memory leaks
        // For more accurate tests, consider using a memory profiler
        var processor = new codeProcessor_1.CodeProcessor();
        var memoryBefore = process.memoryUsage().heapUsed;
        // Process multiple files
        for (var i = 0; i < 10; i++) {
            var code = generateLargeCodeSample(500);
            processor.process(code);
        }
        // Force garbage collection if possible
        if (global.gc) {
            global.gc();
        }
        var memoryAfter = process.memoryUsage().heapUsed;
        var memoryIncrease = memoryAfter - memoryBefore;
        console.log("Memory increase: ".concat(memoryIncrease / 1024 / 1024, " MB"));
        // Check that memory increase is reasonable
        // This threshold depends on your application
        expect(memoryIncrease).toBeLessThan(100 * 1024 * 1024); // Less than 100MB increase
    });
});
