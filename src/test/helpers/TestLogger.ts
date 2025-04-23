export class TestLogger {
    public errors: string[] = [];
    public warnings: string[] = [];
    public infos: string[] = [];
    public debugs: string[] = [];

    error(message: string, ...args: any[]): void {
        this.errors.push(this.format(message, args));
    }

    warn(message: string, ...args: any[]): void {
        this.warnings.push(this.format(message, args));
    }

    info(message: string, ...args: any[]): void {
        this.infos.push(this.format(message, args));
    }

    debug(message: string, ...args: any[]): void {
        this.debugs.push(this.format(message, args));
    }

    private format(message: string, args: any[]): string {
        return `${message} ${args.join(' ')}`.trim();
    }

    reset(): void {
        this.errors = [];
        this.warnings = [];
        this.infos = [];
        this.debugs = [];
    }
}
