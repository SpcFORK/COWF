"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JSParser = void 0;
const cowcst_1 = require("cowcst");
const vm2_1 = require("vm2");
class JSParser {
    constructor(ENV = cowcst_1.NOOP) {
        var _a;
        this.ENV = ENV;
        (_a = ENV()).js || (_a.js = JSParser.createEnvScope());
    }
    static createEnvScope() {
        return {
            scope: "js",
            value: [],
        };
    }
    parse(content) {
        const vm = new vm2_1.VM({
            sandbox: this.ENV(),
        });
        return vm.run(content);
    }
}
exports.JSParser = JSParser;
