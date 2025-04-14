import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Manages code review checklists and generates reports
 */
export class ReviewChecklist {
    private readonly CHECKLIST_DIR = 'codeReview/checklists';
    private readonly REPORT_DIR = 'codeReview/reports';
    
    private customChecklists: Map<string, ChecklistItem[]> = new Map();
    private reportHistory: Report[] = [];
    private context: vscode.ExtensionContext;
    
    constructor(context: vscode.ExtensionContext) {
        this.context = context;
        this.loadChecklists();
        this.loadReportHistory();
    }
    
    /**
     * Loads saved checklists from the extension's storage
     */
    private async loadChecklists(): Promise<void> {
        const checklistsPath = path.join(this.context.extensionPath, this.CHECKLIST_DIR);
        
        // Create directory if it doesn't exist
        if (!fs.existsSync(checklistsPath)) {
            fs.mkdirSync(checklistsPath, { recursive: true });
            // Create default checklists
            this.createDefaultChecklists();
            return;
        }
        
        // Load all checklist files
        const files = fs.readdirSync(checklistsPath).filter(file => file.endsWith('.json'));
        
        for (const file of files) {
            try {
                const checklistData = fs.readFileSync(path.join(checklistsPath, file), 'utf8');
                const checklist = JSON.parse(checklistData);
                this.customChecklists.set(path.basename(file, '.json'), checklist);
            } catch (error) {
                console.error(`Error loading checklist ${file}:`, error);
            }
        }
    }
    
    /**
     * Creates default checklists for common review types
     */
    private createDefaultChecklists(): void {
        const checklistsPath = path.join(this.context.extensionPath, this.CHECKLIST_DIR);
        
        // General code review checklist
        const generalChecklist: ChecklistItem[] = [
            { id: 'general-1', category: 'Code Quality', description: 'Code follows project style guide', mandatory: true },
            { id: 'general-2', category: 'Code Quality', description: 'No duplicated code or magic numbers', mandatory: true },
            { id: 'general-3', category: 'Documentation', description: 'Public functions/classes have documentation', mandatory: true },
            { id: 'general-4', category: 'Testing', description: 'New code has corresponding tests', mandatory: true },
            { id: 'general-5', category: 'Security', description: 'No security vulnerabilities introduced', mandatory: true }
        ];
        
        // Security-focused checklist
        const securityChecklist: ChecklistItem[] = [
            { id: 'security-1', category: 'Input Validation', description: 'All user inputs are validated', mandatory: true },
            { id: 'security-2', category: 'Authentication', description: 'Authentication logic is secure', mandatory: true },
            { id: 'security-3', category: 'Data Protection', description: 'Sensitive data is properly encrypted', mandatory: true },
            { id: 'security-4', category: 'Error Handling', description: 'Errors do not expose sensitive information', mandatory: true },
            { id: 'security-5', category: 'Dependency Security', description: 'No vulnerable dependencies', mandatory: true }
        ];
        
        // Performance-focused checklist
        const performanceChecklist: ChecklistItem[] = [
            { id: 'perf-1', category: 'Algorithms', description: 'Efficient algorithms used', mandatory: true },
            { id: 'perf-2', category: 'Database', description: 'Database queries are optimized', mandatory: true },
            { id: 'perf-3', category: 'Resource Usage', description: 'Resources are properly released', mandatory: true },
            { id: 'perf-4', category: 'Memory Management', description: 'No memory leaks', mandatory: true },
            { id: 'perf-5', category: 'Caching', description: 'Appropriate caching strategy in place', mandatory: false }
        ];
        
        // Save default checklists
        fs.writeFileSync(path.join(checklistsPath, 'general.json'), JSON.stringify(generalChecklist, null, 2));
        fs.writeFileSync(path.join(checklistsPath, 'security.json'), JSON.stringify(securityChecklist, null, 2));
        fs.writeFileSync(path.join(checklistsPath, 'performance.json'), JSON.stringify(performanceChecklist, null, 2));
        
        // Add to in-memory map
        this.customChecklists.set('general', generalChecklist);
        this.customChecklists.set('security', securityChecklist);
        this.customChecklists.set('performance', performanceChecklist);
    }
    
