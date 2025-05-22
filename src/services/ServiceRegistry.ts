import * as vscode from 'vscode';

export class ServiceRegistry {
  private static instance: ServiceRegistry;
  private services: Map<symbol, unknown> = new Map();

  private constructor() {}

  public static getInstance(): ServiceRegistry {
    if (!ServiceRegistry.instance) {
      ServiceRegistry.instance = new ServiceRegistry();
    }
    return ServiceRegistry.instance;
  }

  public get<T>(serviceType: symbol): T {
    return this.services.get(serviceType) as T;
  }

  public register<T>(serviceType: symbol, instance: T): void {
    this.services.set(serviceType, instance);
  }
}

export const Services = {
  // Add service symbols as needed
};

export function initializeServices(context?: vscode.ExtensionContext): void {
  // No-op stub for now
}
