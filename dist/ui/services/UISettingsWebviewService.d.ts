export interface IUISettingsTab {
    id: string;
    label: string;
    content: string;
}
export declare class UISettingsWebviewService {
    private readonly logger;
    constructor();
    generateWebviewContent(tabs: IUISettingsTab[]): string;
}
