"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CtxtParser = void 0;
const cowcst_1 = require("cowcst");
class CtxtParser {
    constructor(ENV = cowcst_1.NOOP) {
        var _a;
        this.ENV = ENV;
        (_a = ENV()).ctxt || (_a.ctxt = CtxtParser.createEnvScope());
    }
    static createEnvScope() {
        return {
            scope: "ctxt",
            value: [],
        };
    }
    parse(content) {
        const lines = content.trim().split("\n");
        const body = lines.join("\n");
        return {
            format: "txt",
            content: body,
        };
    }
}
exports.CtxtParser = CtxtParser;
