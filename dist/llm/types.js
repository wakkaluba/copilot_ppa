"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelStatus = exports.ModelEvent = void 0;
var ModelEvent;
(function (ModelEvent) {
    ModelEvent["ModelRegistered"] = "modelRegistered";
    ModelEvent["ModelRemoved"] = "modelRemoved";
    ModelEvent["ModelUpdated"] = "modelUpdated";
    ModelEvent["ActiveModelChanged"] = "activeModelChanged";
    ModelEvent["MetricsUpdated"] = "metricsUpdated";
    ModelEvent["ValidationUpdated"] = "validationUpdated";
})(ModelEvent || (exports.ModelEvent = ModelEvent = {}));
var ModelStatus;
(function (ModelStatus) {
    ModelStatus["Available"] = "available";
    ModelStatus["Loading"] = "loading";
    ModelStatus["Error"] = "error";
    ModelStatus["NotFound"] = "not-found";
})(ModelStatus || (exports.ModelStatus = ModelStatus = {}));
//# sourceMappingURL=types.js.map