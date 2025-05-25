import * as vscode from 'vscode';
import { LLMStatusReporter } from '../services/llm/LLMStatusReporter';

export function setupStatusBar(context: vscode.ExtensionContext): void {
  // Register the LLMStatusReporter singleton for LLM connection status
  const llmStatusReporter = LLMStatusReporter.getInstance();
  context.subscriptions.push(llmStatusReporter);
}
