"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OperationParser = void 0;
const SubroutineManager_1 = require("./SubroutineManager");
const types_1 = require("./types");
class OperationParser {
    constructor() {
        this.operations = [];
    }
    parseOperationLine(line, stack, isAsync = false) {
        const subCall = line.startsWith(":>");
        const asyncCall = line.startsWith("$>");
        if (subCall || asyncCall) {
            const parts = line.slice(2).trim().split(/\s+/);
            const name = parts.shift();
            const args = parts.join(",");
            let kind = types_1.StackType.subroutine;
            if (asyncCall)
                kind = types_1.StackType.asyncSubroutine;
            if (!name) {
                throw new Error("Subroutine name is missing");
            }
            const operation = `${kind}:${name}:${args}`;
            stack.push(SubroutineManager_1.SubroutineManager.createOperationStackItem(operation));
            this.operations.push(operation);
        }
        else if (line.startsWith("<=")) {
            const operation = line;
            stack.push(SubroutineManager_1.SubroutineManager.createStackItem(types_1.StackType.assignment, operation.slice(2).trim()));
            this.operations.push(operation);
        }
        else {
            stack.push(SubroutineManager_1.SubroutineManager.createOperationStackItem(line));
            this.operations.push(line);
        }
    }
    // New method for chained operations
    chainOperation(operation) {
        this.operations.push(operation);
        return this;
    }
    parseOperation(operation) {
        let label = (t) => `${t}:`;
        const thdLabel = label(types_1.StackType.thread);
        const subLabel = label(types_1.StackType.subroutine);
        const asyLabel = label(types_1.StackType.asyncSubroutine);
        if (operation.startsWith(subLabel)) {
            return SubroutineManager_1.SubroutineManager.createStackItem(types_1.StackType.subroutine, operation.slice(subLabel.length));
        }
        else if (operation.startsWith(asyLabel)) {
            return SubroutineManager_1.SubroutineManager.createStackItem(types_1.StackType.asyncSubroutine, operation.slice(asyLabel.length));
        }
        else if (operation.startsWith(thdLabel)) {
            return SubroutineManager_1.SubroutineManager.createStackItem(types_1.StackType.thread, operation.slice(thdLabel.length));
        }
        else if (operation.startsWith("<=")) {
            return SubroutineManager_1.SubroutineManager.createStackItem(types_1.StackType.assignment, operation.slice(2).trim());
        }
        else {
            return SubroutineManager_1.SubroutineManager.createStackItem(types_1.StackType.general, operation);
        }
    }
    getOperations() {
        return this.operations;
    }
}
exports.OperationParser = OperationParser;
