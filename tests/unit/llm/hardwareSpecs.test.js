const { describe, expect, it } = require('@jest/globals');
// We don't need to import the hardwareSpecs module directly since it's just an interface
// The tests will focus on validating objects that conform to the interface structure

describe('HardwareSpecs Interface (JavaScript)', () => {
  it('should validate a correctly structured hardware specs object', () => {
    // Create a valid hardware specs object that conforms to the interface
    const validSpecs = {
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
    const noGpuSpecs = {
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
    const integratedGraphicsSpecs = {
      gpu: {
        available: true,
        name: 'Intel UHD Graphics 630',
        vram: 1.5, // Shared system memory
        cudaSupport: false
      },
      ram: {
        total: 16,
        free: 6.5
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
    const serverSpecs = {
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
    const embeddedSpecs = {
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
    const highRamSpecs = {
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
    const lowRamSpecs = {
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
    const amdGpuSpecs = {
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

  // JavaScript-specific tests
  describe('JavaScript-specific behavior', () => {
    it('should handle property additions to the object', () => {
      const extendedSpecs = {
        gpu: {
          available: true,
          name: 'NVIDIA GeForce RTX 3090',
          vram: 24,
          cudaSupport: true,
          // Additional non-standard properties
          temperature: 75,
          fanSpeed: '60%'
        },
        ram: {
          total: 64,
          free: 32,
          // Additional non-standard property
          type: 'DDR4'
        },
        cpu: {
          cores: 16,
          model: 'AMD Ryzen 9 5950X',
          // Additional non-standard properties
          threads: 32,
          frequency: 3.4
        },
        // Additional top-level property
        storage: {
          total: 2000,
          free: 1200,
          type: 'SSD'
        }
      };

      // Object should still work with additional properties
      expect(extendedSpecs.gpu.available).toBe(true);
      expect(extendedSpecs.gpu.name).toBe('NVIDIA GeForce RTX 3090');
      expect(extendedSpecs.gpu.temperature).toBe(75);
      expect(extendedSpecs.cpu.threads).toBe(32);
      expect(extendedSpecs.storage.type).toBe('SSD');
    });

    it('should handle missing optional properties in JavaScript', () => {
      // In JavaScript we can have objects missing some properties
      const partialSpecs = {
        gpu: {
          available: true,
          name: 'NVIDIA GeForce GTX 1660'
          // Missing vram and cudaSupport
        },
        ram: {
          total: 16
          // Missing free
        },
        cpu: {
          // Missing cores
          model: 'Intel Core i5-10400F'
        }
      };

      // In JavaScript, missing properties are undefined
      expect(partialSpecs.gpu.vram).toBeUndefined();
      expect(partialSpecs.gpu.cudaSupport).toBeUndefined();
      expect(partialSpecs.ram.free).toBeUndefined();
      expect(partialSpecs.cpu.cores).toBeUndefined();
    });

    it('should handle null values in JavaScript', () => {
      const nullValueSpecs = {
        gpu: {
          available: false,
          name: null,
          vram: null,
          cudaSupport: null
        },
        ram: {
          total: null,
          free: null
        },
        cpu: {
          cores: null,
          model: null
        }
      };

      expect(nullValueSpecs.gpu.name).toBeNull();
      expect(nullValueSpecs.ram.total).toBeNull();
      expect(nullValueSpecs.cpu.cores).toBeNull();
    });

    it('should handle type coercion in JavaScript', () => {
      const coercedSpecs = {
        gpu: {
          available: 1, // Truthy, coerces to true
          name: 'NVIDIA GeForce RTX 2070',
          vram: '8', // String number will still work with loose equality
          cudaSupport: 'true' // String 'true' is truthy
        },
        ram: {
          total: '32', // String number
          free: '16'  // String number
        },
        cpu: {
          cores: '6', // String number
          model: 'Intel Core i7-8700K'
        }
      };

      // These assertions use non-strict equality to demonstrate coercion
      // In JavaScript, '8' == 8 is true (loose equality)
      expect(coercedSpecs.gpu.available == true).toBe(true);
      expect(coercedSpecs.gpu.vram == 8).toBe(true);
      expect(coercedSpecs.ram.total == 32).toBe(true);
      expect(coercedSpecs.cpu.cores == 6).toBe(true);

      // But strict equality would fail
      expect(coercedSpecs.gpu.vram === 8).toBe(false);
      expect(coercedSpecs.ram.total === 32).toBe(false);
      expect(coercedSpecs.cpu.cores === 6).toBe(false);
    });
  });
});
