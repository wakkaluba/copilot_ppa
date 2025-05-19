import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { Message, MessageRenderer } from '../MessageRenderer';

describe('MessageRenderer (React)', () => {
  it('renders no messages text when empty', () => {
    render(<MessageRenderer messages={[]} />);
    expect(screen.getByText(/no messages/i)).toBeInTheDocument();
  });

  it('renders a user message', () => {
    const messages: Message[] = [
      { role: 'user', content: 'Hello world', timestamp: Date.now() }
    ];
    render(<MessageRenderer messages={messages} />);
    expect(screen.getByText('Hello world')).toBeInTheDocument();
    expect(screen.getByText('user')).toBeInTheDocument();
  });

  it('renders multiple roles', () => {
    const messages: Message[] = [
      { role: 'user', content: 'Hi', timestamp: Date.now() },
      { role: 'assistant', content: 'Hello!', timestamp: Date.now() },
      { role: 'system', content: 'System message', timestamp: Date.now() }
    ];
    render(<MessageRenderer messages={messages} />);
    expect(screen.getByText('Hi')).toBeInTheDocument();
    expect(screen.getByText('Hello!')).toBeInTheDocument();
    expect(screen.getByText('System message')).toBeInTheDocument();
  });
});
