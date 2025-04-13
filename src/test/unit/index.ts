import * as path from 'path';
import * as Mocha from 'mocha';
import * as glob from 'glob';

export function run(): Promise<void> {
  // Create the mocha test
  const mocha = new (Mocha as any)({
    ui: 'tdd',
    color: true
  });

  const testsRoot = path.resolve(__dirname, '..');

  return new Promise<void>((resolve, reject) => {
    // Use promisify to convert callback-based glob to promise-based
    const globPromise = (pattern: string, options: glob.IOptions): Promise<string[]> => {
      return new Promise((resolveGlob, rejectGlob) => {
        glob.default(pattern, options, (err, matches) => {
          if (err) {
            rejectGlob(err);
          } else {
            resolveGlob(matches);
          }
        });
      });
    };

    globPromise('**/**.test.js', { cwd: testsRoot })
      .then(files => {
        // Add files to the test suite
        files.forEach(f => mocha.addFile(path.resolve(testsRoot, f)));

        try {
          // Run the mocha test
          mocha.run((failures: number): void => {
            if (failures > 0) {
              reject(new Error(`${failures} tests failed.`));
            } else {
              resolve();
            }
          });
        } catch (err) {
          console.error(err);
          reject(err);
        }
      })
      .catch(err => {
        reject(err);
      });
  });
}