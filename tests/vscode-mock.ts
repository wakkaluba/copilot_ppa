/**
 * Mock implementation of the vscode API for testing
 */

// Create common classes and types
export class Position {
    constructor(public readonly line: number, public readonly character: number) {}
    
    isAfter(other: Position): boolean {
        return this.line > other.line || 
            (this.line === other.line && this.character > other.character);
    }
    
    isAfterOrEqual(other: Position): boolean {
        return this.line > other.line || 
            (this.line === other.line && this.character >= other.character);
    }
    
    isBefore(other: Position): boolean {
        return this.line < other.line || 
            (this.line === other.line && this.character < other.character);
    }
    
    isBeforeOrEqual(other: Position): boolean {
        return this.line < other.line || 
            (this.line === other.line && this.character <= other.character);
    }
    
    isEqual(other: Position): boolean {
        return this.line === other.line && this.character === other.character;
    }
    
    translate(lineDelta?: number, characterDelta?: number): Position {
        const line = this.line + (lineDelta || 0);
        const character = this.character + (characterDelta || 0);
        return new Position(line, character);
    }
    
    with(line?: number, character?: number): Position {
        return new Position(
            typeof line === 'number' ? line : this.line,
            typeof character === 'number' ? character : this.character
        );
    }
}

export class Range {
    constructor(
        public readonly start: Position, 
        public readonly end: Position
    ) {}
    
    static fromPositions(start: Position, end: Position): Range {
        return new Range(start, end);
    }
    
    contains(positionOrRange: Position | Range): boolean {
        if (positionOrRange instanceof Position) {
            return this.start.isBeforeOrEqual(positionOrRange) && this.end.isAfterOrEqual(positionOrRange);
        }
        return this.contains(positionOrRange.start) && this.contains(positionOrRange.end);
    }
    
    isEmpty(): boolean {
        return this.start.isEqual(this.end);
    }
    
    isEqual(other: Range): boolean {
        return this.start.isEqual(other.start) && this.end.isEqual(other.end);
    }
    
    intersection(other: Range): Range | undefined {
        const start = this.start.isAfter(other.start) ? this.start : other.start;
        const end = this.end.isBefore(other.end) ? this.end : other.end;
        if (start.isAfter(end)) {
            return undefined;
        }
        return new Range(start, end);
    }
    
    with(start?: Position, end?: Position): Range {
        return new Range(
            start || this.start,
            end || this.end
        );
    }
}

// Create basic EventEmitter mock
export class EventEmitter {
    private _listeners: Function[] = [];
    
    get event() {
        return (listener: Function) => {
            this._listeners.push(listener);
            return {
                dispose: () => {
                    const idx = this._listeners.indexOf(listener);
                    if (idx >= 0) {
                        this._listeners.splice(idx, 1);
                    }
                }
            };
        };
    }
    
    fire(data?: any) {
        this._listeners.forEach(listener => listener(data));
    }

    dispose() {
        this._listeners = [];
    }
}

// Create some common enums used in the code
export enum ExtensionMode {
    Production = 1,
    Development = 2,
    Test = 3,
}

export enum LogLevel {
    Trace = 0,
    Debug = 1,
    Info = 2,
    Warning = 3,
    Error = 4,
    Critical = 5,
    Off = 6
}

export enum StatusBarAlignment {
    Left = 1,
    Right = 2,
}

export enum FileType {
    Unknown = 0,
    File = 1,
    Directory = 2,
    SymbolicLink = 64
}

export enum ConfigurationTarget {
    Global = 1,
    Workspace = 2,
    WorkspaceFolder = 3,
}

export enum EndOfLine {
    LF = 1,
    CRLF = 2
}

export const Disposable = {
    from: jest.fn((...disposables) => ({
        dispose: jest.fn(() => {
            disposables.forEach(d => d.dispose && d.dispose());
        })
    })),
};

// Create a real-like Uri class
export class Uri {
    constructor(
        public scheme: string,
        public authority: string,
        public path: string,
        public query: string,
        public fragment: string,
        public fsPath: string
    ) {}
    
    static file(path: string): Uri {
        return new Uri('file', '', path, '', '', path);
    }
    
