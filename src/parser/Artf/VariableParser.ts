import { SubroutineManager } from "./SubroutineManager";
import { StackItem } from "./types";

export class VariableParser {
  private variables: Record<string, any> = {};

  parseVariable(variableDefinition: string): StackItem | null {
    const [assignmentOperator, name, ...valueParts] =
      variableDefinition.split(" ");
    let value: any;
    const valueStr = valueParts.join(" ");

    switch (assignmentOperator) {
      case "=#":
        value = this.parseValue(valueStr);
        break;
      case "=.":
        value = parseFloat(valueStr);
        break;
      case "=$":
        value = valueStr.match(/^".*"$/) ? JSON.parse(valueStr) : valueStr;
        break;
      case "=]":
        value = this.parseArray(valueParts);
        break;
      default:
        return null;
    }

    this.variables[name] = value;
    return SubroutineManager.createVariableStackItem(name, value);
  }

  parseAssignment(line: string): { varName: string; value: any } {
    const [varName, ...expression] = line.split(" ");
    const value = expression.join(" ");
    return { varName, value };
  }

  parseValue(value: string): any {
    if (value === "true") return true;
    if (value === "false") return false;
    if (value === "null") return null;
    if (!isNaN(Number(value))) return Number(value);
    if (value.startsWith('"') && value.endsWith('"')) return value.slice(1, -1);
    return value;
  }

  parseArray(values: string[]): any[] {
    return values.map(this.parseValue.bind(this));
  }

  updateVariables(name: string, value: any): StackItem {
    this.variables[name] = value;
    return SubroutineManager.createVariableStackItem(name, value);
  }

  getVariables(): Record<string, any> {
    return this.variables;
  }
}
