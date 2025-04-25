"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const assert = __importStar(require("assert"));
const sinon = __importStar(require("sinon"));
const mockHelpers_1 = require("../helpers/mockHelpers");
const statePersistenceManager_1 = require("../../services/statePersistenceManager");
describe('StatePersistenceManager', () => {
    let statePersistenceManager;
    let mockContext;
    let mockHistory;
    let sandbox;
    beforeEach(() => {
        sandbox = sinon.createSandbox();
        mockContext = (0, mockHelpers_1.createMockExtensionContext)();
        mockHistory = (0, mockHelpers_1.createMockConversationHistory)();
        // Create a fresh instance for each test
        statePersistenceManager = new statePersistenceManager_1.StatePersistenceManager(mockContext, mockHistory);
    });
    afterEach(() => {
        sandbox.restore();
    });
    it('should persist state to global storage', async () => {
        const state = {
            lastConversation: 'test-123',
            settings: {
                theme: 'dark',
                fontSize: 14
            }
        };
        await statePersistenceManager.saveState('test-state', state);
        sinon.assert.calledWith(mockContext.globalState.update, 'test-state', state);
    });
    it('should restore state from global storage', async () => {
        const expectedState = {
            lastConversation: 'test-123',
            settings: {
                theme: 'dark',
                fontSize: 14
            }
        };
        mockContext.globalState.get.returns(expectedState);
        const state = await statePersistenceManager.loadState('test-state');
        assert.deepStrictEqual(state, expectedState);
    });
    it('should return default state if no state exists', async () => {
        const defaultState = { settings: {} };
        mockContext.globalState.get.returns(undefined);
        const state = await statePersistenceManager.loadState('test-state', defaultState);
        assert.deepStrictEqual(state, defaultState);
    });
    it('should clear state from global storage', async () => {
        await statePersistenceManager.clearState('test-state');
        sinon.assert.calledWith(mockContext.globalState.update, 'test-state', undefined);
    });
    it('should export persistent state to JSON', async () => {
        const state = {
            lastConversation: 'test-123',
            settings: {
                theme: 'dark',
                fontSize: 14
            }
        };
        mockContext.globalState.get.returns(state);
        const json = await statePersistenceManager.exportStateToJson('test-state');
        const parsed = JSON.parse(json);
        assert.deepStrictEqual(parsed, state);
    });
    it('should import persistent state from JSON', async () => {
        const state = {
            lastConversation: 'test-123',
            settings: {
                theme: 'dark',
                fontSize: 14
            }
        };
        const json = JSON.stringify(state);
        await statePersistenceManager.importStateFromJson('test-state', json);
        sinon.assert.calledWith(mockContext.globalState.update, 'test-state', state);
    });
    it('should handle invalid JSON during import', async () => {
        const invalidJson = '{invalid:json}';
        try {
            await statePersistenceManager.importStateFromJson('test-state', invalidJson);
            assert.fail('Expected error was not thrown');
        }
        catch (error) {
            assert.ok(error instanceof Error);
            assert.ok(error.message.includes('Invalid JSON'));
        }
    });
    it('should merge states with existing data', async () => {
        const existingState = {
            lastConversation: 'test-123',
            settings: {
                theme: 'dark',
                fontSize: 14
            }
        };
        const newState = {
            settings: {
                fontSize: 16,
                fontFamily: 'Arial'
            },
            newProperty: 'value'
        };
        mockContext.globalState.get.returns(existingState);
        await statePersistenceManager.mergeState('test-state', newState);
        const expectedMergedState = {
            lastConversation: 'test-123',
            settings: {
                theme: 'dark',
                fontSize: 16,
                fontFamily: 'Arial'
            },
            newProperty: 'value'
        };
        sinon.assert.calledWith(mockContext.globalState.update, 'test-state', expectedMergedState);
    });
});
//# sourceMappingURL=state-persistence.test.js.map