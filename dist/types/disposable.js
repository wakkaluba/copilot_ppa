"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DisposableStore = void 0;
class DisposableStore {
    _toDispose = new Set();
    add(disposable) {
        this._toDispose.add(disposable);
        return disposable;
    }
    dispose() {
        this._toDispose.forEach(d => d.dispose());
        this._toDispose.clear();
    }
}
exports.DisposableStore = DisposableStore;
//# sourceMappingURL=disposable.js.map