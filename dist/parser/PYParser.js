"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PYParser = void 0;
const cowcst_1 = require("cowcst");
const python_shell_1 = require("python-shell");
class PYParser {
    constructor(ENV = cowcst_1.NOOP) {
        var _a;
        this.ENV = ENV;
        (_a = ENV()).py || (_a.py = PYParser.createEnvScope());
    }
    static createEnvScope() {
        return {
            scope: "py",
            value: []
        };
    }
    async parse(content) {
        try {
            const results = await this.runPythonShell(content, this.ENV());
            return results ? results.join("\n") : "";
        }
        catch (err) {
            throw err;
        }
    }
    runPythonShell(content, env) {
        return new Promise((resolve, reject) => python_shell_1.PythonShell.runString(content, { env }, (err, results) => this.handleEnv(err, reject, resolve, results)));
    }
    handleEnv(err, reject, resolve, results) {
        if (err)
            reject(err);
        else
            resolve(results || []);
    }
}
exports.PYParser = PYParser;
