"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubroutineManager = void 0;
const types_1 = require("./types");
const VariableParser_1 = require("./VariableParser");
const OperationParser_1 = require("./OperationParser");
const CodeBlockExecutor_1 = require("./CodeBlockExecutor");
class SubroutineManager {
    constructor() {
        this.stack = [];
        this.maxRecursionDepth = 100;
        this.subroutines = {};
        this.variableParser = new VariableParser_1.VariableParser();
        this.operationParser = new OperationParser_1.OperationParser();
        this.codeBlockExecutor = new CodeBlockExecutor_1.CodeBlockExecutor(undefined, this);
    }
    static createSubroutine(isAsync, isThread, subroutineName) {
        switch (true) {
            case isThread:
                return this.createStackItem(types_1.StackType.thread, subroutineName);
            case isAsync:
                return this.createStackItem(types_1.StackType.asyncSubroutine, subroutineName);
            default:
                return this.createStackItem(types_1.StackType.subroutine, subroutineName);
        }
    }
    static createExecBlock(name, language, code, args = "") {
        return { name, args, language, code };
    }
    static createStackItem(type, value) {
        return { type, value };
    }
    static createVariableStackItem(name, value) {
        return this.createStackItem(types_1.StackType.variable, `${name} = ${JSON.stringify(value)}`);
    }
    static createReturnStackItem(value) {
        return this.createStackItem(types_1.StackType.return, value);
    }
    static createOperationStackItem(value) {
        return this.createStackItem(types_1.StackType.operation, value);
    }
    static createCodeBlock(value) {
        return this.createStackItem(types_1.StackType.code_block, value);
    }
    static createAssignmentStackItem(value) {
        return this.createStackItem(types_1.StackType.assignment, value);
    }
    parseSubroutineDefinition(definition) {
        const lines = definition.trim().split("\n");
        let i = 0;
        while (i < lines.length) {
            const header = lines[i].trim();
            if (!header.startsWith("---")) {
                i++;
                continue;
            }
            if (header === "---") {
                i++;
                continue;
            }
            const isAsync = header.startsWith("--- $");
            const isThread = header.startsWith("--- ^");
            const headerContent = header.slice(isAsync || isThread ? 5 : 3).trim();
            if (!headerContent) {
                throw new Error("Subroutine name is missing in definition");
            }
            const parts = headerContent.split(/\s+/);
            if (parts.length === 0 || !parts[0]) {
                throw new Error("Subroutine name is missing in definition");
            }
            const name = parts.shift();
            const params = parts.map((param) => {
                const [paramName, defaultValue] = param.split("=");
                return { name: paramName, default: defaultValue };
            });
            this.subroutines[name] = {
                language: "artf",
                code: "",
                params,
                isAsync,
                isThread,
            };
            // Parse Content of Subroutine
            i++;
            while (i < lines.length) {
                const trimmedLine = lines[i].trim();
                if (trimmedLine === "---") {
                    i++;
                    break; // End current subroutine
                }
                if (trimmedLine.startsWith("-->")) {
                    const singleLineRoutine = trimmedLine.slice(3).trim();
                    if (!singleLineRoutine) {
                        if (i + 1 < lines.length && lines[i + 1].trim()) {
                            this.addSingleLineRoutine(name, lines[++i].trim());
                        }
                        else {
                            throw new Error("Single line routine is missing code.");
                        }
                    }
                    else {
                        this.addSingleLineRoutine(name, singleLineRoutine);
                    }
                }
                else if (trimmedLine && !trimmedLine.startsWith("---")) {
                    this.addLineToSubroutine(name, trimmedLine);
                }
                i++;
            }
        }
    }
    addLineToSubroutine(subroutineName, line) {
        const subroutine = this.subroutines[subroutineName];
        if (!subroutine) {
            throw new Error(`Subroutine '${subroutineName}' not found`);
        }
        subroutine.code += line + "\n";
    }
    addSingleLineRoutine(subroutineName, line) {
        this.addLineToSubroutine(subroutineName, `<= ${line}`);
    }
    async executeSubroutine(name, args, variables, isAsync, isThread) {
        const subroutine = this.getSubroutine(name);
        if (!subroutine) {
            throw new Error(`Subroutine '${name}' not found`);
        }
        const localVariables = { ...variables };
        const stack = [];
        // Assign arguments to parameters
        subroutine.params.forEach((param, index) => {
            const value = index < args.length ? args[index] : param.default;
            if (value === undefined) {
                throw new Error(`Missing argument for parameter '${param.name}' in subroutine '${name}'`);
            }
            localVariables[param.name] = value;
            stack.push(SubroutineManager.createVariableStackItem(param.name, value));
        });
        const lines = subroutine.code.split("\n");
        async function doOrWait(cb) {
            if (isAsync)
                return await cb();
            else if (isThread)
                // Run as a thread
                return new Promise((res) => setTimeout(async () => res(await cb())));
            else
                return cb();
        }
        for (const line of lines) {
            const operation = this.operationParser.parseOperation(line.trim());
            stack.push(operation);
        }
        // Handle each operation on the stack
        while (stack.length > 0) {
            const operation = stack.pop();
            if (!operation)
                continue;
            switch (operation.type) {
                case types_1.StackType.subroutine:
                case types_1.StackType.asyncSubroutine:
                case types_1.StackType.thread:
                    const nestedResult = await doOrWait(() => this.executeSubroutineCall(operation.value, localVariables, operation.type === types_1.StackType.asyncSubroutine, operation.type === types_1.StackType.thread));
                    stack.push(...nestedResult);
                    break;
                case types_1.StackType.assignment:
                    const assignmentResult = await doOrWait(() => this.executeAssignment(operation.value, localVariables));
                    stack.push(SubroutineManager.createVariableStackItem(operation.value, assignmentResult));
                    break;
                case types_1.StackType.general:
                    const generalResult = await doOrWait(() => this.executeGeneralOperation(operation.value, localVariables));
                    stack.push(SubroutineManager.createOperationStackItem(generalResult));
                    break;
                case types_1.StackType.return:
                    stack.push(SubroutineManager.createReturnStackItem(operation.value));
                    return stack;
                default:
                    console.warn(`Unknown operation type: ${operation.type}`);
            }
        }
        return stack;
    }
    async executeSubroutineCall(subroutineCall, variables, isAsync, isThread) {
        const [subroutineName, args] = subroutineCall.split(":");
        const subroutineArgs = args ? args.split(",") : [];
        const stackRes = SubroutineManager.createSubroutine(isAsync, isThread, subroutineName);
        if (stackRes)
            this.stack.push(stackRes);
        const result = await this.executeSubroutine(subroutineName, subroutineArgs, variables, isAsync, isThread);
        return result;
    }
    async executeAssignment(assignmentOp, variables) {
        const [varName, ...expression] = assignmentOp.split(" ");
        const [executionResult] = await this.codeBlockExecutor.executeCodeBlocks([
            SubroutineManager.createExecBlock(types_1.CoreBlocks.Assignment, "javascript", expression.join(" ")),
        ], variables, this.stack);
        const value = this.variableParser.parseValue(executionResult.value);
        this.variableParser.updateVariables(varName, value);
        return value;
    }
    async executeGeneralOperation(operation, variables) {
        const executionResult = await this.codeBlockExecutor.executeCodeBlocks([
            SubroutineManager.createExecBlock(types_1.CoreBlocks.ExecGOp, "javascript", operation),
        ], variables, this.stack);
        return executionResult[0].value;
    }
    getSubroutineName(line) {
        return line.slice(3).trim().split(" ")[0];
    }
    getSubroutine(name) {
        return this.subroutines[name];
    }
    getAllSubroutines() {
        return { ...this.subroutines };
    }
}
exports.SubroutineManager = SubroutineManager;
