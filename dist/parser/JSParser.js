"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JSParser = void 0;
const cowcst_1 = require("cowcst");
const vm2_1 = require("vm2");
class JSParser {
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
        return ((_a = this.ENV()).js || (_a.js = JSParser.createEnvScope()));
    }
    pushToScope(content) {
        this.setupScope().value.push(content);
        return content;
    }
    parse(content) {
        const vm = new vm2_1.VM({
            sandbox: this.makeSandbox(),
        });
        return this.pushToScope({
            format: "result",
            content: vm.run(content) || this.setupScope(),
        });
    }
    pushVar(v) {
        this.setupScope().value.push({
            format: "variable",
            content: v,
        });
    }
    makeSandbox() {
        return {
            COWF_env: this.ENV.bind(this),
            COWF_JS_env: this.setupScope.bind(this),
            pushToScope: this.pushToScope.bind(this),
            pushVar: this.pushVar.bind(this),
        };
    }
}
exports.JSParser = JSParser;
JSParser.ext = "jsf";
