"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CtxtParser = void 0;
const cowcst_1 = require("cowcst");
class CtxtParser {
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
        return ((_a = this.ENV()).ctxt || (_a.ctxt = CtxtParser.createEnvScope()));
    }
    pushToScope(content) {
        this.setupScope().value.push(content);
        return content;
    }
    parse(content) {
        const lines = content.trim().split("\n");
        const body = lines.join("\n");
        return this.pushToScope({
            format: CtxtParser.ext,
            content: body,
        });
    }
}
exports.CtxtParser = CtxtParser;
CtxtParser.ext = "ctxt";
