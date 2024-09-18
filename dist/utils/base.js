"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createResult = exports.createResultBase = void 0;
function createResultBase({ format = "none", content = Array.from(arguments), }) {
    return { format, content };
}
exports.createResultBase = createResultBase;
function createResult(format, content) {
    return createResultBase({ format, content });
}
exports.createResult = createResult;
