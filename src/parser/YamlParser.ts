import { NOOP } from "cowcst";
import { COWFEnvScope, COWFParseResult } from "../types/COWFTypes";

export type YamlParserKeys = {
  [key: string]: any;
};

export type YamlParserResult = COWFParseResult<YamlParserKeys>;
export type YamlParserEnv = COWFEnvScope<YamlParserResult[]>;

export class YamlParser {
  constructor(public ENV: () => Record<string, any> = NOOP) {
    this.setupScope();
  }

  setupScope(): YamlParserEnv {
    return (this.ENV().yaml ||= YamlParser.createEnvScope());
  }

  pushToScope(content: YamlParserResult): YamlParserResult {
    this.setupScope().value.push(content);
    return content;
  }

  static ext = "yaml";
  static createEnvScope(): YamlParserEnv {
    return {
      scope: this.ext,
      value: [],
    };
  }

  parse(content: string): YamlParserResult {
    const lines = content.trim().split("\n");
    const result: YamlParserKeys = {};
    let currentObject: YamlParserKeys = result;
    let indentStack: YamlParserKeys[] = [result];
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
            currentObject = indentStack.pop() as YamlParserKeys;
            currentIndent -= 2;
          }
        }

        currentObject[key] = this.parseValue(value);
        currentIndent = indentLevel;
      }
    }

    return this.pushToScope({
      format: YamlParser.ext,
      content: result,
    });
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
