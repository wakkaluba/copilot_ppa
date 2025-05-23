export enum ConnectionState {
  Connected = 'connected',
  Connecting = 'connecting',
  Disconnected = 'disconnected',
  Error = 'error',
}

export interface ICICDProvider {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  getStatus(): Promise<ConnectionState>;
  getPipelineInfo(): Promise<any>;
}
