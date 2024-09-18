"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PYParser = void 0;
const cowcst_1 = require("cowcst");
const python_shell_1 = require("python-shell");
class PYParser {
    constructor(ENV = cowcst_1.NOOP) {
        this.ENV = ENV;
        this.setupScope();
    }
    static createEnvScope() {
        return {
            scope: this.ext,
            value: [],
        };
    }
    setupScope() {
        var _a;
        return ((_a = this.ENV()).py || (_a.py = PYParser.createEnvScope()));
    }
    pushToScope(content) {
        this.setupScope().value.push(content);
        return content;
    }
    parse(content) {
        try {
            const results = this.runPythonShell(content, this.ENV());
            return this.pushToScope({
                format: "result",
                content: results.then((t) => (t ? t.join("\n") : "")),
            });
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
PYParser.ext = "pyf";
