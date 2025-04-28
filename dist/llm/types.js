"use strict";
// Basic LLM types for the VS Code extension
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelEvents = exports.LLMRequestStatus = exports.LLMRequestPriority = void 0;
var LLMRequestPriority;
(function (LLMRequestPriority) {
    LLMRequestPriority["Low"] = "low";
    LLMRequestPriority["Normal"] = "normal";
    LLMRequestPriority["High"] = "high";
})(LLMRequestPriority || (exports.LLMRequestPriority = LLMRequestPriority = {}));
var LLMRequestStatus;
(function (LLMRequestStatus) {
    LLMRequestStatus["Pending"] = "pending";
    LLMRequestStatus["InProgress"] = "in-progress";
    LLMRequestStatus["Completed"] = "completed";
    LLMRequestStatus["Failed"] = "failed";
    LLMRequestStatus["Cancelled"] = "cancelled";
})(LLMRequestStatus || (exports.LLMRequestStatus = LLMRequestStatus = {}));
// Model-related types
var ModelEvents;
(function (ModelEvents) {
    // Evaluation events
    ModelEvents["EvaluationStarted"] = "evaluation:started";
    ModelEvents["EvaluationCompleted"] = "evaluation:completed";
    // Optimization events
    ModelEvents["OptimizationStarted"] = "optimization:started";
    ModelEvents["OptimizationCompleted"] = "optimization:completed";
    ModelEvents["OptimizationProgress"] = "optimization:progress";
    // Scheduling events
    ModelEvents["SchedulingStarted"] = "scheduling:started";
    ModelEvents["SchedulingCompleted"] = "scheduling:completed";
    // Execution events
    ModelEvents["ExecutionStarted"] = "execution:started";
    ModelEvents["ExecutionCompleted"] = "execution:completed";
    // Task events
    ModelEvents["TaskStarted"] = "task:started";
    ModelEvents["TaskCompleted"] = "task:completed";
    ModelEvents["TaskFailed"] = "task:failed";
    // Tuning events
    ModelEvents["TuningStarted"] = "tuning:started";
    ModelEvents["TuningCompleted"] = "tuning:completed";
    ModelEvents["TuningProgress"] = "tuning:progress";
    // Metrics events
    ModelEvents["MetricsUpdated"] = "metrics:updated";
    ModelEvents["MetricsExpired"] = "metrics:expired";
    ModelEvents["MetricsAggregated"] = "metrics:aggregated";
})(ModelEvents || (exports.ModelEvents = ModelEvents = {}));
//# sourceMappingURL=types.js.map