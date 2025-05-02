const { expect } = require('chai');
const viteTypes = require('../../../../../src/buildTools/vite/types/index');

describe('Vite Types - JavaScript', () => {
  describe('Type Definitions', () => {
    it('should export ViteConfig type', () => {
      expect(viteTypes).to.have.property('ViteConfig');
    });

    it('should export VitePlugin type', () => {
      expect(viteTypes).to.have.property('VitePlugin');
    });

    it('should export ViteConfigOptimization type', () => {
      expect(viteTypes).to.have.property('ViteConfigOptimization');
    });

    it('should export ViteOptimizationSuggestion type', () => {
      expect(viteTypes).to.have.property('ViteOptimizationSuggestion');
    });

    it('should export ViteServer type', () => {
      expect(viteTypes).to.have.property('ViteServer');
    });
  });

  describe('Utility Functions', () => {
    it('should export createDefaultViteConfig function', () => {
      expect(viteTypes).to.have.property('createDefaultViteConfig');
      expect(viteTypes.createDefaultViteConfig).to.be.a('function');
    });

    it('should create a valid default Vite config', () => {
      const config = viteTypes.createDefaultViteConfig();
      expect(config).to.be.an('object');
      expect(config).to.have.property('root');
      expect(config).to.have.property('plugins');
      expect(config.plugins).to.be.an('array');
    });

    it('should export isViteConfig validation function', () => {
      expect(viteTypes).to.have.property('isViteConfig');
      expect(viteTypes.isViteConfig).to.be.a('function');
    });

    it('should validate a proper Vite config', () => {
      const validConfig = viteTypes.createDefaultViteConfig();
      expect(viteTypes.isViteConfig(validConfig)).to.be.true;
      expect(viteTypes.isViteConfig({})).to.be.false;
      expect(viteTypes.isViteConfig(null)).to.be.false;
    });
  });
});
