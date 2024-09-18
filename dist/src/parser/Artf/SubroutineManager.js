import { VariableParser } from "./VariableParser";
import { OperationParser } from "./OperationParser";
import { CodeBlockExecutor } from "./CodeBlockExecutor";
export class SubroutineManager {
    constructor() {
        this.subroutines = {};
        this.maxRecursionDepth = 100;
        this.variableParser = new VariableParser();
        this.operationParser = new OperationParser();
        this.codeBlockExecutor = new CodeBlockExecutor();
    }
    parseSubroutineDefinition(line) {
        const isAsync = line.startsWith("--- $");
        const [_, name, ...paramParts] = line.slice(isAsync ? 5 : 3).trim().split(" ");
        const params = paramParts.map(param => {
            const [paramName, defaultValue] = param.split("=");
            return { name: paramName, default: defaultValue };
        });
        this.subroutines[name] = { params, code: "", isAsync };
    }
    getSubroutineName(line) {
        return line.slice(3).trim().split(" ")[0];
    }
    addLineToSubroutine(subroutineName, line) {
        const subroutine = this.subroutines[subroutineName];
        if (!subroutine) {
            throw new Error(`Subroutine '${subroutineName}' not found`);
        }
        subroutine.code += line + "\n";
    }
    addSingleLineRoutine(subroutineName, line) {
        const subroutine = this.subroutines[subroutineName];
        if (!subroutine) {
            throw new Error(`Subroutine '${subroutineName}' not found`);
        }
        subroutine.code += `<= ${line}\n`;
    }
    getSubroutine(name) {
        return this.subroutines[name];
    }
    getAllSubroutines() {
        return { ...this.subroutines };
    }
    async executeSubroutine(name, args, variables, isAsync, recursionDepth = 0) {
        if (recursionDepth > this.maxRecursionDepth) {
            throw new Error(`Maximum recursion depth exceeded (${this.maxRecursionDepth}) for subroutine '${name}'`);
        }
        const subroutine = this.getSubroutine(name);
        if (!subroutine) {
            throw new Error(`Subroutine '${name}' not found`);
        }
        if (subroutine.isAsync !== isAsync) {
            throw new Error(`Subroutine '${name}' is ${subroutine.isAsync ? 'async' : 'sync'} but was called as ${isAsync ? 'async' : 'sync'}`);
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
            stack.push({ type: 'variable', value: `${param.name} = ${JSON.stringify(value)}` });
        });
        // Execute subroutine code
        const lines = subroutine.code.split('\n');
        for (const line of lines) {
            const trimmedLine = line.trim();
            if (trimmedLine.startsWith('<<')) {
                // Handle return statement
                const returnValue = trimmedLine.slice(2).trim();
                const executionResult = await this.codeBlockExecutor.executeCodeBlocks([{ language: "javascript", code: returnValue }], localVariables);
                stack.push({ type: 'return', value: executionResult[0].value });
                return stack;
            }
            else if (trimmedLine.startsWith(':>') || trimmedLine.startsWith('$>')) {
                // Handle nested subroutine call
                const isNestedAsync = trimmedLine.startsWith('$>');
                const [_, nestedName, ...nestedArgs] = trimmedLine.slice(2).split(' ');
                const nestedResult = await this.executeSubroutine(nestedName, nestedArgs.map(arg => localVariables[arg] || arg), localVariables, isNestedAsync, recursionDepth + 1);
                stack.push(...nestedResult);
            }
            else if (trimmedLine.startsWith('<=')) {
                // Handle assignment
                const assignmentOp = trimmedLine.slice(2).trim();
                const [varName, ...expression] = assignmentOp.split(' ');
                const executionResult = await this.codeBlockExecutor.executeCodeBlocks([{ language: "javascript", code: `${expression.join(' ')};` }], localVariables);
                const stackItem = this.variableParser.updateVariables(varName, this.variableParser.parseValue(executionResult[0].value));
                localVariables[varName] = stackItem.value;
                stack.push(stackItem);
            }
            else if (trimmedLine !== '' && !trimmedLine.startsWith('!')) {
                // Handle general operation
                const executionResult = await this.codeBlockExecutor.executeCodeBlocks([{ language: "javascript", code: trimmedLine }], localVariables);
                stack.push({ type: 'operation', value: executionResult[0].value });
            }
        }
        return stack;
    }
}
