import { SecurityPattern } from '../types';

export class SecurityPatternService {
    private readonly jsPatterns: SecurityPattern[] = [
        {
            id: 'SEC001',
            regex: /eval\s*\(/g,
            severity: 'high',
            description: 'Use of eval() can lead to code injection vulnerabilities',
            recommendation: 'Avoid using eval(). Consider using safer alternatives.'
        },
        {
            id: 'SEC002',
            regex: /(?:password|secret|key|token|auth).*=.*['"`][^'"`]+['"`]/gi,
            severity: 'critical',
            description: 'Potential hardcoded secret detected',
            recommendation: 'Use environment variables or a secure key management system'
        },
        {
            id: 'SEC003',
            regex: /innerHTML\s*=/g,
            severity: 'medium',
            description: 'Use of innerHTML can lead to XSS vulnerabilities',
            recommendation: 'Use textContent or innerText instead, or sanitize HTML input'
        }
    ];

    private readonly pythonPatterns: SecurityPattern[] = [
        {
            id: 'SEC004',
            regex: /subprocess\..*\(.*shell\s*=\s*True/g,
            severity: 'high',
            description: 'Use of shell=True in subprocess can lead to command injection',
            recommendation: 'Avoid shell=True and use command arrays instead'
        },
        {
            id: 'SEC005',
            regex: /pickle\.loads?\(/g,
            severity: 'high',
            description: 'Unsafe deserialization using pickle',
            recommendation: 'Use safe serialization formats like JSON'
        }
    ];

    private readonly javaPatterns: SecurityPattern[] = [
        {
            id: 'SEC006',
            regex: /Statement.*\.execute.*\+/g,
            severity: 'critical',
            description: 'Potential SQL injection vulnerability',
            recommendation: 'Use PreparedStatement with parameterized queries'
        },
        {
            id: 'SEC007',
            regex: /\.enableSystemExitCompilerFlag\(/g,
            severity: 'high',
            description: 'Unsafe Java reflection capability enabled',
            recommendation: 'Avoid enabling dangerous compiler flags'
        }
    ];

    public getJavaScriptPatterns(): SecurityPattern[] {
        return this.jsPatterns;
    }

    public getPythonPatterns(): SecurityPattern[] {
        return this.pythonPatterns;
    }

    public getJavaPatterns(): SecurityPattern[] {
        return this.javaPatterns;
    }

    public getAllPatterns(): SecurityPattern[] {
        return [
            ...this.jsPatterns,
            ...this.pythonPatterns,
            ...this.javaPatterns
        ];
    }
}
