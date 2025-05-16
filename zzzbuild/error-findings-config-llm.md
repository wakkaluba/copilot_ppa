# Locations in config validation and LLM services where generic Error is thrown

---

## Rollup Config Validation/Services
- `src/buildTools/rollup/rollupConfigManager.ts`
  - Lines 63, 89, 108, 124: Throws generic `Error` for detection, analysis, validation, and optimization failures.
- `src/buildTools/rollup/services/RollupConfigAnalyzer.ts`
  - Line 49: Throws generic `Error` on analysis failure.
- `src/buildTools/rollup/services/RollupConfigDetector.ts`
  - Lines 59, 107: Throws generic `Error` for detection and validation failures.
- `src/buildTools/rollup/services/RollupConfigUIService.ts`
  - Lines 23, 90: Throws generic `Error` if no workspace folders are open.
- `src/buildTools/rollup/services/RollupOptimizationService.ts`
  - Line 193: Throws generic `Error` for optimization suggestion failures.

---

## LLM Services
- `src/services/llm/LLMConnectionManager.ts`
  - Lines 41, 48, 76, 96, 150, 162: Throws generic `Error` for provider/config/connection issues.
- `src/services/llm/LLMHostManager.ts`
  - Lines 51, 124, 162, 204, 235: Throws generic `Error` for host-related errors.
- `src/services/llm/ConnectionPoolManager.js/ts`
  - Throws generic `Error` for unimplemented connection creation.
- `src/services/llm/services/LLMChatManager.ts`
  - Line 122: Throws generic `Error` on chat error.
- `src/services/llm/services/LLMConnectionHandlerService.ts`
  - Line 79: Throws generic `Error` on connection error.
- `src/services/llm/services/LLMErrorHandlerService.ts`
  - Line 56: Throws generic `Error` on error handling failure.
- `src/services/llm/services/LLMStreamProvider.ts`
  - Line 82: Throws generic `Error` on stream error.
- `src/services/llm/providers/OllamaProvider.ts`
  - Line 137: Throws generic `Error` on provider error.

---

## Other Notable Mentions
- Test files and some UI/service files also throw generic errors, but the above are the main config validation and LLM service locations.

---

**Next step:** Refactor these locations to use custom error types (e.g., `ConfigValidationError`, `LLMProviderError`, `LLMConnectionError`, etc.) and propagate context as per your coding standards.
