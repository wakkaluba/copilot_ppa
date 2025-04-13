(function() {
  // Get VS Code API
  const vscode = acquireVsCodeApi();
  
  // DOM Elements
  const chatMessages = document.getElementById('chat-messages');
  const promptInput = document.getElementById('prompt-input');
  const sendButton = document.getElementById('send-button');
  const clearButton = document.getElementById('clear-button');
  
  // Initialize the chat with any stored state
  const previousState = vscode.getState();
  if (previousState && previousState.messages) {
    restoreMessages(previousState.messages);
  }
  
  // Event Listeners
  sendButton.addEventListener('click', () => {
    sendMessage();
  });
  
  promptInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });
  
  clearButton.addEventListener('click', () => {
    clearChat();
  });
  
  // Listen for messages from the extension
  window.addEventListener('message', event => {
    const message = event.data;
    
    switch (message.type) {
      case 'response':
        addMessage('agent', message.text);
        break;
      case 'clearChat':
        chatMessages.innerHTML = '';
        addMessage('system', 'Chat history has been cleared.');
        saveMessages();
        break;
      case 'connectionStatus':
        updateConnectionStatus(message.status);
        break;
    }
  });
  
  // Functions
  function sendMessage() {
    const text = promptInput.value.trim();
    if (text === '') return;
    
    // Add the message to the UI
    addMessage('user', text);
    
    // Send the message to the extension
    vscode.postMessage({
      command: 'sendPrompt',
      text: text
    });
    
    // Clear the input
    promptInput.value = '';
  }
  
  function addMessage(type, text) {
    const messageElement = document.createElement('div');
    messageElement.className = `message ${type}`;
    
    const contentElement = document.createElement('div');
    contentElement.className = 'message-content';
    
    // Process text for markdown-like formatting
    const formattedText = text
      .replace(/\n/g, '<br>')
      .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
      .replace(/`([^`]+)`/g, '<code>$1</code>');
    
    contentElement.innerHTML = formattedText;
    messageElement.appendChild(contentElement);
    
    chatMessages.appendChild(messageElement);
    
    // Auto-scroll to the bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Save messages to state
    saveMessages();
  }
  
  function clearChat() {
    vscode.postMessage({
      command: 'clearChat'
    });
  }
  
  function saveMessages() {
    const messageElements = chatMessages.querySelectorAll('.message');
    const messages = Array.from(messageElements).map(el => {
      return {
        type: el.classList.contains('user') ? 'user' : 
              el.classList.contains('agent') ? 'agent' : 'system',
        text: el.querySelector('.message-content').innerHTML
      };
    });
    
    vscode.setState({ messages });
  }
  
  function restoreMessages(messages) {
    chatMessages.innerHTML = '';
    messages.forEach(msg => {
      const messageElement = document.createElement('div');
      messageElement.className = `message ${msg.type}`;
      
      const contentElement = document.createElement('div');
      contentElement.className = 'message-content';
      contentElement.innerHTML = msg.text;
      
      messageElement.appendChild(contentElement);
      chatMessages.appendChild(messageElement);
    });
  }
  
  function updateConnectionStatus(status) {
    const statusIndicator = document.querySelector('.status-indicator');
    const statusText = document.querySelector('.status-text');
    
    statusIndicator.className = 'status-indicator';
    
    switch (status) {
      case 'connected':
        statusIndicator.classList.add('connected');
        statusText.textContent = 'Connected';
        break;
      case 'disconnected':
        statusIndicator.classList.add('disconnected');
        statusText.textContent = 'Disconnected';
        break;
      case 'connecting':
        statusIndicator.classList.add('connecting');
        statusText.textContent = 'Connecting...';
        break;
    }
  }
})();
