export namespace window {
    let showInformationMessage: jest.Mock<any, any, any>;
    let showWarningMessage: jest.Mock<any, any, any>;
    let showErrorMessage: jest.Mock<any, any, any>;
    let createOutputChannel: jest.Mock<any, any, any>;
    let createWebviewPanel: jest.Mock<any, any, any>;
    let createStatusBarItem: jest.Mock<any, any, any>;
}
export namespace workspace {
    let getConfiguration: jest.Mock<any, any, any>;
    let workspaceFolders: never[];
    namespace fs {
        let readFile: jest.Mock<any, any, any>;
        let writeFile: jest.Mock<any, any, any>;
        let createDirectory: jest.Mock<any, any, any>;
        let readDirectory: jest.Mock<any, any, any>;
    }
}
export namespace commands {
    let registerCommand: jest.Mock<any, any, any>;
    let executeCommand: jest.Mock<any, any, any>;
}
export namespace Uri {
    let file: jest.Mock<{
        path: any;
    }, [path?: any], any>;
    let parse: jest.Mock<any, any, any>;
}
export let Position: jest.Mock<any, any, any>;
export let Range: jest.Mock<any, any, any>;
export namespace StatusBarAlignment {
    let Left: number;
    let Right: number;
}
export namespace TreeItemCollapsibleState {
    let None: number;
    let Collapsed: number;
    let Expanded: number;
}
