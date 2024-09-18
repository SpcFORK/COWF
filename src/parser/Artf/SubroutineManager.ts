import {
  ExecutableBlock,
  StackItem,
  Subroutine,
  SubroutineParam,
  Block,
  StackType,
  CoreBlocks,
} from "./types";
import { VariableParser } from "./VariableParser";
import { OperationParser } from "./OperationParser";
import { CodeBlockExecutor } from "./CodeBlockExecutor";

export class SubroutineManager {
  private stack: StackItem[] = [];
  private maxRecursionDepth: number = 100;
  private subroutines: Record<string, Subroutine> = {};

  private variableParser: VariableParser;
  private operationParser: OperationParser;
  private codeBlockExecutor: CodeBlockExecutor;

  static createSubroutine(
    isAsync: boolean,
    isThread: boolean,
    subroutineName: string,
  ): StackItem {
    switch (true) {
      case isThread:
        return this.createStackItem(StackType.thread, subroutineName);
      case isAsync:
        return this.createStackItem(StackType.asyncSubroutine, subroutineName);
      default:
        return this.createStackItem(StackType.subroutine, subroutineName);
    }
  }

  static createExecBlock(
    name: any,
    language: string,
    code: string,
    args = "",
  ): ExecutableBlock {
    return { name, args, language, code };
  }

  static createStackItem(type: StackType, value: string): StackItem {
    return { type, value };
  }

  static createVariableStackItem(name: string, value: any): StackItem {
    return this.createStackItem(
      StackType.variable,
      `${name} = ${JSON.stringify(value)}`,
    );
  }

  static createReturnStackItem(value: any): StackItem {
    return this.createStackItem(StackType.return, value);
  }

  static createOperationStackItem(value: any): StackItem {
    return this.createStackItem(StackType.operation, value);
  }

  static createCodeBlock(value: string): StackItem {
    return this.createStackItem(StackType.code_block, value);
  }

  static createAssignmentStackItem(value: string): StackItem {
    return this.createStackItem(StackType.assignment, value);
  }

  constructor() {
    this.variableParser = new VariableParser();
    this.operationParser = new OperationParser();
    this.codeBlockExecutor = new CodeBlockExecutor(undefined, this);
  }

  parseSubroutineDefinition(definition: string): void {
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

      const name = parts.shift()!;
      const params: SubroutineParam[] = parts.map((param) => {
        const [paramName, defaultValue] = param.split("=");
        return { name: paramName, default: defaultValue };
      });

      this.subroutines[name] = {
        language: "artf", // Default language
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
            } else {
              throw new Error("Single line routine is missing code.");
            }
          } else {
            this.addSingleLineRoutine(name, singleLineRoutine);
          }
        } else if (trimmedLine && !trimmedLine.startsWith("---")) {
          this.addLineToSubroutine(name, trimmedLine);
        }

        i++;
      }
    }
  }

  addLineToSubroutine(subroutineName: string, line: string): void {
    const subroutine = this.subroutines[subroutineName];
    if (!subroutine) {
      throw new Error(`Subroutine '${subroutineName}' not found`);
    }
    subroutine.code += line + "\n";
  }

  addSingleLineRoutine(subroutineName: string, line: string): void {
    this.addLineToSubroutine(subroutineName, `<= ${line}`);
  }

  async executeSubroutine(
    name: string,
    args: any[],
    variables: Record<string, any>,
    isAsync: boolean,
    isThread: boolean,
  ): Promise<StackItem[]> {
    const subroutine = this.getSubroutine(name);

    if (!subroutine) {
      throw new Error(`Subroutine '${name}' not found`);
    }

    const localVariables = { ...variables };
    const stack: StackItem[] = [];

    // Assign arguments to parameters
    subroutine.params.forEach((param, index) => {
      const value = index < args.length ? args[index] : param.default;
      if (value === undefined) {
        throw new Error(
          `Missing argument for parameter '${param.name}' in subroutine '${name}'`,
        );
      }
      localVariables[param.name] = value;
      stack.push(SubroutineManager.createVariableStackItem(param.name, value));
    });

    const lines = subroutine.code.split("\n");
    async function doOrWait<T>(cb: () => T): Promise<T> {
      if (isAsync) return await cb();
      else if (isThread)
        // Run as a thread
        return new Promise((res) => setTimeout(async () => res(await cb())));
      else return cb();
    }

    for (const line of lines) {
      const operation = this.operationParser.parseOperation(line.trim());
      stack.push(operation);
    }
  
    // Handle each operation on the stack
    while (stack.length > 0) {
      const operation = stack.pop();
      if (!operation) continue;

      switch (operation.type) {
        case StackType.subroutine:
        case StackType.asyncSubroutine:
        case StackType.thread:
          const nestedResult = await doOrWait(() =>
            this.executeSubroutineCall(
              operation.value,
              localVariables,
              operation.type === StackType.asyncSubroutine,
              operation.type === StackType.thread,
            ),
          );
          stack.push(...nestedResult);
          break;
        case StackType.assignment:
          const assignmentResult = await doOrWait(() =>
            this.executeAssignment(operation.value, localVariables),
          );
          stack.push(
            SubroutineManager.createVariableStackItem(
              operation.value,
              assignmentResult,
            ),
          );
          break;
        case StackType.general:
          const generalResult = await doOrWait(() =>
            this.executeGeneralOperation(operation.value, localVariables),
          );
          stack.push(SubroutineManager.createOperationStackItem(generalResult));
          break;
        case StackType.return:
          stack.push(SubroutineManager.createReturnStackItem(operation.value));
          return stack;
        default:
          console.warn(`Unknown operation type: ${(operation as any).type}`);
      }
    }
    return stack;
  }

  private async executeSubroutineCall(
    subroutineCall: string,
    variables: Record<string, any>,
    isAsync: boolean,
    isThread: boolean,
  ): Promise<StackItem[]> {
    const [subroutineName, args] = subroutineCall.split(":");
    const subroutineArgs = args ? args.split(",") : [];
    const stackRes = SubroutineManager.createSubroutine(
      isAsync,
      isThread,
      subroutineName,
    );

    if (stackRes) this.stack.push(stackRes);
    const result = await this.executeSubroutine(
      subroutineName,
      subroutineArgs,
      variables,
      isAsync,
      isThread,
    );
    return result;
  }

  private async executeAssignment(
    assignmentOp: string,
    variables: Record<string, any>,
  ): Promise<any> {
    const [varName, ...expression] = assignmentOp.split(" ");
    const [executionResult] = await this.codeBlockExecutor.executeCodeBlocks(
      [
        SubroutineManager.createExecBlock(
          CoreBlocks.Assignment,
          "javascript",
          expression.join(" "),
        ),
      ],
      variables,
      this.stack,
    );
    const value = this.variableParser.parseValue(executionResult.value);
    this.variableParser.updateVariables(varName, value);
    return value;
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

  getSubroutineName(line: string): string {
    return line.slice(3).trim().split(" ")[0];
  }

  getSubroutine(name: string): Subroutine | undefined {
    return this.subroutines[name];
  }

  getAllSubroutines(): Record<string, Subroutine> {
    return { ...this.subroutines };
  }
}
