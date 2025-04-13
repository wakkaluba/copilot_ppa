# VSCode Local LLM Agent

A Visual Studio Code extension that provides AI assistance through local LLM integration.

## Features

- 🤖 Local LLM Integration (Ollama & LM Studio)
- 💬 Interactive Chat Interface
- 🔧 Code Actions & Refactoring
- 📝 Context-Aware Suggestions
- 🔒 Privacy-Focused (All Processing Done Locally)

## Prerequisites

- Visual Studio Code 1.60.0 or higher
- Node.js 14.x or higher
- Either Ollama or LM Studio installed locally
- At least 8GB RAM recommended

## Installation

1. **Setup Local LLM:**
   ```bash
   # For Ollama
   curl https://ollama.ai/install.sh | sh
   # Pull a compatible model
   ollama pull codellama
   ```
   OR
   - Download and install LM Studio from their official website

2. **Install the Extension:**
   - Via VS Code:
     1. Open VS Code
     2. Press `Ctrl+P` / `Cmd+P`
     3. Type `ext install copilot-ppa`
   - Manual Installation:
     ```bash
     git clone https://github.com/yourusername/copilot_ppa.git
     cd copilot_ppa
     npm install
     npm run compile
     ```

## Configuration

1. Open VS Code settings (`Ctrl+,` / `Cmd+,`)
2. Search for "Copilot PPA"
3. Configure:
   - LLM Provider (Ollama/LM Studio)
   - API Endpoint
   - Model Selection
   - Temperature & Other Parameters

## Usage

1. Open Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`)
2. Type "Copilot PPA" to see available commands
3. Use the sidebar icon to open the agent panel
4. Start interacting with the agent through the chat interface

## Troubleshooting

- Ensure your LLM service is running
- Check the configuration settings
- Verify port availability (default: 11434 for Ollama)
- Examine VS Code output panel for detailed logs

## License

MIT License - see LICENSE file for details

## Contributing

See CONTRIBUTING.md for development setup and guidelines.
