import { performance } from 'perf_hooks';
import { CodeProcessor } from '../../src/code/codeProcessor';

describe('Code Processing Performance', () => {
  // Generate large code sample for testing
  const generateLargeCodeSample = (size: number): string => {
    const lines = [];
    for (let i = 0; i < size; i++) {
      lines.push(`// Line ${i}`);
      lines.push(`function test${i}() {`);
      lines.push(`  const value = ${i};`);
      lines.push(`  return value * 2;`);
      lines.push(`}`);
      lines.push('');
    }
    return lines.join('\n');
  };
  
  test('processes code with acceptable performance', () => {
    const processor = new CodeProcessor();
    const sampleCode = generateLargeCodeSample(1000); // 5000 lines of code
    
    const startTime = performance.now();
    processor.process(sampleCode);
    const endTime = performance.now();
    
    const executionTime = endTime - startTime;
    console.log(`Code processing took ${executionTime}ms for 5000 lines`);
    
    // Verify performance is within acceptable range
    // Threshold depends on your requirements
    expect(executionTime).toBeLessThan(1000); // Processing should take less than 1 second
  });
  
  test('handles large files efficiently', () => {
    const processor = new CodeProcessor();
    const largeSampleCode = generateLargeCodeSample(5000); // 25000 lines of code
    
    const startTime = performance.now();
    processor.process(largeSampleCode);
    const endTime = performance.now();
    
    const executionTime = endTime - startTime;
    console.log(`Large code processing took ${executionTime}ms for 25000 lines`);
    
    // Larger files have proportional performance
    expect(executionTime).toBeLessThan(5000); // Should process in under 5 seconds
  });
  
  test('memory usage stays within bounds', () => {
    // This is a simple way to check for memory leaks
    // For more accurate tests, consider using a memory profiler
    
    const processor = new CodeProcessor();
    const memoryBefore = process.memoryUsage().heapUsed;
    
    // Process multiple files
    for (let i = 0; i < 10; i++) {
      const code = generateLargeCodeSample(500);
      processor.process(code);
    }
    
    // Force garbage collection if possible
    if (global.gc) {
      global.gc();
    }
    
    const memoryAfter = process.memoryUsage().heapUsed;
    const memoryIncrease = memoryAfter - memoryBefore;
    
    console.log(`Memory increase: ${memoryIncrease / 1024 / 1024} MB`);
    
    // Check that memory increase is reasonable
    // This threshold depends on your application
    expect(memoryIncrease).toBeLessThan(100 * 1024 * 1024); // Less than 100MB increase
  });
});
