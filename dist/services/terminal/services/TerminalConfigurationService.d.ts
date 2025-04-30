import { TerminalShellType } from '../types';
export declare class TerminalConfigurationService {
    getAvailableShells(): {
        label: string;
        value: TerminalShellType;
    }[];
    selectShellType(): Promise<TerminalShellType | undefined>;
}
