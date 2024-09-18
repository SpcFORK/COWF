"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createErrorNS = exports.createError = exports.CowError = void 0;
class CowError extends Error {
    constructor(message) {
        super(message);
        this.name = "CowError";
    }
    logError() {
        console.error(this);
    }
    throwError() {
        throw this;
    }
}
exports.CowError = CowError;
const createError = (fnName, msg, node) => {
    const error = new CowError(`${fnName}: ${msg}`);
    error.stack = `Node at: ${node.index}:${node.thisReg}-${node.nextReg}\n- CSM`;
    error.cause = `Node at: ${node.index}:${node.thisReg}-${node.nextReg}\n- CSM`;
    error.name = "CowSM-Error";
    return error.throwError();
};
exports.createError = createError;
const createErrorNS = (fnName, node) => (msg) => (0, exports.createError)(fnName, msg, node);
exports.createErrorNS = createErrorNS;
