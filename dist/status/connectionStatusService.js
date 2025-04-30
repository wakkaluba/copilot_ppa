"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectionStatusService = exports.ConnectionState = void 0;
const events_1 = require("events");
var ConnectionState;
(function (ConnectionState) {
    ConnectionState["Connected"] = "connected";
    ConnectionState["Connecting"] = "connecting";
    ConnectionState["Disconnected"] = "disconnected";
    ConnectionState["Error"] = "error";
})(ConnectionState || (exports.ConnectionState = ConnectionState = {}));
class ConnectionStatusService extends events_1.EventEmitter {
    currentState = ConnectionState.Disconnected;
    currentError;
    metadata = {};
    constructor() {
        super();
        // Start emitting periodic heartbeat events
        setInterval(() => {
            this.emit('heartbeat', {
                state: this.currentState,
                metadata: this.metadata,
                timestamp: new Date()
            });
        }, 60000); // Every minute
    }
    getState() {
        return this.currentState;
    }
    setState(state, metadata) {
        const previousState = this.currentState;
        this.currentState = state;
        if (metadata) {
            this.metadata = { ...this.metadata, ...metadata };
        }
        if (state === ConnectionState.Connected) {
            this.clearError();
        }
        this.emit('stateChanged', {
            previousState,
            currentState: state,
            metadata: this.metadata,
            timestamp: new Date()
        });
    }
    setError(error) {
        this.currentError = error;
        this.setState(ConnectionState.Error);
        this.emit('error', {
            error,
            metadata: this.metadata,
            timestamp: new Date()
        });
    }
    clearError() {
        if (this.currentError) {
            this.currentError = undefined;
            this.emit('errorCleared', {
                metadata: this.metadata,
                timestamp: new Date()
            });
        }
    }
    getError() {
        return this.currentError;
    }
    showNotification(message, type = 'info') {
        this.emit('notification', {
            message,
            type,
            metadata: this.metadata,
            timestamp: new Date()
        });
    }
    updateMetadata(metadata) {
        this.metadata = { ...this.metadata, ...metadata };
        this.emit('metadataChanged', {
            metadata: this.metadata,
            timestamp: new Date()
        });
    }
    clearMetadata() {
        this.metadata = {};
        this.emit('metadataCleared', {
            timestamp: new Date()
        });
    }
    getMetadata() {
        return { ...this.metadata };
    }
    dispose() {
        this.removeAllListeners();
    }
}
exports.ConnectionStatusService = ConnectionStatusService;
//# sourceMappingURL=connectionStatusService.js.map