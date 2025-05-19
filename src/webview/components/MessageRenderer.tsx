import React from 'react';

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number | string;
}

export interface MessageRendererProps {
  messages: Message[];
}

export const MessageRenderer: React.FC<MessageRendererProps> = ({ messages }) => {
  if (!messages || messages.length === 0) {
    return <div className="no-messages">No messages in this conversation yet.</div>;
  }
  return (
    <div>
      {messages.map((msg, idx) => (
        <div className={`message message-${msg.role}`} data-index={idx} key={idx}>
          <div className="message-header">
            <div className="message-role">{msg.role}</div>
            <div className="message-timestamp">{new Date(msg.timestamp).toLocaleString()}</div>
          </div>
          <div className="message-content">{msg.content}</div>
        </div>
      ))}
    </div>
  );
};
