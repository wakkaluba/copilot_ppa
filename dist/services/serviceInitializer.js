"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceInitializer = void 0;
class ServiceInitializer {
    static async initializeService(service, serviceId, dependencies = {}) {
        try {
            // Validate dependencies
            for (const [key, value] of Object.entries(dependencies)) {
                if (!value) {
                    throw new Error(`Missing required dependency: ${key}`);
                }
            }
            // Initialize with timeout protection
            const timeoutMs = 10000; // 10 second timeout
            await Promise.race([
                service.initialize(),
                new Promise((_, reject) => setTimeout(() => reject(new Error(`Service initialization timed out: ${serviceId}`)), timeoutMs))
            ]);
            return { success: true, serviceId };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error : new Error(String(error)),
                serviceId
            };
        }
    }
    static async initializeServices(services) {
        const results = [];
        for (const { service, id, dependencies } of services) {
            const result = await this.initializeService(service, id, dependencies);
            results.push(result);
            // If a service fails to initialize, we should stop
            if (!result.success) {
                break;
            }
        }
        return results;
    }
}
exports.ServiceInitializer = ServiceInitializer;
//# sourceMappingURL=serviceInitializer.js.map