import { SubroutineManager } from "./SubroutineManager";
import { StackItem, StackType } from "./types";

export class OperationParser {
  private operations: string[] = [];
  parseOperationLine(
    line: string,
    stack: StackItem[],
    isAsync: boolean = false,
  ): void {
    const subCall = line.startsWith(":>");
    const asyncCall = line.startsWith("$>");
    if (subCall || asyncCall) {
      const parts = line.slice(2).trim().split(/\s+/);
      const name = parts.shift();
      const args = parts.join(",");
      let kind = StackType.subroutine;
      if (asyncCall) kind = StackType.asyncSubroutine;
      if (!name) {
        throw new Error("Subroutine name is missing");
      }
      const operation = `${kind}:${name}:${args}`;
      stack.push(SubroutineManager.createOperationStackItem(operation));
      this.operations.push(operation);
    } else if (line.startsWith("<=")) {
      const operation = line;
      stack.push(
        SubroutineManager.createStackItem(
          StackType.assignment,
          operation.slice(2).trim(),
        ),
      );
      this.operations.push(operation);
    } else {
      stack.push(SubroutineManager.createOperationStackItem(line));
      this.operations.push(line);
    }
  }
  // New method for chained operations
  chainOperation(operation: string): this {
    this.operations.push(operation);
    return this;
  }
  parseOperation(operation: string): StackItem {
    let label = (t: any) => `${t}:`;
    const thdLabel = label(StackType.thread);
    const subLabel = label(StackType.subroutine);
    const asyLabel = label(StackType.asyncSubroutine);
    if (operation.startsWith(subLabel)) {
      return SubroutineManager.createStackItem(
        StackType.subroutine,
        operation.slice(subLabel.length),
      );
    } else if (operation.startsWith(asyLabel)) {
      return SubroutineManager.createStackItem(
        StackType.asyncSubroutine,
        operation.slice(asyLabel.length),
      );
    } else if (operation.startsWith(thdLabel)) {
      return SubroutineManager.createStackItem(
        StackType.thread,
        operation.slice(thdLabel.length),
      );
    } else if (operation.startsWith("<=")) {
      return SubroutineManager.createStackItem(
        StackType.assignment,
        operation.slice(2).trim(),
      );
    } else {
      return SubroutineManager.createStackItem(StackType.general, operation);
    }
  }
  getOperations(): string[] {
    return this.operations;
  }
}
