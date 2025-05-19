import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { ConnectionStatusBar } from '../../../src/ui/components/ConnectionStatusBar';

describe('ConnectionStatusBar', () => {
  it('renders a status bar with Connected status', () => {
    render(<ConnectionStatusBar status="Connected" />);
    expect(screen.getByText('LLM: Connected')).toBeInTheDocument();
  });

  it('renders a status bar with Disconnected status', () => {
    render(<ConnectionStatusBar status="Disconnected" />);
    expect(screen.getByText('LLM: Disconnected')).toBeInTheDocument();
  });
});
