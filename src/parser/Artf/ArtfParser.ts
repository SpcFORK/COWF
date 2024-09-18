import { VariableParser } from "./VariableParser";
import { OperationParser } from "./OperationParser";
import { SubroutineManager } from "./SubroutineManager";
import { CodeBlockExecutor } from "./CodeBlockExecutor";
import {
  StackItem,
  Block,
  Subroutine,
  ExecutableBlock,
  StackType,
  CoreBlocks,
} from "./types";
import { NOOP } from "cowcst";

export interface ArtfContent {
  variables: Record<string, any>;
  subroutines: Record<string, Subroutine>;
  executableBlocks: Block[];
  stack: StackItem[];
}

export class ArtfParser {
  private variableParser: VariableParser;
  private operationParser: OperationParser;
  private subroutineManager: SubroutineManager;
  private codeBlockExecutor: CodeBlockExecutor;
  private stack: StackItem[] = [];
  private fulfillments: Record<string, any> = {};

  constructor(public ENV: () => Record<string, any> = NOOP) {
    this.variableParser = new VariableParser();
    this.operationParser = new OperationParser();
    this.subroutineManager = new SubroutineManager();
    this.codeBlockExecutor = new CodeBlockExecutor();
  }

  parse(content: string): ArtfContent {
    this.preprocessSubroutines(content);
    const lines = content.trim().split("\n");
    let currentBlock: Block | undefined;

    lines.forEach((line) => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return;
      try {
        currentBlock = this.handleLine(trimmedLine, line, currentBlock);
      } catch (error) {
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

  private handleLine(
    trimmedLine: string,
    line: string,
    currentBlock: ExecutableBlock | undefined,
  ): ExecutableBlock | undefined {
    if (this.isSubroutineLine(trimmedLine)) {
      this.subroutineManager.parseSubroutineDefinition(line);
    } else if (this.isVariableLine(trimmedLine)) {
      const variable = this.variableParser.parseVariable(trimmedLine);
      if (variable) {
        this.stack.push(variable);
      } else {
        throw new Error(`Failed to parse variable: ${trimmedLine}`);
      }
    } else if (this.isOperationLine(trimmedLine)) {
      this.operationParser.parseOperationLine(trimmedLine, this.stack);
    } else if (this.isExecutableBlockStart(trimmedLine)) {
      return this.parseExecBlock(trimmedLine);
    } else if (this.isExecutableBlockEnd(trimmedLine)) {
      if (currentBlock) {
        this.codeBlockExecutor.addExecutableBlock(currentBlock);
        return undefined;
      } else {
        throw new Error(
          `Ending block without a starting block: ${trimmedLine}`,
        );
      }
    } else if (currentBlock) {
      currentBlock.code += line + "\n";
    } else if (this.isArithmeticOperation(trimmedLine)) {
      this.operationParser.parseOperationLine(trimmedLine, this.stack);
    } else if (this.isReturnLine(trimmedLine)) {
      this.stack.push(
        SubroutineManager.createReturnStackItem(trimmedLine.slice(3).trim()),
      );
    } else if (this.isAssignmentLine(trimmedLine)) {
      this.stack.push(
        SubroutineManager.createAssignmentStackItem(
          trimmedLine.slice(3).trim(),
        ),
      );
    } else {
      throw new Error(`Unknown format or invalid line: ${line}`);
    }
    return currentBlock;
  }

  async execute(
    content: string,
    language?: string,
  ): Promise<[StackType, string][]> {
    const parseResult = this.parse(content);
    let variables = { ...parseResult.variables };

    for (const [key, value] of Object.entries(variables)) {
      const stackItem = this.variableParser.updateVariables(key, value);
      this.stack.push(stackItem);
    }

    if (language) {
      parseResult.executableBlocks = parseResult.executableBlocks.filter(
        (block) => block.language === language.toLowerCase(),
      );
    }

    for (const executableBlock of parseResult.executableBlocks) {
      await this.executeOperation(executableBlock.code, variables);
    }

    this.stack = await this.codeBlockExecutor.executeCodeBlocks(
      parseResult.executableBlocks,
      variables,
      this.stack,
    );

    return this.stack.map((item) => [item.type, item.value]);
  }

  private preprocessSubroutines(content: string): void {
    const lines = content.trim().split("\n");
    let subroutineDefinition = "";
    let insideSubroutine = false;

    for (const line of lines) {
      const trimmedLine = line.trim();

      if (trimmedLine.startsWith("---")) {
        if (insideSubroutine) {
          this.subroutineManager.parseSubroutineDefinition(
            subroutineDefinition,
          );
          subroutineDefinition = "";
        }
        insideSubroutine = true;
        subroutineDefinition += line + "\n";
      } else if (insideSubroutine) {
        if (trimmedLine === "---") {
          insideSubroutine = false;
          this.subroutineManager.parseSubroutineDefinition(
            subroutineDefinition,
          );
          subroutineDefinition = "";
        } else {
          subroutineDefinition += line + "\n";
        }
      }
    }

    if (insideSubroutine) {
      this.subroutineManager.parseSubroutineDefinition(subroutineDefinition);
    }
  }

  // @@ Exec
  private parseExecBlock(trimmedLine: string) {
    let [, language, name] = trimmedLine.match(/^==\s*(\w+)\s*(.*)/) || [];

    name ||= this.operationParser.getOperations().length.toString();

    if (name.includes("<") || name.includes(">"))
      throw new Error(`Invalid executable block name: ${name}`);

    const stackRes = SubroutineManager.createSubroutine(false, false, name);
    if (name) this.stack.push(stackRes);

    return <ExecutableBlock>{
      name: name.trim(),
      language: language.toLowerCase().trim(),
      code: "",
      args: "",
    };
  }

  private isSubroutineLine(trimmedLine: string): boolean {
    return trimmedLine.startsWith("---") || trimmedLine === "---";
  }

  private isVariableLine(trimmedLine: string): boolean {
    return /^=[#.$\]]/.test(trimmedLine);
  }

  private isOperationLine(trimmedLine: string): boolean {
    return trimmedLine.startsWith(":>") || trimmedLine.startsWith("$>");
  }

  private isExecutableBlockStart(trimmedLine: string): boolean {
    return /^==\s*(\w+).+/.test(trimmedLine);
  }

  private isExecutableBlockEnd(trimmedLine: string): boolean {
    return trimmedLine === "==";
  }

  private isArithmeticOperation(trimmedLine: string): boolean {
    return /^[a-zA-Z0-9_]+\s*[\+\-\*\/]\s*[a-zA-Z0-9_]+$/.test(trimmedLine);
  }

  private isReturnLine(trimmedLine: string): boolean {
    return trimmedLine.startsWith("<< ");
  }

  private isAssignmentLine(trimmedLine: string): boolean {
    return trimmedLine.startsWith("<=");
  }

  private handleLastBlock(block: Block): void {
    this.codeBlockExecutor.addExecutableBlock(block as ExecutableBlock);
  }

  private async executeOperation(
    operation: string,
    variables: Record<string, any>,
  ): Promise<void> {
    const op = this.operationParser.parseOperation(operation);
    switch (op.type) {
      case StackType.subroutine:
        await this.executeSubroutineCall(op.value, variables, false, false);
        break;
      case StackType.asyncSubroutine:
        await this.executeSubroutineCall(op.value, variables, true, false);
        break;
      case StackType.thread:
        await this.executeSubroutineCall(op.value, variables, true, false);
        break;
      case StackType.assignment:
        await this.executeAssignment(op.value, variables);
        break;
      case StackType.general:
        const result = await this.executeGeneralOperation(op.value, variables);
        this.fulfillments[op.value] = result; // Store the fulfillment
        this.stack.push(SubroutineManager.createOperationStackItem(result));
        break;
      default:
        console.warn(`Unknown operation type: ${op.type}`);
    }
  }

  private async executeSubroutineCall(
    subroutineCall: string,
    variables: Record<string, any>,
    isAsync: boolean,
    isThread: boolean,
  ): Promise<void> {
    const [subroutineName, args] = subroutineCall.split(":");
    const subroutineArgs = args ? args.split(",") : [];
    // Ensure fulfillments are met
    for (let arg of subroutineArgs) {
      if (!this.fulfillments.hasOwnProperty(arg)) {
        throw new Error(`Missing fulfillment for argument: ${arg}`);
      }
    }
    const stackRes = SubroutineManager.createSubroutine(
      isAsync,
      isThread,
      subroutineName,
    );
    if (subroutineName) this.stack.push(stackRes);
    const result = await this.subroutineManager.executeSubroutine(
      subroutineName,
      subroutineArgs.map((arg) => this.fulfillments[arg] || arg), // Use fulfilled args
      variables,
      isAsync,
      isThread,
    );
    this.stack = this.stack.concat(result);
  }

  private async executeAssignment(
    assignmentOp: string,
    variables: Record<string, any>,
  ): Promise<any> {
    const { varName, value } =
      this.variableParser.parseAssignment(assignmentOp);
    const executionResult = await this.codeBlockExecutor.executeCodeBlocks(
      [
        SubroutineManager.createExecBlock(
          CoreBlocks.ExecAssig,
          "javascript",
          `${value};`,
        ),
      ],
      variables,
      this.stack,
    );
    const parsedValue = this.variableParser.parseValue(
      executionResult[0].value,
    );
    const stackItem = this.variableParser.updateVariables(varName, parsedValue);
    this.stack.push(stackItem);
    return parsedValue;
  }

  private async executeGeneralOperation(
    operation: string,
    variables: Record<string, any>,
  ): Promise<any> {
    const executionResult = await this.codeBlockExecutor.executeCodeBlocks(
      [
        SubroutineManager.createExecBlock(
          CoreBlocks.ExecGOp,
          "javascript",
          operation,
        ),
      ],
      variables,
      this.stack,
    );
    return executionResult[0].value;
  }
}
