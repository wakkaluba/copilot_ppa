import React from 'react';

/**
 * ConnectionStatusBar React component for UI status indication.
 * @param props.status - The connection status string (e.g., 'Connected', 'Disconnected').
 */
export interface ConnectionStatusBarProps {
  status: string;
}

export const ConnectionStatusBar: React.FC<ConnectionStatusBarProps> = ({ status }) => (
  <div role="status" aria-live="polite">
    LLM: {status}
  </div>
);
