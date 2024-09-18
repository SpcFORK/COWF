import { VariableParser } from "./VariableParser";
import { OperationParser } from "./OperationParser";
import { SubroutineManager } from "./SubroutineManager";
import { CodeBlockExecutor } from "./CodeBlockExecutor";
export class ArtfParser {
    constructor() {
        this.stack = [];
        this.variableParser = new VariableParser();
        this.operationParser = new OperationParser();
        this.subroutineManager = new SubroutineManager();
        this.codeBlockExecutor = new CodeBlockExecutor();
    }
    parse(content) {
        const lines = content.trim().split("\n");
        let currentSubroutine = undefined;
        let currentExecutableBlock = undefined;
        let insideSubroutine = false;
        let isAsyncSubroutine = false;
        for (const line of lines) {
            const trimmedLine = line.trim();
            try {
                ({
                    currentSubroutine,
                    insideSubroutine,
                    currentExecutableBlock,
                    isAsyncSubroutine,
                } = this.handleLine(trimmedLine, currentSubroutine, insideSubroutine, currentExecutableBlock, line, isAsyncSubroutine));
            }
            catch (error) {
                console.error(`Error parsing line: ${trimmedLine}`);
                console.error(error);
                throw error;
            }
        }
        // Add the last executable block if it exists
        if (currentExecutableBlock) {
            this.codeBlockExecutor.addExecutableBlock(currentExecutableBlock);
        }
        return {
            format: "artf",
            content: {
                variables: this.variableParser.getVariables(),
                operations: this.operationParser.getOperations(),
                subroutines: this.subroutineManager.getAllSubroutines(),
                executableBlocks: this.codeBlockExecutor.getExecutableBlocks(),
            },
        };
    }
    handleLine(trimmedLine, currentSubroutine, insideSubroutine, currentExecutableBlock, line, isAsyncSubroutine) {
        switch (true) {
            case trimmedLine.startsWith("--- $"):
            case trimmedLine.startsWith("---"):
                this.subroutineManager.parseSubroutineDefinition(trimmedLine);
                currentSubroutine =
                    this.subroutineManager.getSubroutineName(trimmedLine);
                insideSubroutine = true;
                isAsyncSubroutine = trimmedLine.startsWith("--- $");
                break;
            case trimmedLine === "@@":
                currentSubroutine = undefined;
                insideSubroutine = false;
                isAsyncSubroutine = false;
                break;
            case insideSubroutine && currentSubroutine !== undefined:
                if (trimmedLine.startsWith("-->")) {
                    this.subroutineManager.addSingleLineRoutine(currentSubroutine, trimmedLine.slice(3).trim());
                }
                else {
                    this.subroutineManager.addLineToSubroutine(currentSubroutine, trimmedLine);
                }
                break;
            case trimmedLine.startsWith("=="):
                if (currentExecutableBlock) {
                    this.codeBlockExecutor.addExecutableBlock(currentExecutableBlock);
                }
                currentExecutableBlock = {
                    language: trimmedLine.slice(2).trim(),
                    code: "",
                };
                break;
            case currentExecutableBlock !== undefined:
                currentExecutableBlock.code += line + "\n";
                break;
            case trimmedLine.startsWith("=#") ||
                trimmedLine.startsWith("=.") ||
                trimmedLine.startsWith("=$") ||
                trimmedLine.startsWith("=]"):
                this.variableParser.parseVariable(trimmedLine);
                break;
            case trimmedLine.startsWith(":>"):
                this.operationParser.parseOperationLine(trimmedLine, false);
                break;
            case trimmedLine.startsWith("$>"):
                this.operationParser.parseOperationLine(trimmedLine, true);
                break;
            default:
                if (trimmedLine !== "" && !trimmedLine.startsWith("!")) {
                    this.operationParser.parseOperationLine(trimmedLine);
                }
        }
        return {
            currentSubroutine,
            insideSubroutine,
            currentExecutableBlock,
            isAsyncSubroutine,
        };
    }
    async execute(content, language) {
        const parseResult = this.parse(content);
        let variables = { ...parseResult.content.variables };
        this.stack = [];
        for (const [key, value] of Object.entries(variables)) {
            const stackItem = this.variableParser.updateVariables(key, value);
            this.stack.push(stackItem);
        }
        for (const operation of parseResult.content.operations) {
            await this.executeOperation(operation, variables);
        }
        if (language && parseResult.content.executableBlocks.length > 0) {
            const languageBlocks = parseResult.content.executableBlocks.filter((block) => block.language.toLowerCase() === language.toLowerCase());
            const blockResults = await this.codeBlockExecutor.executeCodeBlocks(languageBlocks, variables);
            this.stack = this.stack.concat(blockResults);
        }
        return this.stack.map((item) => [item.type, item.value]);
    }
    async executeOperation(operation, variables) {
        const op = this.operationParser.parseOperation(operation);
        try {
            switch (op.type) {
                case "subroutine":
                    return await this.executeSubroutineCall(op.value, variables, false);
                case "asyncSubroutine":
                    return await this.executeSubroutineCall(op.value, variables, true);
                case "assignment":
                    return await this.executeAssignment(op.value, variables);
                case "general":
                    return await this.executeGeneralOperation(op.value, variables);
                default:
                    throw new Error(`Unknown operation type: ${op.type}`);
            }
        }
        catch (error) {
            console.error(`Error executing operation: ${operation}`);
            console.error(error);
            throw error;
        }
    }
    async executeSubroutineCall(subroutineCall, variables, isAsync) {
        const [subroutineName, args] = subroutineCall.split(":");
        const subroutineArgs = args ? args.split(",") : [];
        this.stack.push({
            type: isAsync ? "asyncSubroutine" : "subroutine",
            value: `Executing ${isAsync ? "async " : ""}subroutine: ${subroutineName}`,
        });
        const result = await this.subroutineManager.executeSubroutine(subroutineName, subroutineArgs, variables, isAsync, 0);
        this.stack.push(...result);
        return result[result.length - 1].value;
    }
    async executeAssignment(assignmentOp, variables) {
        const [varName, ...expression] = assignmentOp.split(" ");
        const executionResult = await this.codeBlockExecutor.executeCodeBlocks([{ language: "javascript", code: `${expression.join(" ")};` }], variables);
        const stackItem = this.variableParser.updateVariables(varName, this.variableParser.parseValue(executionResult[0].value));
        this.stack.push(stackItem);
        return executionResult[0].value;
    }
    async executeGeneralOperation(operation, variables) {
        const executionResult = await this.codeBlockExecutor.executeCodeBlocks([{ language: "javascript", code: operation }], variables);
        return executionResult[0].value;
    }
}
