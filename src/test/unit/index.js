"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.run = run;
var path = require("path");
var Mocha = require("mocha");
var glob = require("glob");
function run() {
    // Create the mocha test
    var mocha = new Mocha({
        ui: 'tdd',
        color: true
    });
    var testsRoot = path.resolve(__dirname, '..');
    return new Promise(function (resolve, reject) {
        // Use promisify to convert callback-based glob to promise-based
        var globPromise = function (pattern, options) {
            return new Promise(function (resolveGlob, rejectGlob) {
                glob.default(pattern, options, function (err, matches) {
                    if (err) {
                        rejectGlob(err);
                    }
                    else {
                        resolveGlob(matches);
                    }
                });
            });
        };
        globPromise('**/**.test.js', { cwd: testsRoot })
            .then(function (files) {
            // Add files to the test suite
            files.forEach(function (f) { return mocha.addFile(path.resolve(testsRoot, f)); });
            try {
                // Run the mocha test
                mocha.run(function (failures) {
                    if (failures > 0) {
                        reject(new Error("".concat(failures, " tests failed.")));
                    }
                    else {
                        resolve();
                    }
                });
            }
            catch (err) {
                console.error(err);
                reject(err);
            }
        })
            .catch(function (err) {
            reject(err);
        });
    });
}
