"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CowSM = void 0;
const COWS_scope_1 = require("./COWS_scope");
const COWS_node_1 = require("./COWS_node");
class CowSM {
    constructor() {
        this.stack = [];
        this.i = 0;
    }
    createInstruction(code, thisReg, nextReg) {
        return new COWS_node_1.CowNode(code, thisReg, nextReg, this.stack);
    }
    load(stack) {
        if (!Array.isArray(stack[0])) {
            for (const node of stack) {
                this.createInstruction(node.code, node.thisReg, node.nextReg);
            }
        }
        else {
            for (const [code, thisReg, nextReg] of stack) {
                this.createInstruction(code, thisReg, nextReg);
            }
        }
        return this.stack;
    }
    run() {
        const stackClone = this.stack.slice();
        const scope = new COWS_scope_1.CowScope("global", stackClone);
        if (!stackClone.length)
            return;
        return this.iterateAndRun(stackClone, scope);
    }
    iterateAndRun(stackClone, scope, node = stackClone[0]) {
        let currentNode = node;
        while (currentNode) {
            this.executeInstruction(scope, currentNode);
            currentNode = currentNode.next;
        }
        return scope.bucket[scope.bucket.length - 1];
    }
    executeInstruction(scope, instr, t = this) {
        const [name, ...rest] = instr.code.split(/\b/);
        const variable = scope.values.get(name);
        if (variable)
            this.invokeMethod(variable, rest, scope, instr, t);
        else
            throw new Error(`Instruction ${name} not found`);
    }
    invokeMethod(method, rest, scope, instr, t) {
        const methodType = typeof method;
        if (methodType === "function")
            return method(rest, scope, instr, t);
        this.pushToScope(method, rest, scope);
    }
    pushToScope(value, rest, scope) {
        let currentValue = value;
        const isNotSpace = (s) => s.trim().length > 0;
        if (typeof value === "object") {
            for (const item of rest) {
                if (item in value && isNotSpace(item)) {
                    currentValue = value[item];
                }
            }
        }
        scope.bucket.push(currentValue);
    }
}
exports.CowSM = CowSM;
