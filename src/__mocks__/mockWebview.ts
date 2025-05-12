
export const mockWebview = () => ({
    html: '',
    options: {},
    onDidReceiveMessage: jest.fn().mockReturnValue({ dispose: jest.fn() }),
    postMessage: jest.fn().mockResolvedValue(true),
});

export const mockWebviewView = () => ({
    webview: mockWebview(),
    viewType: 'test-view',
    show: jest.fn(),
    visible: true,
    onDidDispose: jest.fn(),
    onDidChangeVisibility: jest.fn(),
});
