import * as vscode from 'vscode';
import { DependencyAnalysisService } from '../DependencyAnalysisService';

jest.mock('vscode');

describe('DependencyAnalysisService', () => {
    let service: DependencyAnalysisService;
    let mockReadFile: jest.Mock;
    let mockWorkspaceFolders: { uri: { fsPath: string; joinPath: jest.Mock } }[];

    beforeEach(() => {
        mockReadFile = jest.fn();
        (vscode.workspace.fs.readFile as jest.Mock) = mockReadFile;
        mockWorkspaceFolders = [
            {
                uri: {
                    fsPath: '/test/workspace',
                    joinPath: jest.fn((uri, path) => ({ fsPath: `${uri.fsPath}/${path}` }))
                }
            }
        ];
        (vscode.workspace.workspaceFolders as any) = mockWorkspaceFolders;
        service = new DependencyAnalysisService();
    });

    describe('scanDependencies', () => {
        it('should return empty result when no workspace folders', async () => {
            (vscode.workspace.workspaceFolders as any) = undefined;

            const result = await service.scanDependencies();

            expect(result).toEqual({
                vulnerabilities: [],
                hasVulnerabilities: false,
                timestamp: expect.any(Date),
                totalDependencies: 0
            });
        });

        it('should scan npm, python, and java dependencies', async () => {
            // Mock package.json
            mockReadFile.mockImplementationOnce(() => Buffer.from(JSON.stringify({
                dependencies: {
                    'dep1': '1.0.0',
                    'dep2': '2.0.0'
                },
                devDependencies: {
                    'dev-dep1': '1.0.0'
                }
            })));

            // Mock requirements.txt
            mockReadFile.mockImplementationOnce(() => Buffer.from(
                'package1==1.0.0\n' +
                'package2==2.0.0\n' +
                '# comment\n' +
                'package3==3.0.0'
            ));

            // Mock pom.xml
            mockReadFile.mockImplementationOnce(() => Buffer.from(
                '<project>' +
                '  <dependencies>' +
                '    <dependency>' +
                '      <groupId>group1</groupId>' +
                '      <artifactId>artifact1</artifactId>' +
                '      <version>1.0.0</version>' +
                '    </dependency>' +
                '    <dependency>' +
                '      <groupId>group2</groupId>' +
                '      <artifactId>artifact2</artifactId>' +
                '      <version>2.0.0</version>' +
                '    </dependency>' +
                '  </dependencies>' +
                '</project>'
            ));

            const result = await service.scanDependencies();

            expect(result).toEqual({
                vulnerabilities: [],
                hasVulnerabilities: false,
                timestamp: expect.any(Date),
                totalDependencies: 7  // 3 npm + 3 python + 2 maven
            });
        });

        it('should handle missing dependency files', async () => {
            // Mock file read errors
            mockReadFile.mockRejectedValue(new Error('File not found'));

            const result = await service.scanDependencies();

            expect(result).toEqual({
                vulnerabilities: [],
                hasVulnerabilities: false,
                timestamp: expect.any(Date),
                totalDependencies: 0
            });
        });

        it('should handle malformed package.json', async () => {
            // Mock invalid JSON
            mockReadFile.mockImplementationOnce(() => Buffer.from('invalid json'));

            const result = await service.scanDependencies();

            expect(result).toEqual({
                vulnerabilities: [],
                hasVulnerabilities: false,
                timestamp: expect.any(Date),
                totalDependencies: 0
            });
        });
    });

    describe('scanNpmDependencies', () => {
        it('should scan npm dependencies correctly', async () => {
            mockReadFile.mockResolvedValueOnce(Buffer.from(JSON.stringify({
                dependencies: {
                    'dep1': '1.0.0',
                    'dep2': '2.0.0'
                },
                devDependencies: {
                    'dev-dep1': '1.0.0'
                }
            })));

            const result = await (service as any).scanNpmDependencies(mockWorkspaceFolders[0].uri);

            expect(result).toEqual([]);  // No vulnerabilities in test environment
            expect(mockReadFile).toHaveBeenCalledWith(expect.objectContaining({
                fsPath: expect.stringContaining('package.json')
            }));
        });

        it('should handle missing package.json', async () => {
            mockReadFile.mockRejectedValueOnce(new Error('File not found'));

            const result = await (service as any).scanNpmDependencies(mockWorkspaceFolders[0].uri);

            expect(result).toEqual([]);
        });
    });

    describe('scanPythonDependencies', () => {
        it('should scan python dependencies correctly', async () => {
            mockReadFile.mockResolvedValueOnce(Buffer.from(
                'package1==1.0.0\n' +
                'package2==2.0.0\n' +
                '# comment\n' +
                'package3==3.0.0'
            ));

            const result = await (service as any).scanPythonDependencies(mockWorkspaceFolders[0].uri);

            expect(result).toEqual([]);  // No vulnerabilities in test environment
            expect(mockReadFile).toHaveBeenCalledWith(expect.objectContaining({
                fsPath: expect.stringContaining('requirements.txt')
            }));
        });

        it('should handle missing requirements.txt', async () => {
            mockReadFile.mockRejectedValueOnce(new Error('File not found'));

            const result = await (service as any).scanPythonDependencies(mockWorkspaceFolders[0].uri);

            expect(result).toEqual([]);
        });

        it('should handle malformed requirements.txt', async () => {
            mockReadFile.mockResolvedValueOnce(Buffer.from('invalid==format=1.0.0'));

            const result = await (service as any).scanPythonDependencies(mockWorkspaceFolders[0].uri);

            expect(result).toEqual([]);
        });
    });

    describe('scanJavaDependencies', () => {
        it('should scan java dependencies correctly', async () => {
            mockReadFile.mockResolvedValueOnce(Buffer.from(
                '<project>' +
                '  <dependencies>' +
                '    <dependency>' +
                '      <groupId>group1</groupId>' +
                '      <artifactId>artifact1</artifactId>' +
                '      <version>1.0.0</version>' +
                '    </dependency>' +
                '  </dependencies>' +
                '</project>'
            ));

            const result = await (service as any).scanJavaDependencies(mockWorkspaceFolders[0].uri);

            expect(result).toEqual([]);  // No vulnerabilities in test environment
            expect(mockReadFile).toHaveBeenCalledWith(expect.objectContaining({
                fsPath: expect.stringContaining('pom.xml')
            }));
        });

        it('should handle missing pom.xml', async () => {
            mockReadFile.mockRejectedValueOnce(new Error('File not found'));

            const result = await (service as any).scanJavaDependencies(mockWorkspaceFolders[0].uri);

            expect(result).toEqual([]);
        });

        it('should handle malformed pom.xml', async () => {
            mockReadFile.mockResolvedValueOnce(Buffer.from('invalid xml'));

            const result = await (service as any).scanJavaDependencies(mockWorkspaceFolders[0].uri);

            expect(result).toEqual([]);
        });
    });

    describe('countTotalDependencies', () => {
        it('should count all dependencies correctly', async () => {
            // Mock package.json
            mockReadFile.mockResolvedValueOnce(Buffer.from(JSON.stringify({
                dependencies: { 'dep1': '1.0.0', 'dep2': '2.0.0' },
                devDependencies: { 'dev-dep1': '1.0.0' }
            })));

            // Mock requirements.txt
            mockReadFile.mockResolvedValueOnce(Buffer.from(
                'package1==1.0.0\npackage2==2.0.0\n# comment\npackage3==3.0.0'
            ));

            // Mock pom.xml
            mockReadFile.mockResolvedValueOnce(Buffer.from(
                '<project><dependencies><dependency></dependency><dependency></dependency></dependencies></project>'
            ));

            const total = await (service as any).countTotalDependencies();

            expect(total).toBe(8);  // 3 npm + 3 python + 2 maven
        });

        it('should handle missing files', async () => {
            mockReadFile.mockRejectedValue(new Error('File not found'));

            const total = await (service as any).countTotalDependencies();

            expect(total).toBe(0);
        });

        it('should return 0 when no workspace folders', async () => {
            (vscode.workspace.workspaceFolders as any) = undefined;

            const total = await (service as any).countTotalDependencies();

            expect(total).toBe(0);
        });
    });

    describe('vulnerability checks', () => {
        it('should check npm vulnerabilities', async () => {
            const vulns = await (service as any).checkNpmVulnerabilities('package', '1.0.0');
            expect(vulns).toEqual([]);
        });

        it('should check python vulnerabilities', async () => {
            const vulns = await (service as any).checkPythonVulnerabilities('package', '1.0.0');
            expect(vulns).toEqual([]);
        });

        it('should check maven vulnerabilities', async () => {
            const vulns = await (service as any).checkMavenVulnerabilities('group', 'artifact', '1.0.0');
            expect(vulns).toEqual([]);
        });
    });

    describe('dispose', () => {
        it('should dispose all disposables', () => {
            const mockDisposable = { dispose: jest.fn() };
            (service as any).disposables = [mockDisposable, mockDisposable];

            service.dispose();

            expect(mockDisposable.dispose).toHaveBeenCalledTimes(2);
        });
    });
});
