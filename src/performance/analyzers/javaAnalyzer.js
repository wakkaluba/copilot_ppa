"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JavaAnalyzer = void 0;
var baseAnalyzer_1 = require("./baseAnalyzer");
var JavaAnalyzer = /** @class */ (function (_super) {
    __extends(JavaAnalyzer, _super);
    function JavaAnalyzer() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.thresholds = {
            cyclomaticComplexity: [10, 20],
            nestedBlockDepth: [3, 5],
            functionLength: [100, 200],
            parameterCount: [4, 7],
            maintainabilityIndex: [65, 85],
            commentRatio: [10, 20]
        };
        _this.memoryPatterns = {
            stringBufferInit: /new\s+String(?:Buffer|Builder)\s*\(\s*\d+\s*\)/g,
            staticCollections: /static\s+(?:final\s+)?(?:List|Set|Map)</g,
            resourceLeaks: /new\s+(?:File|Socket|Connection)[^;]+;(?![^}]*(?:close|dispose)\s*\(\s*\))/g,
            unclosedResources: /try\s*\{[^}]*new\s+(?:File|Socket|Connection)[^;]+;[^}]*\}\s*catch/g,
            nonFinalStatics: /static\s+(?!final\s+)\w+\s+\w+/g
        };
        _this.concurrencyPatterns = {
            unsynchronizedStatic: /static\s+(?!final\s+)(?!synchronized\s+)\w+\s+\w+/g,
            synchronizedMethod: /synchronized\s+\w+\s+\w+\s*\([^)]*\)/g,
            lockUsage: /(?:ReentrantLock|Lock)\s+\w+\s*=/g,
            threadCreation: /new\s+Thread\s*\(/g,
            executorUsage: /Executors\.\w+/g
        };
        _this.performancePatterns = {
            stringConcat: /(?:"\s*\+\s*"|'\s*\+\s*')/g,
            boxingInLoop: /for[^{]+\{[^}]*(?:Integer|Long|Double|Boolean)\.(?:valueOf|parse)/g,
            collectionSizeInLoop: /for[^{]+\{[^}]*\.\s*size\s*\(\s*\)/g,
            inefficientListAccess: /for\s*\([^)]+\)\s*\{[^}]*\.get\s*\(\s*i\s*\)/g,
            repeatedMethodCalls: /(\w+\.\w+\([^)]*\).*){3,}/g
        };
        return _this;
    }
    JavaAnalyzer.prototype.analyze = function (fileContent, filePath) {
        var result = this.createBaseResult(fileContent, filePath);
        var lines = fileContent.split('\n');
        try {
            // Core analysis steps
            this.analyzeMemoryPatterns(fileContent, lines, result);
            this.analyzeConcurrencyPatterns(fileContent, lines, result);
            this.analyzePerformancePatterns(fileContent, lines, result);
            this.analyzeCollectionUsage(fileContent, lines, result);
            this.analyzeStreamOperations(fileContent, lines, result);
            this.analyzeExceptionHandling(fileContent, lines, result);
            this.analyzeJavaSpecifics(fileContent, lines, result);
            // Calculate and merge metrics
            var metrics = this.calculateJavaMetrics(fileContent);
            result.metrics = __assign(__assign({}, result.metrics), metrics);
            return result;
        }
        catch (error) {
            console.error("Error analyzing Java file ".concat(filePath, ":"), error);
            result.issues.push({
                title: 'Analysis Error',
                description: 'Failed to complete full analysis of file',
                severity: 'low',
                line: 0,
                code: null,
                solution: 'Review file for potential syntax errors or unsupported constructs'
            });
            return result;
        }
    };
    JavaAnalyzer.prototype.analyzeMemoryPatterns = function (fileContent, lines, result) {
        // Check non-final static fields
        var match;
        while ((match = this.memoryPatterns.nonFinalStatics.exec(fileContent)) !== null) {
            var lineIndex = this.findLineNumber(fileContent, match.index);
            result.issues.push({
                title: 'Non-final Static Field',
                description: 'Non-final static fields can cause memory leaks and thread safety issues',
                severity: 'high',
                line: lineIndex + 1,
                code: this.extractCodeSnippet(lines, lineIndex, 3),
                solution: 'Make static fields final or convert to instance fields',
                solutionCode: '// Instead of:\nstatic List<String> data;\n\n// Use:\nprivate static final List<String> DATA = new ArrayList<>();\n// Or:\nprivate List<String> data;'
            });
        }
        // Check resource leaks
        while ((match = this.memoryPatterns.resourceLeaks.exec(fileContent)) !== null) {
            var lineIndex = this.findLineNumber(fileContent, match.index);
            result.issues.push({
                title: 'Potential Resource Leak',
                description: 'Resource not properly closed in a finally block or try-with-resources',
                severity: 'critical',
                line: lineIndex + 1,
                code: this.extractCodeSnippet(lines, lineIndex, 3),
                solution: 'Use try-with-resources statement',
                solutionCode: '// Instead of:\nFileInputStream fis = new FileInputStream(file);\ntry {\n    // use fis\n} finally {\n    fis.close();\n}\n\n// Use:\ntry (FileInputStream fis = new FileInputStream(file)) {\n    // use fis\n}'
            });
        }
    };
    JavaAnalyzer.prototype.analyzeConcurrencyPatterns = function (fileContent, lines, result) {
        // Check synchronized method usage
        var match;
        while ((match = this.concurrencyPatterns.synchronizedMethod.exec(fileContent)) !== null) {
            var lineIndex = this.findLineNumber(fileContent, match.index);
            result.issues.push({
                title: 'Coarse-grained Synchronization',
                description: 'Method-level synchronization might be too coarse-grained',
                severity: 'medium',
                line: lineIndex + 1,
                code: this.extractCodeSnippet(lines, lineIndex, 3),
                solution: 'Consider using more fine-grained synchronization or concurrent collections',
                solutionCode: '// Instead of:\nsynchronized void processData(Data data) {\n    // process\n}\n\n// Use:\nvoid processData(Data data) {\n    synchronized(lock) {\n        // critical section\n    }\n    // non-critical section\n}'
            });
        }
        // Check thread creation
        while ((match = this.concurrencyPatterns.threadCreation.exec(fileContent)) !== null) {
            var lineIndex = this.findLineNumber(fileContent, match.index);
            result.issues.push({
                title: 'Direct Thread Creation',
                description: 'Creating threads directly instead of using ExecutorService',
                severity: 'medium',
                line: lineIndex + 1,
                code: this.extractCodeSnippet(lines, lineIndex, 3),
                solution: 'Use ExecutorService for better thread management',
                solutionCode: '// Instead of:\nnew Thread(() -> process()).start();\n\n// Use:\nExecutorService executor = Executors.newFixedThreadPool(nThreads);\nexecutor.submit(() -> process());'
            });
        }
    };
    JavaAnalyzer.prototype.analyzePerformancePatterns = function (fileContent, lines, result) {
        // Check boxing in loops
        var match;
        while ((match = this.performancePatterns.boxingInLoop.exec(fileContent)) !== null) {
            var lineIndex = this.findLineNumber(fileContent, match.index);
            result.issues.push({
                title: 'Autoboxing in Loop',
                description: 'Autoboxing/unboxing in loops can impact performance',
                severity: 'medium',
                line: lineIndex + 1,
                code: this.extractCodeSnippet(lines, lineIndex, 3),
                solution: 'Use primitive types in performance-critical loops',
                solutionCode: '// Instead of:\nfor (int i = 0; i < n; i++) {\n    Integer value = Integer.valueOf(i); // boxing\n}\n\n// Use:\nfor (int i = 0; i < n; i++) {\n    int value = i; // no boxing\n}'
            });
        }
        // Check collection size in loop
        while ((match = this.performancePatterns.collectionSizeInLoop.exec(fileContent)) !== null) {
            var lineIndex = this.findLineNumber(fileContent, match.index);
            result.issues.push({
                title: 'Inefficient Loop Condition',
                description: 'Calling size() in every loop iteration',
                severity: 'low',
                line: lineIndex + 1,
                code: this.extractCodeSnippet(lines, lineIndex, 3),
                solution: 'Cache the collection size before the loop',
                solutionCode: '// Instead of:\nfor (int i = 0; i < list.size(); i++)\n\n// Use:\nint size = list.size();\nfor (int i = 0; i < size; i++)'
            });
        }
    };
    JavaAnalyzer.prototype.analyzeCollectionUsage = function (fileContent, lines, result) {
        var syncCollections = (fileContent.match(/Collections\.synchronized\w+\(/g) || []).length;
        if (syncCollections > 0) {
            result.issues.push({
                title: 'Legacy Synchronized Collections',
                description: 'Using legacy synchronized collections instead of concurrent collections',
                severity: 'medium',
                line: this.findFirstOccurrence(lines, 'Collections.synchronized'),
                code: 'Collections.synchronizedMap(new HashMap<>())',
                solution: 'Consider using concurrent collections from java.util.concurrent',
                solutionCode: 'Map<K,V> map = new ConcurrentHashMap<>();'
            });
        }
    };
    JavaAnalyzer.prototype.analyzeStreamOperations = function (fileContent, lines, result) {
        var parallelStreams = (fileContent.match(/\.parallelStream\(\)/g) || []).length;
        if (parallelStreams > 0) {
            this.analyzeParallelStreamUsage(fileContent, lines, result, parallelStreams);
        }
        var streamCollectors = (fileContent.match(/\.collect\(Collectors\./g) || []).length;
        if (streamCollectors > 10) {
            result.issues.push({
                title: 'Heavy Stream Processing',
                description: 'Multiple stream collectors in use. Consider performance impact.',
                severity: 'medium',
                line: this.findFirstOccurrence(lines, '.collect(Collectors.'),
                code: '.collect(Collectors...)',
                solution: 'Consider using for loops for simple operations or batch processing for large datasets'
            });
        }
    };
    JavaAnalyzer.prototype.analyzeExceptionHandling = function (fileContent, lines, result) {
        var catchBlockRegex = /catch\s*\(\s*(Exception|Throwable)\s+\w+\s*\)\s*\{/g;
        var match;
        while ((match = catchBlockRegex.exec(fileContent)) !== null) {
            var lineIndex = this.findLineNumber(fileContent, match.index);
            result.issues.push({
                title: 'Generic Exception Handling',
                description: 'Catching generic exceptions can mask errors and impact performance',
                severity: 'medium',
                line: lineIndex + 1,
                code: this.extractCodeSnippet(lines, lineIndex, 3),
                solution: 'Catch specific exceptions instead of using generic Exception or Throwable',
                solutionCode: '// Instead of:\ntry {\n    // risky operation\n} catch (Exception e) {\n    // handle error\n}\n\n// Use:\ntry {\n    // risky operation\n} catch (IOException e) {\n    // handle IO error\n} catch (SQLException e) {\n    // handle SQL error\n}'
            });
        }
    };
    JavaAnalyzer.prototype.analyzeJavaSpecifics = function (fileContent, _lines, result) {
        // Check for modern Java features usage
        var modernFeatures = {
            optionalUsage: /Optional\.</g,
            streamApi: /\.stream\(\)/g,
            varKeyword: /\bvar\b/g
        };
        for (var _i = 0, _a = Object.entries(modernFeatures); _i < _a.length; _i++) {
            var _b = _a[_i], feature = _b[0], pattern = _b[1];
            if (!pattern.test(fileContent)) {
                result.issues.push({
                    title: 'Modern Java Feature Opportunity',
                    description: "Consider using ".concat(feature, " for better code quality"),
                    severity: 'info',
                    line: 1,
                    code: null,
                    solution: 'Utilize modern Java features where appropriate',
                    solutionCode: feature === 'Optional' ?
                        '// Use Optional to handle nullable values:\nOptional.ofNullable(value).orElse(defaultValue)' :
                        feature === 'streamApi' ?
                            '// Use Stream API for collections:\nlist.stream().filter(predicate).map(mapper).collect(Collectors.toList())' :
                            '// Use var for local variables:\nvar result = new HashMap<String, List<Integer>>();'
                });
            }
        }
    };
    JavaAnalyzer.prototype.calculateJavaMetrics = function (content) {
        return {
            classCount: (content.match(/\bclass\s+\w+/g) || []).length,
            methodCount: (content.match(/(?:public|private|protected)\s+\w+\s+\w+\s*\(/g) || []).length,
            fieldCount: (content.match(/(?:public|private|protected)\s+\w+\s+\w+\s*;/g) || []).length,
            interfaceCount: (content.match(/\binterface\s+\w+/g) || []).length,
            enumCount: (content.match(/\benum\s+\w+/g) || []).length,
            annotationCount: (content.match(/\bannotation\s+\w+/g) || []).length,
            genericsUsageCount: (content.match(/[A-Z]<[^>]+>/g) || []).length,
            lambdaCount: (content.match(/\->|::/g) || []).length,
            streamApiUsageCount: (content.match(/\.stream\(\)/g) || []).length,
            synchronizedBlockCount: (content.match(/\bsynchronized\b/g) || []).length
        };
    };
    JavaAnalyzer.prototype.findFirstOccurrence = function (lines, searchString, pattern) {
        for (var i = 0; i < lines.length; i++) {
            if (pattern) {
                if (pattern.test(lines[i] || '')) {
                    return i + 1;
                }
            }
            else {
                if ((lines[i] || '').includes(searchString)) {
                    return i + 1;
                }
            }
        }
        return 1;
    };
    JavaAnalyzer.prototype.analyzeParallelStreamUsage = function (fileContent, lines, result, parallelStreamCount) {
        var hasCollectors = fileContent.includes('.collect(');
        if (parallelStreamCount > 0 && !hasCollectors) {
            result.issues.push({
                title: 'Inefficient Parallel Stream Usage',
                description: 'Parallel streams without collectors may not provide performance benefits',
                severity: 'medium',
                line: this.findFirstOccurrence(lines, '.parallelStream()'),
                code: '.parallelStream()',
                solution: 'Consider using parallel streams only for computationally intensive operations with collectors'
            });
        }
    };
    return JavaAnalyzer;
}(baseAnalyzer_1.BasePerformanceAnalyzer));
exports.JavaAnalyzer = JavaAnalyzer;
