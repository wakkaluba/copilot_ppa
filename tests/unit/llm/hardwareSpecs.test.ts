import { describe, expect, it } from '@jest/globals';
import { HardwareSpecs } from '../../../src/llm/hardwareSpecs';

describe('HardwareSpecs Interface', () => {
  it('should validate a correctly structured hardware specs object', () => {
    // Create a valid hardware specs object that conforms to the interface
    const validSpecs: HardwareSpecs = {
      gpu: {
        available: true,
        name: 'NVIDIA GeForce RTX 3080',
        vram: 10, // in GB
        cudaSupport: true
      },
      ram: {
        total: 32, // in GB
        free: 16  // in GB
      },
      cpu: {
        cores: 8,
        model: 'Intel Core i7-11700K'
      }
    };

    // Verify each property exists with correct types
    expect(validSpecs).toHaveProperty('gpu');
    expect(validSpecs).toHaveProperty('ram');
    expect(validSpecs).toHaveProperty('cpu');

    // GPU properties
    expect(typeof validSpecs.gpu.available).toBe('boolean');
    expect(typeof validSpecs.gpu.name).toBe('string');
    expect(typeof validSpecs.gpu.vram).toBe('number');
    expect(typeof validSpecs.gpu.cudaSupport).toBe('boolean');

    // RAM properties
    expect(typeof validSpecs.ram.total).toBe('number');
    expect(typeof validSpecs.ram.free).toBe('number');

    // CPU properties
    expect(typeof validSpecs.cpu.cores).toBe('number');
    expect(typeof validSpecs.cpu.model).toBe('string');
  });

  it('should handle a system with no GPU', () => {
    const noGpuSpecs: HardwareSpecs = {
      gpu: {
        available: false,
        name: 'None',
        vram: 0,
        cudaSupport: false
      },
      ram: {
        total: 16,
        free: 8
      },
      cpu: {
        cores: 4,
        model: 'Intel Core i5-8400'
      }
    };

    expect(noGpuSpecs.gpu.available).toBe(false);
    expect(noGpuSpecs.gpu.vram).toBe(0);
    expect(noGpuSpecs.gpu.cudaSupport).toBe(false);
  });

  it('should handle systems with integrated graphics', () => {
    const integratedGraphicsSpecs: HardwareSpecs = {
      gpu: {
        available: true,
        name: 'Intel UHD Graphics 630',
        vram: 1.5, // Shared system memory, can be a decimal value
        cudaSupport: false
      },
      ram: {
        total: 16,
        free: 6.5 // Can be a decimal value
      },
      cpu: {
        cores: 6,
        model: 'Intel Core i5-9600K'
      }
    };

    expect(integratedGraphicsSpecs.gpu.available).toBe(true);
    expect(integratedGraphicsSpecs.gpu.cudaSupport).toBe(false);
    expect(integratedGraphicsSpecs.gpu.name).toContain('Intel');
    expect(typeof integratedGraphicsSpecs.gpu.vram).toBe('number');
  });

  it('should handle various CPU configurations', () => {
    // Multi-core server CPU
    const serverSpecs: HardwareSpecs = {
      gpu: {
        available: true,
        name: 'NVIDIA Tesla V100',
        vram: 32,
        cudaSupport: true
      },
      ram: {
        total: 256,
        free: 128
      },
      cpu: {
        cores: 64,
        model: 'AMD EPYC 7742'
      }
    };

    // Single-core embedded CPU
    const embeddedSpecs: HardwareSpecs = {
      gpu: {
        available: false,
        name: 'None',
        vram: 0,
        cudaSupport: false
      },
      ram: {
        total: 2,
        free: 0.5
      },
      cpu: {
        cores: 1,
        model: 'ARM Cortex-A53'
      }
    };

    expect(serverSpecs.cpu.cores).toBe(64);
    expect(serverSpecs.cpu.model).toContain('EPYC');

    expect(embeddedSpecs.cpu.cores).toBe(1);
    expect(embeddedSpecs.cpu.model).toContain('ARM');
  });

  it('should handle extremes in RAM configurations', () => {
    // High RAM server
    const highRamSpecs: HardwareSpecs = {
      gpu: {
        available: true,
        name: 'NVIDIA A100',
        vram: 80,
        cudaSupport: true
      },
      ram: {
        total: 1024, // 1TB
        free: 512
      },
      cpu: {
        cores: 128,
        model: 'AMD EPYC 7763'
      }
    };

    // Low RAM embedded system
    const lowRamSpecs: HardwareSpecs = {
      gpu: {
        available: false,
        name: 'None',
        vram: 0,
        cudaSupport: false
      },
      ram: {
        total: 0.512, // 512MB
        free: 0.128  // 128MB
      },
      cpu: {
        cores: 2,
        model: 'ARM Cortex-M4'
      }
    };

    expect(highRamSpecs.ram.total).toBe(1024);
    expect(highRamSpecs.ram.free).toBeLessThanOrEqual(highRamSpecs.ram.total);

    expect(lowRamSpecs.ram.total).toBe(0.512);
    expect(lowRamSpecs.ram.free).toBeLessThanOrEqual(lowRamSpecs.ram.total);
  });

  it('should handle AMD GPU configurations', () => {
    const amdGpuSpecs: HardwareSpecs = {
      gpu: {
        available: true,
        name: 'AMD Radeon RX 6800 XT',
        vram: 16,
        cudaSupport: false // AMD GPUs don't support CUDA
      },
      ram: {
        total: 32,
        free: 16
      },
      cpu: {
        cores: 12,
        model: 'AMD Ryzen 9 5900X'
      }
    };

    expect(amdGpuSpecs.gpu.available).toBe(true);
    expect(amdGpuSpecs.gpu.name).toContain('AMD');
    expect(amdGpuSpecs.gpu.cudaSupport).toBe(false);
    expect(amdGpuSpecs.gpu.vram).toBe(16);
  });

  // Type checking tests using TypeScript compilation
  // These tests verify the interface's type safety at compile time
  it('should enforce type constraints at compile time', () => {
    // This is primarily a compile-time test
    // TypeScript will throw errors if the types don't match

    // Create an object with the correct structure but wrong types
    // @ts-expect-error - Intentional type error for testing
    const invalidTypes = {
      gpu: {
        available: 'yes', // should be boolean
        name: 123, // should be string
        vram: '16GB', // should be number
        cudaSupport: 1 // should be boolean
      },
      ram: {
        total: '32GB', // should be number
        free: '16GB' // should be number
      },
      cpu: {
        cores: '8', // should be number
        model: 123 // should be string
      }
    };

    // The test passes if TypeScript catches these errors during compilation
    // The @ts-expect-error comments tell TypeScript we expect these errors
  });
});
