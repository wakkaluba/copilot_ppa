"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProviderState = void 0;
var ProviderState;
(function (ProviderState) {
    ProviderState["Unknown"] = "unknown";
    ProviderState["Registered"] = "registered";
    ProviderState["Initializing"] = "initializing";
    ProviderState["Active"] = "active";
    ProviderState["Deactivating"] = "deactivating";
    ProviderState["Inactive"] = "inactive";
    ProviderState["Error"] = "error";
})(ProviderState || (exports.ProviderState = ProviderState = {}));
