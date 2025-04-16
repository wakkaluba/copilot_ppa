"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityRecommendations = void 0;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
/**
 * Class responsible for providing proactive security recommendations
 */
class SecurityRecommendations {
    constructor(context, codeScanner) {
        this.context = context;
        this.codeScanner = codeScanner;
        this.recommendationsCache = new Map();
    }
    /**
     * Generate security recommendations for the current workspace
     */
    async generateRecommendations() {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            return { recommendations: [], analysisSummary: { total: 0, critical: 0, high: 0, medium: 0, low: 0 } };
        }
        // Scan code for security issues
        const scanResult = await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "Generating security recommendations",
            cancellable: true
        }, async (progress, token) => {
            progress.report({ message: "Scanning code for security issues..." });
            return await this.codeScanner.scanWorkspace(message => {
                progress.report({ message });
            });
        });
        // Generate recommendations based on scan results
        const recommendations = await this.analyzeIssuesForRecommendations(scanResult.issues);
        // Add project-specific recommendations
        const projectRecommendations = await this.generateProjectSpecificRecommendations();
        recommendations.push(...projectRecommendations);
        // Add framework-specific recommendations
        const frameworkRecommendations = await this.generateFrameworkSpecificRecommendations();
        recommendations.push(...frameworkRecommendations);
        // Add security best practices recommendations
        const bestPracticesRecommendations = this.generateBestPracticesRecommendations();
        recommendations.push(...bestPracticesRecommendations);
        // Calculate severity counts
        const analysisSummary = this.calculateSeverityCounts(recommendations);
        return { recommendations, analysisSummary };
    }
    /**
     * Analyze issues to generate targeted recommendations
     */
    async analyzeIssuesForRecommendations(issues) {
        const recommendations = [];
        const issueTypeCount = new Map();
        // Count issues by type
        for (const issue of issues) {
            const count = issueTypeCount.get(issue.id) || 0;
            issueTypeCount.set(issue.id, count + 1);
        }
        // Generate recommendations for common issues
        for (const [issueId, count] of issueTypeCount.entries()) {
            const matchingIssues = issues.filter(issue => issue.id === issueId);
            if (matchingIssues.length === 0)
                continue;
            const sample = matchingIssues[0];
            const severity = this.mapIssueSeverityToRecommendationSeverity(sample.severity);
            const recommendation = {
                id: `REC-${issueId}`,
                title: `Fix ${sample.name} issues (${count} occurrences)`,
                description: `${sample.description} found in ${count} locations.`,
                severity,
                category: 'code-security',
                actions: [
                    {
                        label: 'Show all occurrences',
                        command: 'vscode-local-llm-agent.securityIssues.showAll',
                        arguments: [issueId]
                    }
                ],
                affectedFiles: matchingIssues.map(issue => issue.file),
                implementationGuide: this.generateImplementationGuide(sample)
            };
            recommendations.push(recommendation);
        }
        return recommendations;
    }
    /**
     * Generate project-specific security recommendations
     */
    async generateProjectSpecificRecommendations() {
        const recommendations = [];
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders)
            return recommendations;
        for (const folder of workspaceFolders) {
            // Check for package.json to add Node.js specific recommendations
            const packageJsonPath = path.join(folder.uri.fsPath, 'package.json');
            if (fs.existsSync(packageJsonPath)) {
                try {
                    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
                    // Check if dependencies exist
                    if (packageJson.dependencies || packageJson.devDependencies) {
                        // Check for security packages
                        const allDeps = { ...(packageJson.dependencies || {}), ...(packageJson.devDependencies || {}) };
                        // Helmet recommendation for Express apps
                        if (allDeps.express && !allDeps.helmet) {
                            recommendations.push({
                                id: 'REC-NODE-001',
                                title: 'Add Helmet.js for Express security headers',
                                description: 'Express applications should use Helmet to set security-related HTTP headers.',
                                severity: 'medium',
                                category: 'dependency-security',
                                actions: [
                                    {
                                        label: 'Install Helmet',
                                        command: 'vscode-local-llm-agent.securityRecommendations.installPackage',
                                        arguments: ['helmet']
                                    }
                                ],
                                affectedFiles: [packageJsonPath],
                                implementationGuide: `# Adding Helmet.js to your Express application

Helmet helps secure Express apps by setting HTTP headers appropriately. Here's how to implement it:

1. Install Helmet:
\`\`\`bash
npm install helmet --save
\`\`\`

2. Use it in your Express app:
\`\`\`javascript
const express = require('express');
const helmet = require('helmet');

const app = express();

// Use Helmet!
app.use(helmet());

// Your routes...
\`\`\`

Helmet sets various HTTP headers to prevent common attacks like XSS, clickjacking, and more.`
                            });
                        }
                        // CSRF protection for web apps
                        if (allDeps.express && !allDeps.csurf) {
                            recommendations.push({
                                id: 'REC-NODE-002',
                                title: 'Add CSRF protection',
                                description: 'Web applications with forms should implement CSRF protection.',
                                severity: 'high',
                                category: 'dependency-security',
                                actions: [
                                    {
                                        label: 'Install csurf',
                                        command: 'vscode-local-llm-agent.securityRecommendations.installPackage',
                                        arguments: ['csurf']
                                    }
                                ],
                                affectedFiles: [packageJsonPath],
                                implementationGuide: `# Adding CSRF Protection to your Express application

Cross-Site Request Forgery (CSRF) is a type of attack that tricks users into submitting unwanted requests. Here's how to add protection:

1. Install csurf:
\`\`\`bash
npm install csurf --save
\`\`\`

2. Implement it in your Express app:
\`\`\`javascript
const express = require('express');
const csrf = require('csurf');
const cookieParser = require('cookie-parser');

const app = express();

// We need cookie-parser before csurf
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// Setup CSRF protection
const csrfProtection = csrf({ cookie: true });

// Apply to routes that need protection
app.get('/form', csrfProtection, function(req, res) {
  // Generate a CSRF token and pass to view
  res.render('form', { csrfToken: req.csrfToken() });
});

app.post('/process', csrfProtection, function(req, res) {
  // Process the form (CSRF is automatically validated)
  res.send('Data processed');
});
\`\`\`

3. In your form template, include the CSRF token:
\`\`\`html
<form action="/process" method="POST">
  <input type="hidden" name="_csrf" value="{{csrfToken}}">
  <!-- other form fields -->
  <button type="submit">Submit</button>
</form>
\`\`\``
                            });
                        }
                        // Rate limiting for APIs
                        if (allDeps.express && !allDeps['express-rate-limit']) {
                            recommendations.push({
                                id: 'REC-NODE-003',
                                title: 'Implement rate limiting for APIs',
                                description: 'APIs should implement rate limiting to prevent abuse and DoS attacks.',
                                severity: 'medium',
                                category: 'dependency-security',
                                actions: [
                                    {
                                        label: 'Install express-rate-limit',
                                        command: 'vscode-local-llm-agent.securityRecommendations.installPackage',
                                        arguments: ['express-rate-limit']
                                    }
                                ],
                                affectedFiles: [packageJsonPath],
                                implementationGuide: `# Adding Rate Limiting to your Express application

Rate limiting prevents abuse of your API by limiting the number of requests a client can make in a given time period.

1. Install express-rate-limit:
\`\`\`bash
npm install express-rate-limit --save
\`\`\`

2. Implement it in your Express app:
\`\`\`javascript
const express = require('express');
const rateLimit = require('express-rate-limit');

const app = express();

// Apply rate limiting to all requests
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes'
});

// Apply the rate limiting middleware to all requests
app.use(limiter);

// You can also create different limiters for specific routes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: 'Too many API requests from this IP, please try again after 15 minutes'
});

// Apply to API routes
app.use('/api/', apiLimiter);

// Your routes...
\`\`\``
                            });
                        }
                        // Dependency security scanning
                        if (!allDeps.snyk && !allDeps['npm-audit'] && !allDeps['@snyk/protect']) {
                            recommendations.push({
                                id: 'REC-NODE-004',
                                title: 'Add dependency security scanning',
                                description: 'Regularly scan dependencies for known vulnerabilities.',
                                severity: 'high',
                                category: 'dependency-security',
                                actions: [
                                    {
                                        label: 'Install Snyk',
                                        command: 'vscode-local-llm-agent.securityRecommendations.installPackage',
                                        arguments: ['snyk', '--save-dev']
                                    }
                                ],
                                affectedFiles: [packageJsonPath],
                                implementationGuide: `# Adding Dependency Security Scanning

Regularly scanning your dependencies for known vulnerabilities is essential for maintaining a secure application.

1. Install Snyk CLI:
\`\`\`bash
npm install snyk --save-dev
\`\`\`

2. Add security scanning scripts to your package.json:
\`\`\`json
"scripts": {
  "security:check": "snyk test",
  "security:monitor": "snyk monitor",
  "security:wizard": "snyk wizard"
}
\`\`\`

3. Run security checks:
\`\`\`bash
npm run security:check
\`\`\`

4. Integrate with CI/CD:
\`\`\`yaml
# GitHub Actions example
jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run Snyk to check for vulnerabilities
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets, : .SNYK_TOKEN }}
        with:
          command: test
\`\`\`

You can also use npm's built-in audit:
\`\`\`bash
npm audit
npm audit fix
\`\`\``
                            });
                        }
                    }
                }
                catch (error) {
                    console.error('Error reading package.json:', error);
                }
            }
            // Check for web application
            const indexHtmlPath = path.join(folder.uri.fsPath, 'public', 'index.html');
            if (fs.existsSync(indexHtmlPath)) {
                // CSP recommendation for web apps
                try {
                    const indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');
                    if (!indexHtml.includes('Content-Security-Policy') && !indexHtml.includes('<meta http-equiv="Content-Security-Policy"')) {
                        recommendations.push({
                            id: 'REC-WEB-001',
                            title: 'Implement Content Security Policy (CSP)',
                            description: 'Web applications should implement a Content Security Policy to prevent XSS attacks.',
                            severity: 'high',
                            category: 'web-security',
                            actions: [],
                            affectedFiles: [indexHtmlPath],
                            implementationGuide: `# Implementing Content Security Policy (CSP)

Content Security Policy helps prevent cross-site scripting (XSS) attacks by controlling which resources can be loaded by the browser.

## Adding CSP via HTTP headers

If you have server-side control, add this header:

\`\`\`
Content-Security-Policy: default-src 'self'; script-src 'self' https://trusted.cdn.com; style-src 'self' https://trusted.cdn.com; img-src 'self' data: https://trusted.cdn.com
\`\`\`

## Adding CSP via meta tag

For static HTML sites, add this in your <head> section:

\`\`\`html
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' https://trusted.cdn.com; style-src 'self' https://trusted.cdn.com; img-src 'self' data: https://trusted.cdn.com">
\`\`\`

## Customizing CSP

Adjust the policy based on your application's needs:

- \`default-src 'self'\`: Only allow resources from the same origin
- \`script-src\`: Controls which scripts can execute
- \`style-src\`: Controls which styles can be applied
- \`img-src\`: Controls which images can be loaded
- \`connect-src\`: Controls which URLs can be loaded using fetch, XHR, etc.

Start with a strict policy and loosen only as needed.`
                        });
                    }
                }
                catch (error) {
                    console.error('Error reading index.html:', error);
                }
            }
        }
        // Add general security recommendations
        recommendations.push({
            id: 'REC-GEN-001',
            title: 'Implement a security review process',
            description: 'Regular security reviews help identify and address vulnerabilities early.',
            severity: 'medium',
            category: 'process-security',
            actions: [],
            affectedFiles: [],
            implementationGuide: `# Implementing a Security Review Process

A systematic security review process can help identify vulnerabilities before they make it to production.

## Recommended Steps

1. **Automated Security Scanning**
   - Integrate security scanning tools into your CI/CD pipeline
   - Run dependency vulnerability checks on every build
   - Perform static code analysis for security issues

2. **Manual Code Reviews**
   - Include security considerations in your code review checklist
   - Have dedicated security-focused code reviews for critical components
   - Train developers to spot common security issues

3. **Regular Security Audits**
   - Conduct comprehensive security audits quarterly
   - Include both automated tools and manual testing
   - Document findings and track remediation

4. **Penetration Testing**
   - Perform penetration testing before major releases
   - Consider hiring external security experts for unbiased assessment
   - Simulate real-world attack scenarios

5. **Security Response Plan**
   - Document a clear process for handling security vulnerabilities
   - Define roles and responsibilities
   - Establish communication channels for security incidents

By implementing these practices, you can significantly improve your application's security posture.`
        });
        return recommendations;
    }
    /**
     * Generate framework-specific security recommendations
     */
    async generateFrameworkSpecificRecommendations() {
        const recommendations = [];
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders)
            return recommendations;
        // Check for common frameworks and generate appropriate recommendations
        for (const folder of workspaceFolders) {
            // React security recommendations
            const reactConfigPaths = [
                path.join(folder.uri.fsPath, 'package.json'),
                path.join(folder.uri.fsPath, 'react.config.js')
            ];
            if (this.isUsingFramework(reactConfigPaths, 'react')) {
                recommendations.push({
                    id: 'REC-REACT-001',
                    title: 'Use React security best practices',
                    description: 'Ensure your React application follows security best practices to prevent common vulnerabilities.',
                    severity: 'medium',
                    category: 'framework-security',
                    actions: [],
                    affectedFiles: [],
                    implementationGuide: `# React Security Best Practices

React applications need specific security considerations. Here are some best practices:

## 1. Prevent XSS

React escapes values by default, but be careful with these APIs:

- \`dangerouslySetInnerHTML\` - Use only when absolutely necessary and with sanitized data
- \`eval()\` - Avoid using eval with user input
- \`href="javascript:"\` - Avoid javascript: URLs

## 2. Sanitize User Input

Always sanitize user input before rendering, especially when:
- Setting HTML content
- Using user input in APIs
- Constructing URLs from user input

\`\`\`javascript
// Use a library like DOMPurify
import DOMPurify from 'dompurify';

function Comment({ userProvidedContent }) {
  const sanitizedContent = DOMPurify.sanitize(userProvidedContent);
  return <div dangerouslySetInnerHTML={{ __html: sanitizedContent }} />;
}
\`\`\`

## 3. Implement Proper Authentication & Authorization

- Use well-tested authentication libraries
- Implement proper logout functionality
- Set secure, HttpOnly cookies
- Use JWT safely with proper expiration

## 4. Protect Against CSRF

When making API calls, either:
- Use anti-CSRF tokens
- Use SameSite cookies
- Use modern authentication like OAuth 2.0 + PKCE

## 5. Secure State Management

- Don't store sensitive data in local storage
- Clean sensitive data from Redux store when not needed
- Use secure cookies for authentication data`
                });
            }
            // Angular security recommendations
            const angularConfigPaths = [
                path.join(folder.uri.fsPath, 'package.json'),
                path.join(folder.uri.fsPath, 'angular.json')
            ];
            if (this.isUsingFramework(angularConfigPaths, 'angular')) {
                recommendations.push({
                    id: 'REC-ANGULAR-001',
                    title: 'Use Angular security best practices',
                    description: 'Ensure your Angular application follows security best practices to prevent common vulnerabilities.',
                    severity: 'medium',
                    category: 'framework-security',
                    actions: [],
                    affectedFiles: [],
                    implementationGuide: `# Angular Security Best Practices

Angular has built-in protections against common vulnerabilities, but you should still follow these best practices:

## 1. Use Angular's Built-in Protections

Angular automatically sanitizes data for HTML, styles, URLs, and resources to prevent XSS attacks, but be careful with:

- \`bypassSecurityTrustHtml\`
- \`bypassSecurityTrustStyle\`
- \`bypassSecurityTrustScript\`
- \`bypassSecurityTrustUrl\`
- \`bypassSecurityTrustResourceUrl\`

Use these only when you're absolutely certain the content is safe.

## 2. XSRF/CSRF Protection

Angular includes built-in CSRF protection. Enable it in your HttpClientModule:

\`\`\`typescript
@NgModule({
  imports: [
    HttpClientModule,
    HttpClientXsrfModule.withOptions({
      cookieName: 'XSRF-TOKEN',
      headerName: 'X-XSRF-TOKEN',
    }),
  ],
})
export class AppModule {}
\`\`\`

## 3. Content Security Policy (CSP)

Implement a strict CSP to prevent XSS and other injection attacks:

\`\`\`html
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; object-src 'none'">
\`\`\`

## 4. Use AOT Compilation

Always use Ahead-of-Time (AOT) compilation in production to eliminate any template injection vulnerabilities:

\`\`\`bash
ng build --prod
\`\`\`

## 5. Keep Angular Updated

Regularly update Angular to the latest version to get security patches:

\`\`\`bash
ng update @angular/core @angular/cli
\`\`\``
                });
            }
            // Vue.js security recommendations
            const vueConfigPaths = [
                path.join(folder.uri.fsPath, 'package.json'),
                path.join(folder.uri.fsPath, 'vue.config.js')
            ];
            if (this.isUsingFramework(vueConfigPaths, 'vue')) {
                recommendations.push({
                    id: 'REC-VUE-001',
                    title: 'Use Vue.js security best practices',
                    description: 'Ensure your Vue.js application follows security best practices to prevent common vulnerabilities.',
                    severity: 'medium',
                    category: 'framework-security',
                    actions: [],
                    affectedFiles: [],
                    implementationGuide: `# Vue.js Security Best Practices

Vue.js applications require attention to specific security concerns:

## 1. Avoid v-html with Untrusted Content

Vue escapes content by default, but \`v-html\` doesn't:

\`\`\`html
<!-- Unsafe if userContent is untrusted -->
<div v-html="userContent"></div>

<!-- Instead, use text interpolation -->
<div>{{ userContent }}</div>
\`\`\`

If you must use \`v-html\`, sanitize the content first:

\`\`\`javascript
import sanitizeHtml from 'sanitize-html';

export default {
  computed: {
    sanitizedContent() {
      return sanitizeHtml(this.userContent);
    }
  }
}
\`\`\`

## 2. Use Vue's Security Features

- Use Vue templates instead of render functions when possible
- Enable Content Security Policy
- Set \`Vue.config.devtools = false\` in production

## 3. Secure Vue Router

Implement proper authentication and route guards:

\`\`\`javascript
router.beforeEach((to, from, next) => {
  if (to.matched.some(record => record.meta.requiresAuth)) {
    // Check if user is authenticated
    if (!isAuthenticated()) {
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      });
    } else {
      next();
    }
  } else {
    next();
  }
});
\`\`\`

## 4. Avoid Exposing Sensitive Data in Vuex Store

The Vuex store can be accessed through Vue DevTools, so:

- Don't store sensitive data in Vuex
- Use secure HTTP-only cookies for authentication tokens
- Clear sensitive data when the user logs out

## 5. Keep Dependencies Updated

Regularly check for and update vulnerable dependencies:

\`\`\`bash
npm audit
npm update
\`\`\``
                });
            }
        }
        return recommendations;
    }
    /**
     * Check if a project is using a specific framework
     */
    isUsingFramework(configPaths, framework) {
        for (const configPath of configPaths) {
            if (fs.existsSync(configPath)) {
                try {
                    // For package.json, check dependencies
                    if (configPath.endsWith('package.json')) {
                        const packageJson = JSON.parse(fs.readFileSync(configPath, 'utf8'));
                        const allDeps = {
                            ...(packageJson.dependencies || {}),
                            ...(packageJson.devDependencies || {})
                        };
                        // Check for framework in dependencies
                        if (allDeps[framework] ||
                            Object.keys(allDeps).some(dep => dep.startsWith(`@${framework}/`) || dep.includes(framework))) {
                            return true;
                        }
                    }
                    else {
                        // For other config files, just check if they exist
                        return true;
                    }
                }
                catch (error) {
                    console.error(`Error checking framework usage in ${configPath}:`, error);
                }
            }
        }
        return false;
    }
    /**
     * Generate general security best practices recommendations
     */
    generateBestPracticesRecommendations() {
        return [
            {
                id: 'REC-BEST-001',
                title: 'Implement secure password storage',
                description: 'Store passwords securely using strong, modern hashing algorithms.',
                severity: 'critical',
                category: 'best-practices',
                actions: [],
                affectedFiles: [],
                implementationGuide: `# Secure Password Storage

Proper password storage is critical for application security. Here's how to implement it correctly:

## 1. Use Strong Hashing Algorithms

Always use modern, slow hashing algorithms designed specifically for passwords:

- **bcrypt** - Widely adopted and includes salting automatically
- **Argon2** - Winner of the Password Hashing Competition
- **PBKDF2** - NIST-approved, widely available

NEVER use:
- MD5 or SHA-1 (broken)
- SHA-256/SHA-512 alone (too fast)
- Homemade hashing algorithms

## 2. Example Implementation (Node.js with bcrypt)

\`\`\`javascript
const bcrypt = require('bcrypt');

// Hashing a password before storing
async function hashPassword(plainTextPassword) {
  const saltRounds = 12; // Higher is more secure but slower
  return await bcrypt.hash(plainTextPassword, saltRounds);
}

// Verifying a password
async function verifyPassword(plainTextPassword, hashedPassword) {
  return await bcrypt.compare(plainTextPassword, hashedPassword);
}
\`\`\`

## 3. Best Practices

- Use a salt (bcrypt and Argon2 handle this automatically)
- Set an appropriate work factor (cost) to make brute-force attacks impractical
- Increase the work factor as hardware gets faster
- Consider implementing account lockout after failed attempts
- Never store passwords in plain text, even temporarily

## 4. Additional Security Measures

- Enforce strong password policies
- Implement multi-factor authentication
- Use secure password recovery mechanisms
- Consider a password breach detection service`
            },
            {
                id: 'REC-BEST-002',
                title: 'Implement proper error handling and logging',
                description: 'Ensure errors are handled securely and logged appropriately.',
                severity: 'medium',
                category: 'best-practices',
                actions: [],
                affectedFiles: [],
                implementationGuide: `# Secure Error Handling and Logging

Proper error handling and logging helps maintain security while providing useful information for debugging.

## 1. Secure Error Handling

Don't expose sensitive information in error messages to users:

\`\`\`javascript
// Bad - exposes internal details
app.use((err, req, res, next) => {
  res.status(500).send(\`Error: \${err.stack}\`);
});

// Good - generic message for users, detailed logging for developers
app.use((err, req, res, next) => {
  // Log the detailed error for developers
  console.error('Error:', err);
  
  // Send generic message to users
  res.status(500).send('An unexpected error occurred');
});
\`\`\`

## 2. Implement Structured Logging

Use a structured logging library with different log levels:

\`\`\`javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// In production, also log to console
if (process.env.NODE_ENV === 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}
\`\`\`

## 3. Sensitive Data in Logs

- Never log credentials, tokens, or personal data
- Sanitize inputs before logging
- Consider using a redaction tool for logs

\`\`\`javascript
// Redact sensitive data
function sanitizeForLogging(obj) {
  const clone = { ...obj };
  const sensitiveFields = ['password', 'token', 'ssn', 'creditCard'];
  
  Object.keys(clone).forEach(key => {
    if (sensitiveFields.includes(key.toLowerCase())) {
      clone[key] = '[REDACTED]';
    }
  });
  
  return clone;
}

// Usage
logger.info('User data', sanitizeForLogging(userData));
\`\`\`

## 4. Security Events Logging

Always log security-relevant events:
- Authentication attempts (success/failure)
- Authorization failures
- Input validation failures 
- Administrator actions
- Data export/access to sensitive information`
            },
            {
                id: 'REC-BEST-003',
                title: 'Implement secure database access',
                description: 'Ensure your database access follows security best practices.',
                severity: 'high',
                category: 'best-practices',
                actions: [],
                affectedFiles: [],
                implementationGuide: `# Secure Database Access

Protecting your database is critical for application security. Follow these best practices:

## 1. Prevent SQL Injection

Always use parameterized queries or ORM:

\`\`\`javascript
// BAD - SQL injection vulnerability
const query = \`SELECT * FROM users WHERE username = '\${username}'\`;

// GOOD - Parameterized query
const query = 'SELECT * FROM users WHERE username = ?';
db.query(query, [username], (err, results) => {
  // Handle results
});

// GOOD - Using an ORM (Sequelize example)
User.findOne({ where: { username: username } }).then(user => {
  // Handle user
});
\`\`\`

## 2. Implement Least Privilege

- Create different database users for different operations
- Restrict permissions to only what's necessary
- Use read-only accounts for queries that don't need to modify data

Example MySQL permissions:

\`\`\`sql
-- Create a read-only user
CREATE USER 'readonly_user'@'localhost' IDENTIFIED BY 'secure_password';
GRANT SELECT ON database_name.* TO 'readonly_user'@'localhost';

-- Create a user that can only insert into specific tables
CREATE USER 'app_user'@'localhost' IDENTIFIED BY 'secure_password';
GRANT SELECT, INSERT ON database_name.allowed_table TO 'app_user'@'localhost';
\`\`\`

## 3. Secure Connection Settings

Always use encrypted connections to your database:

\`\`\`javascript
// Node.js MySQL example
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'user',
  password: 'password',
  database: 'db_name',
  ssl: {
    rejectUnauthorized: true
  }
});
\`\`\`

## 4. Data Encryption

- Encrypt sensitive data before storing it
- Consider using transparent data encryption (TDE) if available
- Use column-level encryption for highly sensitive fields

## 5. Connection Pooling & Timeouts

- Implement connection pooling to manage resources
- Set appropriate timeouts to prevent DoS
- Properly close connections when done

\`\`\`javascript
// Connection pooling example
const pool = mysql.createPool({
  connectionLimit: 10,
  host: 'localhost',
  user: 'user',
  password: 'password',
  database: 'db_name',
  connectTimeout: 10000, // 10 seconds
  acquireTimeout: 10000
});
\`\`\``
            }
        ];
    }
    /**
     * Generate an implementation guide for a security issue
     */
    generateImplementationGuide(issue) {
        // Basic guides for common issues
        switch (issue.id) {
            case 'SEC001':
                return `# Preventing SQL Injection

SQL injection occurs when untrusted data is included in a SQL query without proper validation or escaping.

## Vulnerable Code
\`\`\`javascript
${issue.code}
\`\`\`

## Secure Implementation
Use parameterized queries instead of string concatenation:

\`\`\`javascript
// Using parameterized queries with node-postgres
const result = await client.query(
  'SELECT * FROM users WHERE username = $1',
  [username]
);

// Using an ORM like Sequelize
const user = await User.findOne({
  where: { username: username }
});
\`\`\`

## Additional Safeguards
- Validate and sanitize all user inputs
- Use ORM libraries when possible
- Apply the principle of least privilege for database users
- Consider using prepared statements for all database operations`;
            case 'SEC002':
                return `# Preventing Cross-Site Scripting (XSS)

XSS attacks occur when untrusted data is included in a web page without proper validation or escaping.

## Vulnerable Code
\`\`\`javascript
${issue.code}
\`\`\`

## Secure Implementation
Use safer alternatives that automatically encode HTML entities:

\`\`\`javascript
// Instead of innerHTML
element.textContent = userProvidedContent;

// For frameworks, use their built-in protection:
// React
return <div>{userProvidedContent}</div>;

// Vue
<div>{{ userProvidedContent }}</div>
\`\`\`

## Additional Safeguards
- Implement a Content Security Policy (CSP)
- Sanitize HTML if you must render it (use libraries like DOMPurify)
- Use framework-specific protection mechanisms
- Set appropriate cookie flags (HttpOnly, Secure, SameSite)`;
            case 'SEC004':
                return `# Avoiding Hardcoded Credentials

Hardcoded credentials in source code are a significant security risk.

## Vulnerable Code
\`\`\`javascript
${issue.code}
\`\`\`

## Secure Implementation
Use environment variables or a secure vault:

\`\`\`javascript
// Using environment variables
const apiKey = process.env.API_KEY;

// Or using a configuration file that's excluded from version control
const config = require('./config.json');
const apiKey = config.apiKey;
\`\`\`

## Additional Safeguards
- Use a secrets management solution (AWS Secrets Manager, HashiCorp Vault, etc.)
- Implement role-based access control
- Rotate credentials regularly
- Use different credentials for different environments`;
            default:
                return `# Fixing ${issue.name}

## Issue Description
${issue.description}

## Vulnerable Code
\`\`\`javascript
${issue.code}
\`\`\`

## Recommended Fix
${issue.fix}

## Implementation Steps
1. Identify all occurrences of the pattern
2. Apply the recommended fix to each instance
3. Test thoroughly to ensure functionality is maintained
4. Consider implementing automated checks to prevent similar issues`;
        }
    }
    /**
     * Map issue severity to recommendation severity
     */
    mapIssueSeverityToRecommendationSeverity(issueSeverity) {
        switch (issueSeverity) {
            case 'Error':
                return 'critical';
            case 'Warning':
                return 'high';
            case 'Information':
                return 'medium';
            case 'Hint':
                return 'low';
            default:
                return 'medium';
        }
    }
    /**
     * Format category name for display
     */
    formatCategoryName(category) {
        return category
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }
    /**
     * Calculate severity counts for the analysis summary
     */
    calculateSeverityCounts(recommendations) {
        return recommendations.reduce((summary, recommendation) => {
            summary.total++;
            summary[recommendation.severity]++;
            return summary;
        }, { total: 0, critical: 0, high: 0, medium: 0, low: 0 });
    }
    /**
     * Show the security recommendations in a webview panel
     */
    async showRecommendations(result) {
        const panel = vscode.window.createWebviewPanel('securityRecommendations', 'Security Recommendations', vscode.ViewColumn.One, { enableScripts: true });
        panel.webview.html = this.generateRecommendationsHtml(result);
        // Handle message from the webview
        panel.webview.onDidReceiveMessage(async (message) => {
            if (message.command === 'openFile') {
                const document = await vscode.workspace.openTextDocument(message.file);
                await vscode.window.showTextDocument(document);
            }
            else if (message.command === 'executeAction') {
                const { actionCommand, args } = message;
                await vscode.commands.executeCommand(actionCommand, ...args);
            }
            else if (message.command === 'showImplementationGuide') {
                const { recommendationId, guide } = message;
                const guidePanel = vscode.window.createWebviewPanel(`implementationGuide-${recommendationId}`, `Implementation Guide: ${result.recommendations.find(r => r.id === recommendationId)?.title || 'Guide'}`, vscode.ViewColumn.Beside, { enableScripts: true });
                guidePanel.webview.html = this.generateMarkdownViewHtml(guide);
            }
        }, undefined, this.context.subscriptions);
    }
    /**
     * Generate HTML for the security recommendations report
     */
    generateRecommendationsHtml(result) {
        // Group recommendations by category
        const categories = {};
        for (const recommendation of result.recommendations) {
            if (!categories[recommendation.category]) {
                categories[recommendation.category] = [];
            }
            categories[recommendation.category].push(recommendation);
        }
        // Generate HTML for each category
        let categoriesHtml = '';
        for (const [category, recommendations] of Object.entries(categories)) {
            const categoryTitle = this.formatCategoryName(category);
            const recommendationsHtml = recommendations.map(recommendation => {
                // Generate actions HTML
                const actionsHtml = recommendation.actions.map(action => {
                    return `<button class="action-button" data-command="${action.command}" data-args='${JSON.stringify(action.arguments || [])}'>
                        ${action.label}
                    </button>`;
                }).join('');
                // Generate affected files HTML
                let affectedFilesHtml = '';
                if (recommendation.affectedFiles && recommendation.affectedFiles.length > 0) {
                    const fileListHtml = recommendation.affectedFiles.slice(0, 5).map(file => {
                        const fileName = path.basename(file);
                        return `<li><a href="#" class="file-link" data-file="${file}">${fileName}</a></li>`;
                    }).join('');
                    const remainingFiles = recommendation.affectedFiles.length - 5;
                    const moreFilesHtml = remainingFiles > 0 ?
                        `<li>And ${remainingFiles} more file${remainingFiles > 1 ? 's' : ''}...</li>` : '';
                    affectedFilesHtml = `
                        <div class="affected-files">
                            <h4>Affected Files:</h4>
                            <ul>
                                ${fileListHtml}
                                ${moreFilesHtml}
                            </ul>
                        </div>
                    `;
                }
                // Implementation guide button
                const implementationGuideHtml = recommendation.implementationGuide ?
                    `<button class="guide-button" data-id="${recommendation.id}" data-guide="${this.escapeHtml(recommendation.implementationGuide)}">
                        Show Implementation Guide
                    </button>` : '';
                return `
                    <div class="recommendation ${recommendation.severity}">
                        <h3>${recommendation.title}</h3>
                        <div class="severity-tag ${recommendation.severity}">${recommendation.severity}</div>
                        <p>${recommendation.description}</p>
                        
                        ${affectedFilesHtml}
                        
                        <div class="actions">
                            ${actionsHtml}
                            ${implementationGuideHtml}
                        </div>
                    </div>
                `;
            }).join('');
            categoriesHtml += `
                <div class="category">
                    <h2>${categoryTitle}</h2>
                    ${recommendationsHtml}
                </div>
            `;
        }
        // If no recommendations, show a message
        if (result.recommendations.length === 0) {
            categoriesHtml = `
                <div class="no-recommendations">
                    <p>No security recommendations found. Your project looks good!</p>
                </div>
            `;
        }
        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Security Recommendations</title>
                <style>
                    body {
                        font-family: var(--vscode-font-family);
                        color: var(--vscode-foreground);
                        background-color: var(--vscode-editor-background);
                        padding: 20px;
                    }
                    h1, h2, h3, h4 {
                        color: var(--vscode-editor-foreground);
                    }
                    .summary {
                        margin-bottom: 20px;
                        padding: 15px;
                        background-color: var(--vscode-panel-background);
                        border-radius: 5px;
                        display: flex;
                        flex-wrap: wrap;
                        gap: 10px;
                    }
                    .summary-item {
                        flex: 1;
                        min-width: 120px;
                        padding: 10px;
                        border-radius: 5px;
                        text-align: center;
                    }
                    .summary-item h3 {
                        margin-top: 0;
                    }
                    .summary-item.critical {
                        background-color: rgba(255, 69, 58, 0.1);
                    }
                    .summary-item.high {
                        background-color: rgba(255, 159, 10, 0.1);
                    }
                    .summary-item.medium {
                        background-color: rgba(48, 176, 199, 0.1);
                    }
                    .summary-item.low {
                        background-color: rgba(100, 210, 255, 0.1);
                    }
                    .category {
                        margin-bottom: 30px;
                    }
                    .recommendation {
                        margin-bottom: 20px;
                        padding: 15px;
                        background-color: var(--vscode-panel-background);
                        border-radius: 5px;
                        position: relative;
                    }
                    .recommendation.critical {
                        border-left: 4px solid var(--vscode-errorForeground);
                    }
                    .recommendation.high {
                        border-left: 4px solid var(--vscode-editorWarning-foreground);
                    }
                    .recommendation.medium {
                        border-left: 4px solid var(--vscode-editorInfo-foreground);
                    }
                    .recommendation.low {
                        border-left: 4px solid var(--vscode-textLink-foreground);
                    }
                    .severity-tag {
                        position: absolute;
                        top: 15px;
                        right: 15px;
                        padding: 3px 8px;
                        border-radius: 3px;
                        font-size: 12px;
                        text-transform: uppercase;
                    }
                    .severity-tag.critical {
                        background-color: var(--vscode-errorForeground);
                        color: var(--vscode-editor-background);
                    }
                    .severity-tag.high {
                        background-color: var(--vscode-editorWarning-foreground);
                        color: var(--vscode-editor-background);
                    }
                    .severity-tag.medium {
                        background-color: var(--vscode-editorInfo-foreground);
                        color: var(--vscode-editor-background);
                    }
                    .severity-tag.low {
                        background-color: var(--vscode-textLink-foreground);
                        color: var(--vscode-editor-background);
                    }
                    .affected-files {
                        margin: 10px 0;
                        padding: 10px;
                        background-color: var(--vscode-editor-background);
                        border-radius: 5px;
                    }
                    .affected-files ul {
                        margin: 5px 0;
                        padding-left: 20px;
                    }
                    .actions {
                        margin-top: 15px;
                        display: flex;
                        gap: 10px;
                        flex-wrap: wrap;
                    }
                    .action-button, .guide-button {
                        padding: 5px 10px;
                        background-color: var(--vscode-button-background);
                        color: var(--vscode-button-foreground);
                        border: none;
                        border-radius: 3px;
                        cursor: pointer;
                    }
                    .guide-button {
                        background-color: var(--vscode-editorInlayHint-background);
                        color: var(--vscode-editorInlayHint-foreground);
                    }
                    .action-button:hover, .guide-button:hover {
                        opacity: 0.9;
                    }
                    .no-recommendations {
                        padding: 20px;
                        background-color: var(--vscode-panel-background);
                        border-radius: 5px;
                        text-align: center;
                    }
                    .file-link {
                        color: var(--vscode-textLink-foreground);
                        text-decoration: none;
                    }
                    .file-link:hover {
                        text-decoration: underline;
                    }
                </style>
            </head>
            <body>
                <h1>Security Recommendations</h1>
                
                <div class="summary">
                    <div class="summary-item">
                        <h3>Total</h3>
                        <p>${result.analysisSummary.total}</p>
                    </div>
                    <div class="summary-item critical">
                        <h3>Critical</h3>
                        <p>${result.analysisSummary.critical}</p>
                    </div>
                    <div class="summary-item high">
                        <h3>High</h3>
                        <p>${result.analysisSummary.high}</p>
                    </div>
                    <div class="summary-item medium">
                        <h3>Medium</h3>
                        <p>${result.analysisSummary.medium}</p>
                    </div>
                    <div class="summary-item low">
                        <h3>Low</h3>
                        <p>${result.analysisSummary.low}</p>
                    </div>
                </div>
                
                ${categoriesHtml}
                
                <script>
                    (function() {
                        const vscode = acquireVsCodeApi();
                        
                        // Handle file links
                        document.addEventListener('click', (e) => {
                            if (e.target.classList.contains('file-link')) {
                                const file = e.target.getAttribute('data-file');
                                vscode.postMessage({
                                    command: 'openFile',
                                    file: file
                                });
                            }
                            
                            // Handle action buttons
                            if (e.target.classList.contains('action-button')) {
                                const command = e.target.getAttribute('data-command');
                                const argsStr = e.target.getAttribute('data-args');
                                const args = JSON.parse(argsStr);
                                
                                vscode.postMessage({
                                    command: 'executeAction',
                                    actionCommand: command,
                                    args: args
                                });
                            }
                            
                            // Handle guide buttons
                            if (e.target.classList.contains('guide-button')) {
                                const id = e.target.getAttribute('data-id');
                                const guide = e.target.getAttribute('data-guide');
                                
                                vscode.postMessage({
                                    command: 'showImplementationGuide',
                                    recommendationId: id,
                                    guide: guide
                                });
                            }
                        });
                    })();
                </script>
            </body>
            </html>
        `;
    }
    /**
     * Generate HTML for a markdown implementation guide
     */
    generateMarkdownViewHtml(markdownContent) {
        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Implementation Guide</title>
                <style>
                    body {
                        font-family: var(--vscode-font-family);
                        color: var(--vscode-foreground);
                        background-color: var(--vscode-editor-background);
                        padding: 20px;
                        line-height: 1.5;
                    }
                    h1, h2, h3, h4 {
                        color: var(--vscode-editor-foreground);
                        margin-top: 24px;
                        margin-bottom: 16px;
                        font-weight: 600;
                        line-height: 1.25;
                    }
                    h1 {
                        font-size: 2em;
                        margin-top: 0;
                    }
                    h2 {
                        font-size: 1.5em;
                        border-bottom: 1px solid var(--vscode-panel-border);
                        padding-bottom: 0.3em;
                    }
                    h3 {
                        font-size: 1.25em;
                    }
                    p, ul, ol {
                        margin-top: 0;
                        margin-bottom: 16px;
                    }
                    a {
                        color: var(--vscode-textLink-foreground);
                        text-decoration: none;
                    }
                    a:hover {
                        text-decoration: underline;
                    }
                    code {
                        font-family: var(--vscode-editor-font-family);
                        background-color: var(--vscode-textBlockQuote-background);
                        padding: 0.2em 0.4em;
                        border-radius: 3px;
                    }
                    pre {
                        padding: 16px;
                        overflow: auto;
                        background-color: var(--vscode-textCodeBlock-background);
                        border-radius: 3px;
                        margin-bottom: 16px;
                    }
                    pre code {
                        background-color: transparent;
                        padding: 0;
                    }
                    blockquote {
                        padding: 0 1em;
                        color: var(--vscode-foreground);
                        border-left: 0.25em solid var(--vscode-textSeparator-foreground);
                        margin: 0 0 16px 0;
                    }
                    ul, ol {
                        padding-left: 2em;
                    }
                    img {
                        max-width: 100%;
                        height: auto;
                    }
                </style>
                <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
            </head>
            <body>
                <div id="content"></div>
                
                <script>
                    document.getElementById('content').innerHTML = marked.parse(${JSON.stringify(markdownContent)});
                </script>
            </body>
            </html>
        `;
    }
    /**
     * Escape HTML special characters
     */
    escapeHtml(text) {
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
}
exports.SecurityRecommendations = SecurityRecommendations;
//# sourceMappingURL=securityRecommendations.js.map