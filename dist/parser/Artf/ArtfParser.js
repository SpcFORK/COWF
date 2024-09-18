"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArtfParser = void 0;
const VariableParser_1 = require("./VariableParser");
const OperationParser_1 = require("./OperationParser");
const SubroutineManager_1 = require("./SubroutineManager");
const CodeBlockExecutor_1 = require("./CodeBlockExecutor");
const types_1 = require("./types");
const cowcst_1 = require("cowcst");
class ArtfParser {
    constructor(ENV = cowcst_1.NOOP) {
        this.ENV = ENV;
        this.stack = [];
        this.fulfillments = {};
        this.variableParser = new VariableParser_1.VariableParser();
        this.operationParser = new OperationParser_1.OperationParser();
        this.subroutineManager = new SubroutineManager_1.SubroutineManager();
        this.codeBlockExecutor = new CodeBlockExecutor_1.CodeBlockExecutor();
    }
    parse(content) {
        this.preprocessSubroutines(content);
        const lines = content.trim().split("\n");
        let currentBlock;
        lines.forEach((line) => {
            const trimmedLine = line.trim();
            if (!trimmedLine)
                return;
            try {
                currentBlock = this.handleLine(trimmedLine, line, currentBlock);
            }
            catch (error) {
                console.error(`Error parsing line: ${trimmedLine}`);
                console.error(error);
                throw error;
            }
        });
        if (currentBlock) {
            this.handleLastBlock(currentBlock);
        }
        return {
            variables: this.variableParser.getVariables(),
            subroutines: this.subroutineManager.getAllSubroutines(),
            executableBlocks: this.codeBlockExecutor.getExecutableBlocks(),
            stack: this.stack,
        };
    }
    handleLine(trimmedLine, line, currentBlock) {
        if (this.isSubroutineLine(trimmedLine)) {
            this.subroutineManager.parseSubroutineDefinition(line);
        }
        else if (this.isVariableLine(trimmedLine)) {
            const variable = this.variableParser.parseVariable(trimmedLine);
            if (variable) {
                this.stack.push(variable);
            }
            else {
                throw new Error(`Failed to parse variable: ${trimmedLine}`);
            }
        }
        else if (this.isOperationLine(trimmedLine)) {
            this.operationParser.parseOperationLine(trimmedLine, this.stack);
        }
        else if (this.isExecutableBlockStart(trimmedLine)) {
            return this.parseExecBlock(trimmedLine);
        }
        else if (this.isExecutableBlockEnd(trimmedLine)) {
            if (currentBlock) {
                this.codeBlockExecutor.addExecutableBlock(currentBlock);
                return undefined;
            }
            else {
                throw new Error(`Ending block without a starting block: ${trimmedLine}`);
            }
        }
        else if (currentBlock) {
            currentBlock.code += line + "\n";
        }
        else if (this.isArithmeticOperation(trimmedLine)) {
            this.operationParser.parseOperationLine(trimmedLine, this.stack);
        }
        else if (this.isReturnLine(trimmedLine)) {
            this.stack.push(SubroutineManager_1.SubroutineManager.createReturnStackItem(trimmedLine.slice(3).trim()));
        }
        else if (this.isAssignmentLine(trimmedLine)) {
            this.stack.push(SubroutineManager_1.SubroutineManager.createAssignmentStackItem(trimmedLine.slice(3).trim()));
        }
        else {
            throw new Error(`Unknown format or invalid line: ${line}`);
        }
        return currentBlock;
    }
    async execute(content, language) {
        const parseResult = this.parse(content);
        let variables = { ...parseResult.variables };
        for (const [key, value] of Object.entries(variables)) {
            const stackItem = this.variableParser.updateVariables(key, value);
            this.stack.push(stackItem);
        }
        if (language) {
            parseResult.executableBlocks = parseResult.executableBlocks.filter((block) => block.language === language.toLowerCase());
        }
        for (const executableBlock of parseResult.executableBlocks) {
            await this.executeOperation(executableBlock.code, variables);
        }
        this.stack = await this.codeBlockExecutor.executeCodeBlocks(parseResult.executableBlocks, variables, this.stack);
        return this.stack.map((item) => [item.type, item.value]);
    }
    preprocessSubroutines(content) {
        const lines = content.trim().split("\n");
        let subroutineDefinition = "";
        let insideSubroutine = false;
        for (const line of lines) {
            const trimmedLine = line.trim();
            if (trimmedLine.startsWith("---")) {
                if (insideSubroutine) {
                    this.subroutineManager.parseSubroutineDefinition(subroutineDefinition);
                    subroutineDefinition = "";
                }
                insideSubroutine = true;
                subroutineDefinition += line + "\n";
            }
            else if (insideSubroutine) {
                if (trimmedLine === "---") {
                    insideSubroutine = false;
                    this.subroutineManager.parseSubroutineDefinition(subroutineDefinition);
                    subroutineDefinition = "";
                }
                else {
                    subroutineDefinition += line + "\n";
                }
            }
        }
        if (insideSubroutine) {
            this.subroutineManager.parseSubroutineDefinition(subroutineDefinition);
        }
    }
    // @@ Exec
    parseExecBlock(trimmedLine) {
        let [, language, name] = trimmedLine.match(/^==\s*(\w+)\s*(.*)/) || [];
        name || (name = this.operationParser.getOperations().length.toString());
        if (name.includes("<") || name.includes(">"))
            throw new Error(`Invalid executable block name: ${name}`);
        const stackRes = SubroutineManager_1.SubroutineManager.createSubroutine(false, false, name);
        if (name)
            this.stack.push(stackRes);
        return {
            name: name.trim(),
            language: language.toLowerCase().trim(),
            code: "",
            args: "",
        };
    }
    isSubroutineLine(trimmedLine) {
        return trimmedLine.startsWith("---") || trimmedLine === "---";
    }
    isVariableLine(trimmedLine) {
        return /^=[#.$\]]/.test(trimmedLine);
    }
    isOperationLine(trimmedLine) {
        return trimmedLine.startsWith(":>") || trimmedLine.startsWith("$>");
    }
    isExecutableBlockStart(trimmedLine) {
        return /^==\s*(\w+).+/.test(trimmedLine);
    }
    isExecutableBlockEnd(trimmedLine) {
        return trimmedLine === "==";
    }
    isArithmeticOperation(trimmedLine) {
        return /^[a-zA-Z0-9_]+\s*[\+\-\*\/]\s*[a-zA-Z0-9_]+$/.test(trimmedLine);
    }
    isReturnLine(trimmedLine) {
        return trimmedLine.startsWith("<< ");
    }
    isAssignmentLine(trimmedLine) {
        return trimmedLine.startsWith("<=");
    }
    handleLastBlock(block) {
        this.codeBlockExecutor.addExecutableBlock(block);
    }
    async executeOperation(operation, variables) {
        const op = this.operationParser.parseOperation(operation);
        switch (op.type) {
            case types_1.StackType.subroutine:
                await this.executeSubroutineCall(op.value, variables, false, false);
                break;
            case types_1.StackType.asyncSubroutine:
                await this.executeSubroutineCall(op.value, variables, true, false);
                break;
            case types_1.StackType.thread:
                await this.executeSubroutineCall(op.value, variables, true, false);
                break;
            case types_1.StackType.assignment:
                await this.executeAssignment(op.value, variables);
                break;
            case types_1.StackType.general:
                const result = await this.executeGeneralOperation(op.value, variables);
                this.fulfillments[op.value] = result; // Store the fulfillment
                this.stack.push(SubroutineManager_1.SubroutineManager.createOperationStackItem(result));
                break;
            default:
                console.warn(`Unknown operation type: ${op.type}`);
        }
    }
    async executeSubroutineCall(subroutineCall, variables, isAsync, isThread) {
        const [subroutineName, args] = subroutineCall.split(":");
        const subroutineArgs = args ? args.split(",") : [];
        // Ensure fulfillments are met
        for (let arg of subroutineArgs) {
            if (!this.fulfillments.hasOwnProperty(arg)) {
                throw new Error(`Missing fulfillment for argument: ${arg}`);
            }
        }
        const stackRes = SubroutineManager_1.SubroutineManager.createSubroutine(isAsync, isThread, subroutineName);
        if (subroutineName)
            this.stack.push(stackRes);
        const result = await this.subroutineManager.executeSubroutine(subroutineName, subroutineArgs.map((arg) => this.fulfillments[arg] || arg), // Use fulfilled args
        variables, isAsync, isThread);
        this.stack = this.stack.concat(result);
    }
    async executeAssignment(assignmentOp, variables) {
        const { varName, value } = this.variableParser.parseAssignment(assignmentOp);
        const executionResult = await this.codeBlockExecutor.executeCodeBlocks([
            SubroutineManager_1.SubroutineManager.createExecBlock(types_1.CoreBlocks.ExecAssig, "javascript", `${value};`),
        ], variables, this.stack);
        const parsedValue = this.variableParser.parseValue(executionResult[0].value);
        const stackItem = this.variableParser.updateVariables(varName, parsedValue);
        this.stack.push(stackItem);
        return parsedValue;
    }
    async executeGeneralOperation(operation, variables) {
        const executionResult = await this.codeBlockExecutor.executeCodeBlocks([
            SubroutineManager_1.SubroutineManager.createExecBlock(types_1.CoreBlocks.ExecGOp, "javascript", operation),
        ], variables, this.stack);
        return executionResult[0].value;
    }
}
exports.ArtfParser = ArtfParser;
