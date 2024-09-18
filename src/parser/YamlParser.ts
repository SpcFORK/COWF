import { NOOP } from "cowcst";
import { COWFEnvScope, COWFParseResult } from "../types/COWFTypes";

export class YamlParser {
  constructor(public ENV: () => Record<string, any> = NOOP) {
    ENV().yaml ||= YamlParser.createEnvScope();
  }

  static createEnvScope(): COWFEnvScope<COWFParseResult<any>> {
    return {
      scope: "yaml",
      value: <any>[],
    };
  }

  parse(content: string): COWFParseResult {
    const lines = content.trim().split("\n");
    const result: { [key: string]: any } = {};
    let currentObject: { [key: string]: any } = result;
    let indentStack: { [key: string]: any }[] = [result];
    let currentIndent = 0;

    for (const line of lines) {
      if (line.trim().startsWith("#")) continue; // Skip comments

      const match = line.match(/^(\s*)(.+?):\s*(.*)$/);
      if (match) {
        const [, indent, key, value] = match;
        const indentLevel = indent.length;

        if (indentLevel > currentIndent) {
          indentStack.push(currentObject);
          currentObject = currentObject[
            Object.keys(currentObject).pop() as string
          ] = {};
        } else if (indentLevel < currentIndent) {
          while (indentLevel < currentIndent) {
            currentObject = indentStack.pop() as { [key: string]: any };
            currentIndent -= 2;
          }
        }

        currentObject[key] = this.parseValue(value);
        currentIndent = indentLevel;
      }
    }

    return {
      format: "yaml",
      content: result,
    };
  }

  private parseValue(value: string): any {
    if (value === "") return null;
    if (value === "true") return true;
    if (value === "false") return false;
    if (value === "null") return null;
    if (!isNaN(Number(value))) return Number(value);
    if (value.startsWith('"') && value.endsWith('"')) return value.slice(1, -1);
    return value;
  }
}