    /**
     * Loads the report history from storage
     */
    private loadReportHistory(): void {
        const reportsPath = path.join(this.context.extensionPath, this.REPORT_DIR);
        
        // Create directory if it doesn't exist
        if (!fs.existsSync(reportsPath)) {
            fs.mkdirSync(reportsPath, { recursive: true });
            return;
        }
        
        // Load all report files
        const files = fs.readdirSync(reportsPath).filter(file => file.endsWith('.json'));
        
        for (const file of files) {
            try {
                const reportData = fs.readFileSync(path.join(reportsPath, file), 'utf8');
                const report = JSON.parse(reportData);
                this.reportHistory.push(report);
            } catch (error) {
                console.error(`Error loading report ${file}:`, error);
            }
        }
        
        // Sort reports by date
        this.reportHistory.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
    
    /**
     * Gets available checklist templates
     */
    public getAvailableChecklists(): string[] {
        return Array.from(this.customChecklists.keys());
    }
    
    /**
     * Gets a specific checklist by name
     */
    public getChecklist(name: string): ChecklistItem[] | undefined {
        return this.customChecklists.get(name);
    }
    
    /**
     * Creates a new checklist template
     */
    public createChecklist(name: string, items: ChecklistItem[]): void {
        this.customChecklists.set(name, items);
        
        // Save to disk
        const checklistsPath = path.join(this.context.extensionPath, this.CHECKLIST_DIR);
        if (!fs.existsSync(checklistsPath)) {
            fs.mkdirSync(checklistsPath, { recursive: true });
        }
        
        fs.writeFileSync(path.join(checklistsPath, `${name}.json`), JSON.stringify(items, null, 2));
    }
    
    /**
     * Generates a new review report based on a checklist
     */
    public generateReport(checklistName: string, filePaths: string[], reviewerId: string): Report {
        const checklist = this.getChecklist(checklistName);
        if (!checklist) {
            throw new Error(`Checklist '${checklistName}' not found`);
        }
        
        // Create report structure
        const report: Report = {
            id: `report-${Date.now()}`,
            checklistName,
            reviewerId,
            date: new Date().toISOString(),
            files: filePaths,
            items: checklist.map(item => ({
                itemId: item.id,
                category: item.category,
                description: item.description,
                mandatory: item.mandatory,
                passed: false,
                comments: ''
            })),
            summary: '',
            approved: false
        };
        
        // Save report
        this.saveReport(report);
        
        return report;
    }
    
    /**
     * Updates an existing report with review results
     */
    public updateReport(reportId: string, results: ReviewResult[], summary: string, approved: boolean): void {
        const report = this.reportHistory.find(r => r.id === reportId);
        if (!report) {
            throw new Error(`Report with ID '${reportId}' not found`);
        }
        
        // Update the report items with results
        for (const result of results) {
            const item = report.items.find(i => i.itemId === result.itemId);
            if (item) {
                item.passed = result.passed;
                item.comments = result.comments;
            }
        }
        
        // Update summary and approval
        report.summary = summary;
        report.approved = approved;
        
        // Save updated report
        this.saveReport(report);
    }
    
    /**
     * Saves a report to disk
     */
    private saveReport(report: Report): void {
        const reportsPath = path.join(this.context.extensionPath, this.REPORT_DIR);
        if (!fs.existsSync(reportsPath)) {
            fs.mkdirSync(reportsPath, { recursive: true });
        }
        
        fs.writeFileSync(path.join(reportsPath, `${report.id}.json`), JSON.stringify(report, null, 2));
        
        // Update in-memory history if needed
        const existingIndex = this.reportHistory.findIndex(r => r.id === report.id);
        if (existingIndex >= 0) {
            this.reportHistory[existingIndex] = report;
        } else {
            this.reportHistory.push(report);
        }
    }
    
    /**
     * Gets the recent report history
     */
    public getReportHistory(limit: number = 10): Report[] {
        return this.reportHistory.slice(0, limit);
    }
    
    /**
     * Exports a report to HTML format
     */
    public exportReportToHtml(reportId: string): string {
        const report = this.reportHistory.find(r => r.id === reportId);
        if (!report) {
            throw new Error(`Report with ID '${reportId}' not found`);
        }
        
        // Generate HTML report
        let html = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Code Review Report - ${report.id}</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { background-color: #f0f0f0; padding: 10px; border-radius: 5px; }
                .files { margin: 10px 0; }
                .item { margin: 10px 0; padding: 10px; border: 1px solid #ddd; border-radius: 5px; }
                .pass { background-color: #e6ffe6; }
                .fail { background-color: #ffe6e6; }
                .summary { margin-top: 20px; border-top: 1px solid #ddd; padding-top: 10px; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Code Review Report</h1>
                <p><strong>ID:</strong> ${report.id}</p>
                <p><strong>Date:</strong> ${new Date(report.date).toLocaleString()}</p>
                <p><strong>Reviewer:</strong> ${report.reviewerId}</p>
                <p><strong>Checklist:</strong> ${report.checklistName}</p>
                <p><strong>Status:</strong> ${report.approved ? 'Approved' : 'Not Approved'}</p>
            </div>
            
            <div class="files">
                <h2>Files Reviewed</h2>
                <ul>
                    ${report.files.map(file => `<li>${file}</li>`).join('')}
                </ul>
            </div>
            
            <h2>Checklist Items</h2>
            ${report.items.map(item => `
                <div class="item ${item.passed ? 'pass' : 'fail'}">
                    <h3>${item.category}: ${item.description} ${item.mandatory ? '(Mandatory)' : '(Optional)'}</h3>
                    <p><strong>Status:</strong> ${item.passed ? 'Passed' : 'Failed'}</p>
                    ${item.comments ? `<p><strong>Comments:</strong> ${item.comments}</p>` : ''}
                </div>
            `).join('')}
            
            <div class="summary">
                <h2>Summary</h2>
                <p>${report.summary}</p>
            </div>
        </body>
        </html>
        `;
        
        return html;
    }
}

/**
 * Interface for a checklist item template
 */
interface ChecklistItem {
    id: string;
    category: string;
    description: string;
    mandatory: boolean;
}

/**
 * Interface for a review result on a checklist item
 */
interface ReviewResult {
    itemId: string;
    passed: boolean;
    comments: string;
}

/**
 * Interface for a complete review report
 */
interface Report {
    id: string;
    checklistName: string;
    reviewerId: string;
    date: string;
    files: string[];
    items: {
        itemId: string;
        category: string;
        description: string;
        mandatory: boolean;
        passed: boolean;
        comments: string;
    }[];
    summary: string;
    approved: boolean;
}
