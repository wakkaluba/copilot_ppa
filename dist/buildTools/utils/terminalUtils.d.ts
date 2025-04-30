export interface RunInTerminalOptions {
    command: string;
    explanation: string;
    isBackground: boolean;
}
export declare function run_in_terminal(options: RunInTerminalOptions): Promise<void>;
