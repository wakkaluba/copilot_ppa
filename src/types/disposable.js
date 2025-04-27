"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DisposableStore = void 0;
var DisposableStore = /** @class */ (function () {
    function DisposableStore() {
        this._toDispose = new Set();
    }
    DisposableStore.prototype.add = function (disposable) {
        this._toDispose.add(disposable);
        return disposable;
    };
    DisposableStore.prototype.dispose = function () {
        this._toDispose.forEach(function (d) { return d.dispose(); });
        this._toDispose.clear();
    };
    return DisposableStore;
}());
exports.DisposableStore = DisposableStore;