    static parse(value: string): Uri {
        // Simple parsing logic
        const parts = value.split('://');
        const scheme = parts.length > 1 ? parts[0] : 'file';
        const path = parts.length > 1 ? parts[1] : parts[0];
        return new Uri(scheme, '', path, '', '', path);
    }
    
    // Add the joinPath function
    static joinPath(uri: Uri, ...pathSegments: string[]): Uri {
        const joinedPath = [uri.path, ...pathSegments].join('/').replace(/\/+/g, '/');
        return new Uri(uri.scheme, uri.authority, joinedPath, uri.query, uri.fragment, joinedPath);
    }
    
    with(change: { scheme?: string, authority?: string, path?: string, query?: string, fragment?: string }): Uri {
        return new Uri(
            change.scheme || this.scheme,
            change.authority || this.authority,
            change.path || this.path,
            change.query || this.query,
            change.fragment || this.fragment,
            change.path || this.fsPath
        );
    }
    
    toString(): string {
        return `${this.scheme}://${this.path}`;
    }
}

// Mocked VSCode namespace
export const window = {
    createOutputChannel: jest.fn(() => ({
        append: jest.fn(),
        appendLine: jest.fn(),
        clear: jest.fn(),
        show: jest.fn(),
        hide: jest.fn(),
        dispose: jest.fn(),
    })),
    showInformationMessage: jest.fn(),
    showWarningMessage: jest.fn(),
    showErrorMessage: jest.fn(),
    createStatusBarItem: jest.fn(() => ({
        text: '',
        command: undefined,
        show: jest.fn(),
        hide: jest.fn(),
        dispose: jest.fn(),
    })),
    onDidChangeActiveColorTheme: jest.fn(() => ({
        dispose: jest.fn()
    })),
    createWebviewPanel: jest.fn(() => ({
        webview: {
            html: '',
            onDidReceiveMessage: jest.fn(() => ({ dispose: jest.fn() })),
            postMessage: jest.fn(),
        },
        reveal: jest.fn(),
        dispose: jest.fn(),
        onDidDispose: jest.fn(() => ({ dispose: jest.fn() })),
    })),
    showTextDocument: jest.fn(),
    activeTextEditor: undefined,
    visibleTextEditors: [],
    showInputBox: jest.fn(),
    showQuickPick: jest.fn(),
};

export const workspace = {
    getConfiguration: jest.fn(() => ({
        get: jest.fn(),
        update: jest.fn(),
        has: jest.fn(),
        inspect: jest.fn(),
    })),
    workspaceFolders: [],
    onDidChangeConfiguration: jest.fn(() => ({ dispose: jest.fn() })),
    fs: {
        readFile: jest.fn(),
        writeFile: jest.fn(),
        delete: jest.fn(),
        rename: jest.fn(),
        stat: jest.fn(),
        readDirectory: jest.fn(),
        createDirectory: jest.fn(),
    },
    findFiles: jest.fn(),
    openTextDocument: jest.fn(),
    onDidOpenTextDocument: jest.fn(() => ({ dispose: jest.fn() })),
    onDidChangeTextDocument: jest.fn(() => ({ dispose: jest.fn() })),
};

export const commands = {
    registerCommand: jest.fn(() => ({ dispose: jest.fn() })),
    executeCommand: jest.fn(),
};

export const languages = {
    createDiagnosticCollection: jest.fn(() => ({
        set: jest.fn(),
        delete: jest.fn(),
        clear: jest.fn(),
        dispose: jest.fn(),
    })),
    registerCompletionItemProvider: jest.fn(() => ({ dispose: jest.fn() })),
};

export const FileSystemError = {
    FileNotFound: jest.fn((message) => new Error(`File not found: ${message}`)),
    FileExists: jest.fn((message) => new Error(`File exists: ${message}`)),
    FileNotADirectory: jest.fn((message) => new Error(`Path is not a directory: ${message}`)),
    FileIsADirectory: jest.fn((message) => new Error(`Path is a directory: ${message}`)),
    NoPermissions: jest.fn((message) => new Error(`No permissions: ${message}`)),
};

// Export the mocked API as default export
export default {
    window,
    workspace,
    commands,
    Uri,
    Position,
    Range,
    EventEmitter,
    languages,
    Disposable,
    ExtensionMode,
    LogLevel,
    StatusBarAlignment,
    FileType,
    ConfigurationTarget,
    FileSystemError,
    EndOfLine,
};
