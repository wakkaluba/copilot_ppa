const { expect } = require('chai');

describe('Models index tests (JavaScript)', () => {
    it('should export interfaces from various modules', () => {
        // Import the module
        const modelIndex = require('../../src/models/index');

        // Check that the module exports something
        expect(modelIndex).to.be.an('object').that.is.not.empty;

        // Since interfaces don't exist at runtime in JavaScript,
        // we can only check that the module is structured as we expect
        const exportedNames = Object.keys(modelIndex);

        // The module should export something
        expect(exportedNames.length).to.be.at.least(1,
            'Should export at least some properties');
    });
});
